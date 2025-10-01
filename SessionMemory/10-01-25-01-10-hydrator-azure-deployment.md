# Session Memory: Hydrator Deployment to Azure App Service

**Date:** October 1, 2025 - 1:10 AM
**Topic:** Deploying RegScale Hydrator to Azure App Service using Docker containers

## Session Overview

**MISSION ACCOMPLISHED:** Successfully deployed the RegScale Hydrator to Azure App Service running as a Docker container. The app is now live at a public URL, connected to the AKS-hosted RegScale instance, and ready for production use.

**Live URL:** https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net

## What We Accomplished

### 1. Initial Attempt: Code Deployment to App Service (FAILED)

**Method:** ZIP deployment with code + package.json

**Steps Taken:**
1. Updated `hydration.json` baseUrl: `http://localhost:5000` → `http://4.156.150.217` (AKS RegScale)
2. Created deployment ZIP with necessary files
3. Deployed via `az webapp deploy --type zip`

**Problems Encountered:**
- Azure App Service build system (Oryx) failed to run `npm install` properly
- Module conflicts between Kudu (Node 18) and runtime (Node 22)
- Corrupted `node_modules` with errors like: "Unterminated string in JSON at position 141960" in mime-db/db.json
- Manual `npm install` via Kudu console didn't fix it
- App would not start after 20+ minutes of troubleshooting

**Decision:** Abandoned code deployment, pivoted to container deployment

### 2. Switched to Container Deployment (SUCCESS)

**Why Container Deployment:**
- Full control over build process
- Consistent environment (Node 22 everywhere)
- Easier to debug and reproduce
- No mysterious Azure build magic

### 3. Created Docker Infrastructure

**Files Created:**

**`/Hydrator/Dockerfile`:**
```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY server.js ./
COPY Services ./Services
COPY frontend ./frontend
COPY hydration.json ./

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
```

**`/Hydrator/.dockerignore`:**
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.vscode
*.md
.DS_Store
```

### 4. Created Azure Container Registry (ACR)

**Commands:**
```bash
# Register ACR provider (took ~2 minutes)
az provider register --namespace Microsoft.ContainerRegistry

# Create registry
az acr create \
  --resource-group regscale-demo-demo \
  --name regscaleacr \
  --sku Basic \
  --location eastus

# Enable admin user (for App Service auth)
az acr update -n regscaleacr --admin-enabled true
```

**Result:**
- **Registry:** regscaleacr.azurecr.io
- **Cost:** ~$5/month (Basic tier)
- **Location:** East US (same as RegScale AKS)

### 5. Built and Pushed Docker Image

**Commands:**
```bash
cd /Hydrator

# Build image
docker build -t hydrator:latest .

# Tag for ACR
docker tag hydrator:latest regscaleacr.azurecr.io/hydrator:latest

# Login to ACR
az acr login --name regscaleacr

# Push to registry
docker push regscaleacr.azurecr.io/hydrator:latest
```

**Build Time:** ~20 seconds (npm install took most of it)

### 6. Configured App Service for Container Deployment

**Initial App Service:**
- Already created (from failed code deployment attempt)
- Name: hydrator
- Resource Group: regscale-demo-demo-2
- Location: West Central US
- Tier: Basic B1 (~$12/month)

**Switched to Container Mode:**
```bash
# Configure container image
az webapp config container set \
  --resource-group regscale-demo-demo-2 \
  --name hydrator \
  --container-image-name regscaleacr.azurecr.io/hydrator:latest \
  --container-registry-url https://regscaleacr.azurecr.io \
  --container-registry-user regscaleacr \
  --container-registry-password [from az acr credential show]

# Set container port
az webapp config appsettings set \
  --resource-group regscale-demo-demo-2 \
  --name hydrator \
  --settings WEBSITES_PORT=3001

# Disable persistent storage (force container filesystem)
az webapp config appsettings set \
  --resource-group regscale-demo-demo-2 \
  --name hydrator \
  --settings WEBSITES_ENABLE_APP_SERVICE_STORAGE=false

# Restart app
az webapp restart \
  --resource-group regscale-demo-demo-2 \
  --name hydrator
```

**Why disable persistent storage?**
Old code deployment left corrupted files in `/home/site/wwwroot`. Setting `WEBSITES_ENABLE_APP_SERVICE_STORAGE=false` forces App Service to use only the container's filesystem.

### 7. Fixed WebSocket Security Error

**Problem:** Browser console error:
```
SecurityError: Failed to construct 'WebSocket': An insecure WebSocket connection may not be initiated from a page loaded over HTTPS.
```

**Root Cause:** Frontend hardcoded `ws://` protocol, but Azure App Service serves over HTTPS

**Fix in `/Hydrator/frontend/src/App.js`:**
```javascript
// Before
const wsUrl = `ws://${window.location.hostname}:3001`;

// After
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
const wsUrl = `${protocol}//${window.location.hostname}:${port}`;
```

**Result:** WebSocket works on both HTTP (localhost) and HTTPS (Azure)

### 8. Added Environment Variable Support for BaseURL

**Problem:**
- Local dev needs: `http://localhost:5000` (local RegScale)
- Production needs: `http://4.156.150.217` (AKS RegScale)
- `hydration.json` is baked into Docker image

**Solution:** Environment variable override

**Code Change in `/Hydrator/server.js`:**
```javascript
async function loadHydrationData() {
  try {
    const data = await fs.readFile(HYDRATION_FILE, 'utf8');
    hydrationData = JSON.parse(data);

    // Override baseUrl with environment variable if set
    if (process.env.REGSCALE_URL) {
      hydrationData.baseUrl = process.env.REGSCALE_URL;
      console.log(`Hydration data loaded - baseUrl overridden to: ${process.env.REGSCALE_URL}`);
    } else {
      console.log(`Hydration data loaded - using baseUrl from file: ${hydrationData.baseUrl}`);
    }
  } catch (error) {
    console.error('Error loading hydration data:', error);
  }
}
```

**Azure Configuration:**
```bash
az webapp config appsettings set \
  --resource-group regscale-demo-demo-2 \
  --name hydrator \
  --settings REGSCALE_URL=http://4.156.150.217
```

**Local Development:**
- No environment variable set
- Uses `baseUrl` from `hydration.json` (localhost:5000)
- Just run `npm start` normally

**Production:**
- `REGSCALE_URL` set in Azure
- Automatically overrides baseUrl on startup

### 9. Created Deployment Automation Script

**File:** `/StartStopScripts/update_hydrator.bat`

**What it does:**
1. Builds Docker image (Windows Docker Desktop)
2. Tags for ACR
3. Logs into ACR (via WSL)
4. Pushes to registry
5. Restarts App Service (via WSL)

**Usage:**
```cmd
C:\Users\seanm\Desktop\regscale_demo_demo\StartStopScripts\update_hydrator.bat
```

**Key Feature:** Uses `wsl` prefix for Azure CLI commands since `az` not installed in Windows

### 10. Fixed Bearer Token Issue (Final Bug)

**Problem:** All API calls returned 401 Unauthorized

**Root Cause:** Old expired bearer token baked into Docker image
- Token in image: `eyJ...` (expired Sep 29)
- Production token: `eyJ...` (expires Oct 1)

**Solution:** User updated bearer token in Hydrator UI with fresh token from AKS RegScale

**Result:** ✅ All API calls working!

## Final Architecture

### Azure Resources Created

**Resource Group:** regscale-demo-demo-2
- Location: West Central US (App Service quota workaround)

**Azure Container Registry:**
- Name: regscaleacr
- Location: East US
- SKU: Basic
- Login Server: regscaleacr.azurecr.io
- Admin Enabled: Yes
- Images: hydrator:latest

**App Service:**
- Name: hydrator
- Location: West Central US
- Runtime: Docker (regscaleacr.azurecr.io/hydrator:latest)
- Tier: Basic B1
- OS: Linux
- Node Version: 22 (in container)

**Cost Breakdown:**
- App Service (B1): ~$12/month
- ACR (Basic): ~$5/month
- **Total:** ~$17/month

### Integration with Existing Infrastructure

**Connects to:**
- RegScale AKS: http://4.156.150.217
- Azure SQL Database: regsale-db-server.database.windows.net (via RegScale)

**Network Flow:**
```
User Browser (HTTPS)
    ↓
Azure App Service (hydrator)
    ↓ HTTP
AKS RegScale (4.156.150.217)
    ↓
Azure SQL Database
```

## Key Files Modified/Created

### Created Files
- `/Hydrator/Dockerfile` - Container definition
- `/Hydrator/.dockerignore` - Build exclusions
- `/Hydrator/claude.md` - Technical deployment notes for Claude
- `/StartStopScripts/update_hydrator.bat` - Deployment automation script
- `/SessionMemory/10-01-25-01-10-hydrator-azure-deployment.md` - This file

### Modified Files
- `/Hydrator/hydration.json` - Reverted baseUrl to localhost:5000 (for local dev)
- `/Hydrator/server.js` - Added REGSCALE_URL environment variable support
- `/Hydrator/frontend/src/App.js` - Fixed WebSocket protocol detection
- `/Hydrator/README.md` - Added production URL and deployment instructions
- `/Azure/notes.md` - Added production bearer token

## Commands Reference

### Build and Deploy
```bash
# Full deployment (from Windows)
C:\Users\seanm\Desktop\regscale_demo_demo\StartStopScripts\update_hydrator.bat

# Manual steps
cd /Hydrator
docker build -t hydrator:latest .
docker tag hydrator:latest regscaleacr.azurecr.io/hydrator:latest
az acr login --name regscaleacr
docker push regscaleacr.azurecr.io/hydrator:latest
az webapp restart --resource-group regscale-demo-demo-2 --name hydrator
```

### Monitoring
```bash
# Check app status
az webapp show \
  --resource-group regscale-demo-demo-2 \
  --name hydrator \
  --query "state"

# View logs
az webapp log tail \
  --resource-group regscale-demo-demo-2 \
  --name hydrator

# Check app settings
az webapp config appsettings list \
  --resource-group regscale-demo-demo-2 \
  --name hydrator
```

### ACR Management
```bash
# List images
az acr repository list --name regscaleacr

# List tags
az acr repository show-tags \
  --name regscaleacr \
  --repository hydrator

# Get credentials
az acr credential show --name regscaleacr
```

## Lessons Learned

### 1. Azure App Service Code Deployment is Fragile
Azure's Oryx build system for Node.js apps is opaque and error-prone. Container deployment gives you full control and reproducibility.

### 2. Always Check Container Ports
App Service needs `WEBSITES_PORT` to know which port your container listens on. Without it, health checks fail.

### 3. WebSocket Protocol Must Match Page Protocol
If your page is HTTPS, WebSocket must be WSS. Always detect protocol dynamically.

### 4. Environment Variables > Baked Config
Use environment variables for anything that changes between dev/staging/production (URLs, credentials, etc.). Makes the same Docker image work everywhere.

### 5. Persistent Storage Can Cause Issues
When switching from code deployment to container deployment, old files in `/home/site/wwwroot` can conflict. Setting `WEBSITES_ENABLE_APP_SERVICE_STORAGE=false` forces clean container filesystem.

### 6. Bearer Tokens Expire
RegScale JWT tokens expire after 24 hours. Production deployments should either:
- Update token daily
- Use longer-lived tokens
- Implement token refresh logic

### 7. Windows + WSL + Azure CLI = Bridge Commands
When Azure CLI is only installed in WSL, use `wsl az ...` from Windows batch scripts to bridge the environments.

## Errors Encountered and Solutions

### Error 1: npm install Module Conflicts (Code Deployment)
**Error:** "Unterminated string in JSON" in mime-db/db.json
**Cause:** Node version mismatch between Kudu (18) and runtime (22)
**Solution:** Switched to container deployment with consistent Node 22

### Error 2: Container Registry Provider Not Registered
**Error:** "The subscription is not registered to use namespace 'Microsoft.ContainerRegistry'"
**Solution:** `az provider register --namespace Microsoft.ContainerRegistry` (took 2 minutes)

### Error 3: WebSocket Security Error
**Error:** "An insecure WebSocket connection may not be initiated from a page loaded over HTTPS"
**Cause:** Hardcoded `ws://` protocol in frontend
**Solution:** Dynamic protocol detection based on `window.location.protocol`

### Error 4: Container Won't Start (No Logs)
**Cause:** Old corrupted files in `/home/site/wwwroot` from previous deployment
**Solution:** Set `WEBSITES_ENABLE_APP_SERVICE_STORAGE=false`

### Error 5: 401 Unauthorized on API Calls
**Cause:** Expired bearer token baked into Docker image
**Solution:** Updated token in Hydrator UI with fresh token from RegScale

## Testing and Verification

### Verification Steps Completed
1. ✅ Container builds successfully
2. ✅ Image pushes to ACR
3. ✅ App Service pulls and starts container
4. ✅ Web UI loads at public URL
5. ✅ WebSocket connects (no browser errors)
6. ✅ Bearer token accepted
7. ✅ API calls to AKS RegScale succeed (200 responses)
8. ✅ Business Model Graph displays
9. ✅ Utility calls execute successfully
10. ✅ Results saved back to hydration.json

### Production Credentials

**RegScale AKS (Backend):**
- URL: http://4.156.150.217
- Username: seanmchugh1
- Password: 51mpl3Compliance$2

**Bearer Token (Production):**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjpbInNlYW5tY2h1Z2gxIiwic2Vhbm1jaHVnaDEiXSwiaWQiOiJkYjRhMDE1ZC03MmU3LTRiMDgtYTQ4Zi03NmI4MDRiYzc5ZTIiLCJyb2wiOiJhcGlfYWNjZXNzIiwic3ViIjoic2Vhbm1jaHVnaDEiLCJqdGkiOiJjMTI3ZDNkYS1kYmQzLTRjNGQtYTcwZi1hZmE4YTJiZmI3ZmMiLCJpYXQiOjE3NTkyODA3MDIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiZGI0YTAxNWQtNzJlNy00YjA4LWE0OGYtNzZiODA0YmM3OWUyIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9wcmltYXJ5Z3JvdXBzaWQiOiIxIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW5pc3RyYXRvciIsIm5iZiI6MTc1OTI4MDcwMiwiZXhwIjoxNzU5MzY3MTAyLCJpc3MiOiJSZWdTY2FsZSIsImF1ZCI6Imh0dHBzOi8vd3d3LnJlZ3NjYWxlLmlvLyJ9.EI4-KaIECT7mL9GvD5hGrTYg3WfBDgzhX3AuHhPYuts
```
- User: seanmchugh1
- Expires: October 1, 2025 (24 hours from issue)

## Current Infrastructure State

### RegScale Platform (AKS)
- **Status:** Running
- **URL:** http://4.156.150.217
- **Database:** Azure SQL (regsale-db-server.database.windows.net)
- **Namespace:** regscale
- **Cluster:** regscale-aks
- **Resource Group:** regscale-demo-demo

### Hydrator (App Service)
- **Status:** Running
- **URL:** https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net
- **Container:** regscaleacr.azurecr.io/hydrator:latest
- **Resource Group:** regscale-demo-demo-2
- **Environment:** REGSCALE_URL=http://4.156.150.217

### Container Registry (ACR)
- **Status:** Active
- **URL:** regscaleacr.azurecr.io
- **Images:** hydrator:latest
- **Resource Group:** regscale-demo-demo

## Next Steps

### Immediate (Session Complete)
- ✅ Hydrator deployed and functional
- ✅ Documentation complete
- ✅ Deployment automation in place

### Future Enhancements
1. **Token Management:**
   - Add REGSCALE_BEARER_TOKEN environment variable
   - Implement automatic token refresh
   - Use longer-lived service accounts

2. **Persistent Configuration:**
   - Mount Azure Files for hydration.json
   - Allow updates without redeployment

3. **Production Hardening:**
   - Enable HTTPS-only (already done by Azure)
   - Add custom domain
   - Configure Azure Front Door
   - Set up Application Insights

4. **CI/CD Pipeline:**
   - GitHub Actions workflow
   - Automatic deployment on git push
   - Separate dev/staging/prod environments

## Target Solution Architecture (TSA) - Updated

**✅ COMPLETED:**
- RegScale: Running in AKS at http://4.156.150.217
- Hydrator: Running in App Service at https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net
- Azure SQL: Connected to RegScale

**⏭️ NEXT PHASES:**
- Azure Functions: LangChain backend (serverless)
- App Service: ASP.NET frontend

## User Feedback

**User's Reaction:** "claude 👏 it 👏 is 👏 working !"

**Session Vibe:** High energy problem-solving with multiple pivots. Started with code deployment failure, pivoted to containers, debugged WebSocket and environment config issues, finally achieved full functionality. User appreciated the systematic troubleshooting and persistence.

## Session Status

✅ **MISSION ACCOMPLISHED:** Hydrator fully deployed and operational in Azure
🌐 **Production URL:** https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net
🔗 **Connected to:** RegScale AKS (http://4.156.150.217)
📊 **Status:** All API calls working, Business Model Graph rendering

---

**End of Session Memory**

**FOR POST-COMPACTION CLAUDE:**

Hydrator LIVE in Azure App Service as Docker container! URL: https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net. Built custom Dockerfile (Node 22-alpine), pushed to ACR (regscaleacr.azurecr.io), configured App Service for container deployment. Fixed WebSocket protocol detection (ws:/wss: based on HTTPS), added environment variable support for baseUrl (REGSCALE_URL=http://4.156.150.217 in Azure, localhost:5000 local). Created update_hydrator.bat script for redeployment. Working in regscale-demo-demo-2 resource group. Bearer token expires daily (24h JWT). All API calls functional, connected to AKS RegScale.
