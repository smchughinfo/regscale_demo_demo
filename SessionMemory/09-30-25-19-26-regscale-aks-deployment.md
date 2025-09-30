# Session Memory: RegScale AKS Deployment - MISSION ACCOMPLISHED
**Date:** September 30, 2025 - 7:26 PM
**Topic:** Deploying RegScale to Azure Kubernetes Service (AKS) with Azure SQL Database

## Session Overview
**MAJOR MILESTONE ACHIEVED:** RegScale is now running in the cloud on Azure! We successfully deployed the full RegScale GRC platform to AKS, connected it to Azure SQL Database, and exposed it via a public IP address. This marks the completion of Phase 1 of our cloud migration.

## What We Accomplished

### 1. Created Azure SQL Database
**Resource:** `regscale` database on server `regsale-db-server.database.windows.net`

**Configuration:**
- **Service Tier:** General Purpose (Serverless) - cost-optimized for dev/test
- **Compute:** Auto-scaling (pay only when active)
- **Authentication:** SQL Server authentication
- **Admin User:** superuser123
- **Password:** 51mpl3Compliance$2
- **Networking:** Public endpoint with connection policy allowing Azure services
- **Firewall:** Client IP whitelisted for local management via SSMS

**Initial Cost:** ~$5/month (serverless, only active when RegScale runs queries)

**Verification:** Successfully connected via SQL Server Management Studio - database empty, ready for RegScale to create schema.

### 2. Downloaded RegScale Kubernetes Manifests
**Files obtained from RegScale community repo:**
- `azure-file-csi-sc.yaml` - Azure Files storage class (later abandoned)
- `regscale-azure-pvc.yaml` - Persistent Volume Claim
- `regscale-secrets.yaml` - Database credentials and encryption keys
- `regscale-deploy.yaml` - Main deployment manifest

### 3. Created RegScale Namespace
```bash
kubectl create namespace regscale
```

**Why:** Isolates RegScale resources from other cluster workloads.

### 4. Storage Challenge: Azure Files TLS Policy Conflict

**Problem Encountered:**
Azure File CSI driver repeatedly failed with error:
```
rpc error: code = Internal desc = failed to ensure storage account:
failed to create storage account..., error: authenticated requests are
not permitted for non TLS protected (https) endpoints
```

**Root Cause:** Azure subscription has a policy requiring secure transfer (HTTPS-only) on storage accounts. The CSI driver's storage account creation logic conflicted with this policy.

**Attempts Made:**
1. Used default `azurefile-csi` StorageClass - FAILED (TLS error)
2. Created custom StorageClass with `enableHttpsTrafficOnly` parameter - FAILED (invalid parameter)
3. Tried various StorageClass configurations - All FAILED

**Solution:** Switched from Azure Files to **Azure Disk**
- **Why it worked:** Azure Disk doesn't create storage accounts, just attaches managed disks to nodes
- **Tradeoff:** ReadWriteOnce (RWO) instead of ReadWriteMany (RWX) = limited to 1 RegScale replica
- **Good enough for:** Dev/test and initial deployment

**Final PVC Configuration:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: regscale-files
  namespace: regscale
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: managed-csi  # Azure Disk
  resources:
    requests:
      storage: 10Gi
```

**Result:** PVC bound successfully in ~11 seconds ✅

### 5. Created Kubernetes Secrets

**File:** `regscale-secrets.yaml`

**Contents:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: secrets-regscale
  namespace: regscale
type: Opaque
stringData:
  JWTSecretKey: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  SQLConn: "Server=tcp:regsale-db-server.database.windows.net,1433;Initial Catalog=regscale;Persist Security Info=False;User ID=superuser123;Password=51mpl3Compliance$2;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=True;Connection Timeout=30;"
  EncryptionKey: "q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1"
```

**Note:** JWT and Encryption keys are placeholders for dev/test. Production should use proper key generation.

### 6. Deployed RegScale Application

**Initial Deployment:**
```bash
kubectl apply -f regscale-deploy.yaml
```

**Components Created:**
- **ConfigMap:** `config-regscale` (file storage path, size limits)
- **Deployment:** `deployment-regscale` (1 replica, regscale/regscale:latest image)
- **Service:** `service-regscale` (initially NodePort, later changed to LoadBalancer)

**Pod Status:** Started successfully, logs showed:
```
Startup completed in 00:00:02
Seeding completed for Tenant #1
RegScale startup completed.
```

### 7. Exposed RegScale via LoadBalancer

**Service Type Change:** NodePort → LoadBalancer

**Result:** Azure provisioned public IP: **4.156.150.217**

### 8. Fixed Port Mapping Issue

**Problem:** Browser showed "ERR_CONNECTION_REFUSED" when accessing http://4.156.150.217

**Investigation:**
```bash
kubectl exec deployment-regscale-59588ffb56-jf5zc -n regscale -- netstat -tuln | grep 80
tcp        0      0 :::8080                 :::*                    LISTEN
```

**Root Cause:** RegScale container listens on port 8080, but service was routing to port 80.

**Fix:** Updated `regscale-deploy.yaml`:
```yaml
# Deployment
ports:
  - containerPort: 8080  # Changed from 80

# Service
ports:
  - port: 80            # External port (what users hit)
    targetPort: 8080    # Internal pod port (where RegScale listens)
    protocol: TCP
```

**Result:** ✅ RegScale accessible at http://4.156.150.217

### 9. Verification and Success

**Pod Status:**
```bash
NAME                                   READY   STATUS    RESTARTS   AGE
deployment-regscale-59588ffb56-jf5zc   1/1     Running   0          12m
```

**Service Status:**
```bash
NAME               TYPE           CLUSTER-IP   EXTERNAL-IP     PORT(S)        AGE
service-regscale   LoadBalancer   10.0.24.27   4.156.150.217   80:32489/TCP   17m
```

**Database:** RegScale successfully seeded Tenant #1 data into Azure SQL Database

**Browser Access:** RegScale UI loads successfully at public IP ✅

## Technical Decisions Made

### Azure SQL Database: Serverless vs Provisioned
**Decision:** Serverless compute tier
**Reasoning:**
- Initial quote for General Purpose (2 vCores) was $372.97/month - "raping us on the price"
- Serverless auto-scales and only charges when active
- Perfect for dev/test workloads
- Estimated cost: ~$5/month vs $373/month

### Storage: Azure Files vs Azure Disk
**Decision:** Azure Disk (managed-csi)
**Reasoning:**
- Azure Files blocked by subscription TLS policy
- Azure Disk "just works" without storage account creation
- ReadWriteOnce limitation acceptable for single-replica dev deployment
- Can revisit Azure Files for production (manually create storage account with correct settings)

### Service Type: NodePort vs LoadBalancer
**Decision:** LoadBalancer
**Reasoning:**
- User wanted public IP for accessing from App Services and Azure Functions
- "lets not get fancy" - keep it simple
- LoadBalancer gives clean public IP without complex ingress setup
- Good enough for dev/test

### Port Mapping Discovery
**Method:** Used `kubectl exec` with `netstat` to discover actual listening port
**Why:** Deployment manifest assumed port 80, but RegScale actually uses 8080
**Lesson:** Always verify container ports before assuming defaults

## Key Files and Locations

### Local Project Files
- `/Azure/AKS/azure-file-csi-sc.yaml` - Azure Files storage class (not used)
- `/Azure/AKS/regscale-azure-pvc.yaml` - Original Azure Files PVC (replaced)
- `/Azure/AKS/regscale-disk-pvc.yaml` - Azure Disk PVC (final, working)
- `/Azure/AKS/regscale-storageclass.yaml` - Custom storage class attempt (not used)
- `/Azure/AKS/regscale-secrets.yaml` - Database credentials and keys
- `/Azure/AKS/regscale-deploy.yaml` - Main deployment manifest (modified)
- `/Azure/AKS/template.json` - AKS cluster ARM template (from previous session)
- `/Azure/notes.md` - Azure resource credentials and IPs

### Azure Resources
**Resource Group:** `regscale-demo-demo`
**Region:** East US

**AKS Cluster:**
- Name: `regscale-aks`
- Kubernetes Version: 1.32.7
- Nodes: 1 running (can scale 2-5)
- Node Type: Standard_DS2_v2

**SQL Database:**
- Server: `regsale-db-server.database.windows.net`
- Database: `regscale`
- Admin: `superuser123`
- Password: `51mpl3Compliance$2`

**RegScale Deployment:**
- Public IP: `4.156.150.217`
- URL: http://4.156.150.217
- Namespace: `regscale`
- Pod: `deployment-regscale-59588ffb56-jf5zc`
- Service: `service-regscale` (LoadBalancer)

## Commands Reference

### Useful kubectl Commands Used
```bash
# Check cluster nodes
kubectl get nodes

# Work with regscale namespace
kubectl get pods -n regscale
kubectl get svc -n regscale
kubectl get pvc -n regscale

# Watch resources (wait for changes)
kubectl get pvc -n regscale -w

# Detailed troubleshooting
kubectl describe pod <pod-name> -n regscale
kubectl describe pvc <pvc-name> -n regscale
kubectl describe svc <service-name> -n regscale

# View logs
kubectl logs <pod-name> -n regscale
kubectl logs <pod-name> -n regscale --tail=50

# Execute commands in pod
kubectl exec <pod-name> -n regscale -- <command>

# Apply manifests
kubectl apply -f <filename>.yaml

# Delete resources
kubectl delete pvc <pvc-name> -n regscale
kubectl delete pod <pod-name> -n regscale
```

## Errors Encountered and Solutions

### Error 1: PVC Name Mismatch
**Error:** Pod stuck in Pending state
```
persistentvolumeclaim "files-regscale" not found
```
**Root Cause:** Deployment expected `files-regscale` but PVC was named `regscale-files`
**Fix:** Updated `regscale-deploy.yaml` claimName from `files-regscale` to `regscale-files`

### Error 2: Azure Files TLS Policy Conflict
**Error:**
```
failed to ensure storage account: failed to create storage account...,
error: authenticated requests are not permitted for non TLS protected (https) endpoints
```
**Root Cause:** Azure subscription policy requires HTTPS-only on storage accounts, CSI driver creation conflicted
**Attempted Fixes:**
- Custom StorageClass with TLS parameters (parameters invalid)
- Various StorageClass configurations (all failed)
**Final Solution:** Switched to Azure Disk (managed-csi) which doesn't create storage accounts

### Error 3: Invalid StorageClass Parameters
**Error:**
```
invalid parameter "requireInfrastructureEncryption" in storage class
invalid parameter "enableHttpsTrafficOnly" in storage class
```
**Root Cause:** These parameters don't exist in Azure File CSI driver
**Fix:** Removed invalid parameters, eventually switched to Azure Disk

### Error 4: Connection Refused on Public IP
**Error:** Browser showed "ERR_CONNECTION_REFUSED" at http://4.156.150.217
**Root Cause:** Service routing port 80 → 80, but RegScale listens on 8080
**Investigation:** `kubectl exec` with `netstat -tuln | grep 80` revealed port 8080
**Fix:** Updated Service targetPort from 80 to 8080

## Lessons Learned

### 1. Azure Subscription Policies Can Block CSI Drivers
Azure Files CSI driver requires creating storage accounts. If subscription has secure transfer policies, this can fail. Azure Disk is more reliable for initial deployments.

### 2. Always Verify Container Listening Ports
Never assume a container listens on port 80 just because it's a web app. Use `kubectl exec` with `netstat` to verify actual ports.

### 3. Serverless SQL Database for Dev/Test
Azure SQL Database serverless tier is VASTLY cheaper than provisioned for dev/test. $5/month vs $373/month for similar capability when workload is intermittent.

### 4. ReadWriteOnce is Often Sufficient
Azure Disk (RWO) worked fine for single-replica deployment. Don't overcomplicate with ReadWriteMany (Azure Files) unless you actually need multi-replica scaling.

### 5. kubectl describe is Your Best Friend
Every error was diagnosed with `kubectl describe pod/pvc/svc`. The Events section shows exactly what's failing and why.

### 6. LoadBalancer Type is Simplest for Cloud Access
For Azure App Services and Functions to access AKS services, LoadBalancer with public IP is simpler than Ingress controllers. No need to "get fancy."

## Target Solution Architecture (TSA) - Current State

**✅ COMPLETED:**
- **AKS Cluster:** RegScale running at http://4.156.150.217
- **Azure SQL Database:** Connected and seeded with Tenant #1 data

**⏭️ NEXT STEPS:**
- **Azure Functions:** LangChain backend (serverless)
- **App Service:** ASP.NET frontend
- **App Service:** Hydrator (Node.js + React)

**Integration Points:**
- App Services/Functions will hit RegScale at http://4.156.150.217
- All services in same resource group (`regscale-demo-demo`)
- All services in same region (East US)

## Current Cluster State

**Namespaces:**
- `default` - Empty
- `regscale` - RegScale deployment
- `kube-system` - Kubernetes system components

**RegScale Namespace Resources:**
```
NAME                                   READY   STATUS    RESTARTS   AGE
pod/deployment-regscale-59588ffb56-jf5zc   1/1     Running   0          12m

NAME                       TYPE           CLUSTER-IP   EXTERNAL-IP     PORT(S)
service/service-regscale   LoadBalancer   10.0.24.27   4.156.150.217   80:32489/TCP

NAME                                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/deployment-regscale   1/1     1            1           15m

NAME             STATUS   VOLUME                                     CAPACITY   ACCESS MODES
pvc/regscale-files   Bound    pvc-df61ca13-a3ab-4f37-a61c-689c0defd020   10Gi       RWO

NAME                      DATA   AGE
configmap/config-regscale   2      15m

NAME                     TYPE     DATA   AGE
secret/secrets-regscale   Opaque   3      15m
```

**Storage:**
- PVC: `regscale-files` (10Gi, Bound to Azure Disk)
- PV: Auto-provisioned by managed-csi StorageClass

**Networking:**
- Service Type: LoadBalancer
- External IP: 4.156.150.217
- External Port: 80
- Internal Port: 8080
- NodePort: 32489

## Cost Tracking

**Current Monthly Estimate:**
- **AKS Control Plane:** $0 (Free tier)
- **AKS Nodes:** ~$70/month (1x Standard_DS2_v2, can scale to 5)
- **Azure SQL Database:** ~$5/month (Serverless, minimal activity)
- **Azure Disk:** ~$2/month (10Gi Standard_LRS)
- **Load Balancer:** ~$5/month (Standard tier)
- **Egress/Bandwidth:** Variable (minimal for dev/test)

**Total:** ~$82/month baseline, can spike to ~$350/month if all 5 nodes scale up

**Budget:** $200 free Azure credits available

## Next Session Checklist

When resuming work:

**1. Verify RegScale is Still Running:**
```bash
kubectl get pods -n regscale
kubectl get svc -n regscale
```

**2. Check Public IP (in case it changed):**
```bash
kubectl get svc service-regscale -n regscale -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

**3. Test RegScale API:**
```bash
curl http://4.156.150.217/swagger/index.html
```

**4. Next Deployment Steps:**
- Deploy Hydrator to Azure App Service
- Update Hydrator config to point to http://4.156.150.217
- Deploy LangChain backend to Azure Functions
- Deploy ASP.NET frontend to App Service

## Important Notes for Future Claude

**Storage Limitation:**
Current deployment uses Azure Disk (ReadWriteOnce). This means:
- ✅ Works great for 1 replica
- ❌ Cannot scale beyond 1 replica (RWO = only one pod can mount)
- 🔄 To scale: Need to fix Azure Files (manually create storage account with HTTPS enabled)

**Database Connection:**
RegScale is using Azure SQL Database. Connection string is in `regscale-secrets.yaml`. If you need to update database settings, edit the secret and restart the pod.

**Public IP Stability:**
LoadBalancer IP (4.156.150.217) should be stable, but could change if service is deleted/recreated. For production, use Azure DNS with static IP.

**Port Configuration:**
RegScale container listens on 8080. Service maps external:80 → internal:8080. Don't change this without updating both Service and Deployment.

## User Feedback

**User's Reaction:** "claude you did it you magnificant bastard!"

**Session Vibe:** High energy, problem-solving, iterative debugging. User appreciated the systematic troubleshooting approach and perseverance through multiple storage failures.

## Session Status
✅ **MISSION ACCOMPLISHED:** RegScale running in AKS with Azure SQL Database
🌐 **Public Access:** http://4.156.150.217
⏭️ **Next Phase:** Deploy Hydrator, LangChain, and Frontend to Azure App Services/Functions

---

**End of Session Memory**

**FOR POST-COMPACTION CLAUDE:**
RegScale is LIVE in Azure! Running at http://4.156.150.217 on AKS cluster `regscale-aks`. Azure SQL Database connected (server: regsale-db-server.database.windows.net, db: regscale, user: superuser123). Using Azure Disk storage (RWO, 1 replica only). LoadBalancer service exposes port 80 → 8080. Next: Deploy Hydrator, LangChain, Frontend to App Services/Functions. All working in resource group `regscale-demo-demo`, East US region. Working in WSL, kubectl configured.
