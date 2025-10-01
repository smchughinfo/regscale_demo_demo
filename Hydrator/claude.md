# Claude's Hydrator Deployment Notes

## What We Did

### Problem
Tried to deploy Hydrator to Azure App Service using code deployment (ZIP upload). Azure failed to properly build the app - npm install issues, module conflicts between Node 18 (Kudu) and Node 22 (runtime), mysterious errors.

### Solution
Switched to **container deployment** - built our own Docker image and ran it in App Service.

## Steps Taken

### 1. Updated hydration.json baseUrl
**File:** `/Hydrator/hydration.json`
**Change:** `"baseUrl": "http://localhost:5000"` → `"baseUrl": "http://4.156.150.217"`
**Why:** Point to RegScale running in AKS instead of localhost

### 2. Created Dockerfile
**File:** `/Hydrator/Dockerfile`
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server.js ./
COPY Services ./Services
COPY frontend ./frontend
COPY hydration.json ./
EXPOSE 3001
CMD ["node", "server.js"]
```
**Why:** Define how to build the container image

### 3. Created .dockerignore
**File:** `/Hydrator/.dockerignore`
**Contents:** node_modules, .git, .md files, etc.
**Why:** Don't copy junk into the image

### 4. Built Docker Image
```bash
cd /Hydrator
docker build -t hydrator:latest .
```
**Result:** Image built successfully with all dependencies

### 5. Created Azure Container Registry (ACR)
```bash
az provider register --namespace Microsoft.ContainerRegistry
az acr create --resource-group regscale-demo-demo --name regscaleacr --sku Basic --location eastus
```
**Result:** `regscaleacr.azurecr.io`
**Cost:** ~$5/month (Basic tier)

### 6. Pushed Image to ACR
```bash
az acr login --name regscaleacr
docker tag hydrator:latest regscaleacr.azurecr.io/hydrator:latest
docker push regscaleacr.azurecr.io/hydrator:latest
```

### 7. Enabled ACR Admin User
```bash
az acr update -n regscaleacr --admin-enabled true
```
**Why:** App Service needs credentials to pull from ACR

### 8. Configured App Service to Use Container
```bash
az webapp config container set \
  --resource-group regscale-demo-demo-2 \
  --name hydrator \
  --container-image-name regscaleacr.azurecr.io/hydrator:latest \
  --container-registry-url https://regscaleacr.azurecr.io \
  --container-registry-user regscaleacr \
  --container-registry-password [from az acr credential show]
```

### 9. Set Container Port
```bash
az webapp config appsettings set \
  --resource-group regscale-demo-demo-2 \
  --name hydrator \
  --settings WEBSITES_PORT=3001
```
**Why:** Tell Azure which port the container listens on

### 10. Disabled Persistent Storage
```bash
az webapp config appsettings set \
  --resource-group regscale-demo-demo-2 \
  --name hydrator \
  --settings WEBSITES_ENABLE_APP_SERVICE_STORAGE=false
```
**Why:** Old code deployment left corrupted files in `/home/site/wwwroot`. This forces App Service to use only the container filesystem.

### 11. Restarted App Service
```bash
az webapp restart --resource-group regscale-demo-demo-2 --name hydrator
```

## Final Result

**URL:** https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net
**Status:** ✅ Running
**Container Image:** regscaleacr.azurecr.io/hydrator:latest
**RegScale Target:** http://4.156.150.217 (AKS)

## Key Files Created
- `/Hydrator/Dockerfile` - Container build definition
- `/Hydrator/.dockerignore` - Files to exclude from image

## Key Configuration Changes
- `hydration.json`: baseUrl updated to AKS RegScale IP
- App Service: Switched from code deployment to container deployment
- App Service: WEBSITES_PORT=3001
- App Service: WEBSITES_ENABLE_APP_SERVICE_STORAGE=false

## Resources Created
- **ACR:** regscaleacr.azurecr.io (regscale-demo-demo resource group)
- **Container Image:** regscaleacr.azurecr.io/hydrator:latest
- **App Service:** hydrator (regscale-demo-demo-2 resource group)

## Future Updates

To update the Hydrator:
1. Make code changes
2. Rebuild image: `docker build -t hydrator:latest .`
3. Tag: `docker tag hydrator:latest regscaleacr.azurecr.io/hydrator:latest`
4. Push: `docker push regscaleacr.azurecr.io/hydrator:latest`
5. Restart: `az webapp restart --resource-group regscale-demo-demo-2 --name hydrator`

Azure App Service will automatically pull the new image on restart.

## Cost
- **App Service (Basic B1):** ~$12/month
- **ACR (Basic):** ~$5/month
- **Total:** ~$17/month
