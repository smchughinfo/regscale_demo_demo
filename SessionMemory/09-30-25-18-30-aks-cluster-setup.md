# Session Memory: AKS Cluster Setup and Azure Deployment Planning
**Date:** September 30, 2025 - 6:30 PM
**Topic:** Setting up Azure Kubernetes Service (AKS) for RegScale deployment

## Session Overview
This session marked a major milestone: taking RegScale to the cloud. We successfully created an AKS cluster and prepared for deploying the full RegScale GRC platform to Azure. This is the first step in our cloud migration strategy.

## Target Solution Architecture (TSA) - THE PLAN

**Cloud Infrastructure (Azure):**
- **AKS (Azure Kubernetes Service)**: RegScale GRC platform ← **CURRENTLY WORKING ON THIS**
- **Azure Functions**: LangChain backend (serverless, pay-per-execution)
- **App Service**: ASP.NET frontend
- **App Service**: Hydrator (Node.js + React)
- **Azure SQL Database**: RegScale database (required for K8s deployment)
- **Resource Group**: `regscale-demo-demo`
- **Region**: East US

**Budget:** $200 free Azure credits available

## What We Accomplished

### 1. Understanding RegScale Kubernetes Deployment Requirements
**Documentation Review:** https://regscale.readme.io/docs/kubernetes-deployment

**Key Requirements Identified:**
- Kubernetes cluster (cloud or self-hosted) ✅
- Microsoft SQL Server instance ❌ (NOT YET CREATED - NEXT STEP)
- Persistent storage class with ReadWriteMany support ✅ (YAML ready)
- Docker Hub or internal container registry access ✅

**Deployment Files Located:**
- Storage class: https://github.com/RegScale/community/blob/main/kubernetes/azure-file-csi-sc.yaml
- Will need: regscale-secrets.yaml (database connection)
- Will need: regscale-deploy.yaml (main deployment)

### 2. Azure File CSI StorageClass Analysis
**File:** `azure-file-csi-sc.yaml` from RegScale community repo

**What it does:**
Creates a StorageClass that RegScale PersistentVolumeClaims can use to get Azure File shares mounted into pods.

**Key Settings:**
```yaml
provisioner: file.csi.azure.com
reclaimPolicy: Retain  # Won't delete data if PVC deleted
allowVolumeExpansion: true  # Can grow volumes later
parameters:
  skuName: Premium_LRS  # Fast SSD-backed storage
mountOptions:
  - dir_mode=0640
  - file_mode=0640
  - uid=0
  - gid=0
```

**Considerations:**
- Premium_LRS is expensive - might want Standard_LRS for dev/test
- Mount options are restrictive - may need adjustment for RegScale container

### 3. AKS Cluster Creation (COMPLETED)

**Method:** Azure Portal UI (decided against CLI for first cluster to see all options)

**Resource Details:**
- **Cluster Name:** `regscale-aks`
- **Resource Group:** `regscale-demo-demo`
- **Region:** East US
- **Kubernetes Version:** 1.32.7 (latest stable)
- **Pricing Tier:** Free (only pay for nodes, not control plane)

**Configuration Highlights:**
- **Auto-upgrade:** Patch level (security patches automatically applied)
- **Node Pool:** 1 pool, Standard_DS2_v2 (2 vCPU, 7GB RAM), 2-5 nodes (auto-scaling)
- **Authentication:** Local accounts with Kubernetes RBAC
- **Network:** Azure CNI Overlay (modern, efficient)
- **Load Balancer:** Standard
- **OIDC + Workload Identity:** Enabled
- **Monitoring:** Disabled (cost savings for dev/test)
- **Private Cluster:** Disabled (easier access for dev)

**Template Saved:** `/Azure/AKS/template.json` (for future reference/automation)

**Deployment Time:** ~10 minutes

### 4. Developer Environment Setup

**Azure CLI Installation (WSL):**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**Initial Issue:** User tried to run curl command in PowerShell - won't work
**Solution:** Switch to WSL (`wsl` command in PowerShell)

**Azure Login:**
```bash
az login
```
- Opened browser for OAuth flow
- Selected Azure subscription 1 (bfb809f0-3e70-44c3-8b66-0ea2184c2114)
- Tenant: Default Directory

**Connect kubectl to AKS:**
```bash
az aks get-credentials --resource-group regscale-demo-demo --name regscale-aks
```

**Result:**
- Merged "regscale-aks" as current context in `/home/seanm/.kube/config`
- Warning about permissions (644) - should be 600 for security

**Verification:**
```bash
kubectl get nodes
```

**Output:**
```
NAME                          STATUS   ROLES    AGE     VERSION
aks-rap-40651441-vmss000000   Ready    <none>   9m45s   v1.32.7
```

✅ **SUCCESS!** Cluster is running with 1 node ready.

**Tools Confirmed:**
- kubectl: v1.32.2 ✅ (compatible with cluster v1.32.7)
- Azure CLI: v2.77.0 ✅

### 5. Current Cluster State

**What we have RIGHT NOW:**
- ✅ Control plane (managed by Azure)
- ✅ 1 worker node (ready, running system pods)
- ✅ System pods running:
  - kube-proxy (networking)
  - coredns (DNS)
  - azure-cni (networking)
  - metrics-server
  - Azure-specific components

**What we DON'T have yet:**
- ❌ StorageClass applied
- ❌ Azure SQL Database
- ❌ RegScale namespace
- ❌ RegScale secrets
- ❌ RegScale deployment
- ❌ PersistentVolumes/PersistentVolumeClaims
- ❌ Ingress/DNS configuration

## Next Steps (CRITICAL - READ THIS AFTER COMPACTION)

**IMMEDIATE NEXT STEPS:**

### Step 1: Create Azure SQL Database
RegScale requires SQL Server. Must create:
- Azure SQL Database instance
- Configure firewall rules
- Get connection string
- **Location:** Same region as AKS (East US) for performance

### Step 2: Apply StorageClass
```bash
kubectl apply -f https://raw.githubusercontent.com/RegScale/community/main/kubernetes/azure-file-csi-sc.yaml
```

### Step 3: Create RegScale Namespace
```bash
kubectl create namespace regscale
```

### Step 4: Configure Secrets
Create `regscale-secrets.yaml` with:
- Database connection string
- Any API keys/tokens needed
- Apply: `kubectl apply -f regscale-secrets.yaml`

### Step 5: Deploy RegScale
Download and apply RegScale deployment manifest:
```bash
kubectl apply -f regscale-deploy.yaml
```

### Step 6: Configure DNS/Ingress
- Set up Ingress controller (nginx or Azure Application Gateway)
- Configure DNS
- Set up SSL/TLS certificates

### Step 7: Verify Deployment
```bash
kubectl get pods -n regscale
kubectl get services -n regscale
kubectl logs -n regscale <pod-name>
```

## Technical Decisions Made

### UI vs CLI for Cluster Creation
**Decision:** Use Azure Portal UI
**Reasoning:**
- First time creating AKS cluster
- Wanted to see all available options
- Template provided for future automation
- CLI preferred for deployments to cluster

### Cost Optimization Choices
- Free AKS tier (only pay for nodes)
- Disabled monitoring (can enable later)
- Disabled Azure Policy
- Standard_DS2_v2 nodes (good balance for dev/test)
- Auto-scaling (2-5 nodes, only use what's needed)

### Development Environment
**Decision:** WSL/Linux instead of Windows PowerShell
**Reasoning:**
- kubectl and YAML work better in Linux
- Azure CLI installation smoother
- Most Kubernetes examples assume bash
- Consistent with production environments

## Important Files and Locations

**Local Project:**
- `/Azure/AKS/template.json` - AKS cluster template
- `/Hydrator/` - Will deploy to App Service later
- `/CLAUDE.md` - Updated with TSA

**Azure Resources:**
- Resource Group: `regscale-demo-demo`
- AKS Cluster: `regscale-aks`
- Subscription: `bfb809f0-3e70-44c3-8b66-0ea2184c2114`

**kubectl config:**
- `/home/seanm/.kube/config` - Contains AKS credentials
- Context: `regscale-aks`

**RegScale Documentation:**
- https://regscale.readme.io/docs/kubernetes-deployment
- https://github.com/RegScale/community/tree/main/kubernetes

## Key Concepts to Remember

### ReadWriteMany Storage
RegScale needs persistent storage that multiple pods can mount simultaneously. Azure Files with CSI driver provides this.

### SQL Server Requirement
RegScale is NOT stateless. It requires SQL Server database for persistence. This is separate from the AKS cluster and must be created.

### Deployment Order Matters
1. Create SQL Database first
2. Apply StorageClass
3. Create namespace
4. Create secrets (with DB connection)
5. Deploy RegScale
6. Configure ingress/DNS

### Cost Awareness
- AKS Free tier = $0 for control plane
- Nodes = ~$70/month per Standard_DS2_v2 (running 24/7)
- Auto-scaling helps (only run nodes when needed)
- SQL Database costs vary ($5-$500+/month depending on tier)
- $200 free credits = plenty for initial testing

## Lessons Learned

### PowerShell vs WSL
User initially tried Azure CLI install in PowerShell. Commands like `curl -sL` don't work there. Always use WSL/bash for Kubernetes work.

### Kubeconfig Permissions Warning
`/home/seanm/.kube/config` has permissions 644 (world-readable). Should be 600. Not critical for dev but worth fixing:
```bash
chmod 600 ~/.kube/config
```

### Azure Portal Template Export
Azure provides deployment templates after cluster creation. These are gold for:
- Understanding what was created
- Recreating clusters
- Automation via ARM templates or Terraform

## Architecture Context

**Current State:** Local development
- RegScale: localhost:5000 (Docker)
- Hydrator: localhost:3001 (Node.js)
- Database: Local SQL Server or SQLite

**Target State:** Cloud deployment
- RegScale: AKS (public endpoint via Ingress)
- Hydrator: Azure App Service
- LangChain: Azure Functions
- Frontend: Azure App Service (ASP.NET)
- Database: Azure SQL Database

**This Session:** Step 1 of cloud migration (AKS infrastructure)

## Questions to Answer Next Session

1. **SQL Database:** What tier? (Basic, Standard, Premium?)
2. **RegScale Docker Image:** What's the exact image name/tag?
3. **Secrets Management:** Just YAML or use Azure Key Vault?
4. **DNS:** Custom domain or just use Azure-provided URL?
5. **SSL:** Let's Encrypt or Azure-managed cert?
6. **Ingress:** nginx-ingress or Azure Application Gateway?

## User's Next Action
User is going to compact this conversation to save tokens. When resuming:
1. Check if AKS cluster is still running (`kubectl get nodes`)
2. Create Azure SQL Database
3. Apply StorageClass
4. Continue with RegScale deployment

## Session Status
✅ **Major Milestone Achieved:** AKS cluster running and accessible
🔄 **In Progress:** RegScale deployment to AKS
⏭️ **Next:** Azure SQL Database creation

---

**End of Session Memory**

**FOR POST-COMPACTION CLAUDE:**
We are deploying RegScale to Azure. AKS cluster `regscale-aks` is LIVE and READY in resource group `regscale-demo-demo`. kubectl is connected. Next step: create Azure SQL Database, then deploy RegScale. StorageClass YAML is ready. User has $200 Azure credits. Working in WSL, not PowerShell.