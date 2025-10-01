# Session Memory: DemoAnalyzer Azure Function Deployment
**Date:** October 1, 2025, 3:10 AM
**Topic:** Deploying DemoAnalyzer to Azure Functions (Consumption Plan)

## Overview
Successfully deployed the DemoAnalyzer LangChain-powered vulnerability analysis tool as a serverless Azure Function. The function is now publicly accessible and operational.

## Technical Work Completed

### 1. Fixed ES Module Import Issue
**Problem:** Azure Functions runtime couldn't import named exports from CommonJS `@azure/functions` package
**Error:** `Named export 'HttpRequest' not found. The requested module '@azure/functions' is a CommonJS module`

**Solution:** Changed import syntax in `/DemoAnalyzer/src/functions/analyze.ts`:
```typescript
// BEFORE (broken)
import { app, HttpRequest, type HttpResponseInit, InvocationContext } from '@azure/functions';

// AFTER (working)
import pkg from '@azure/functions';
const { app } = pkg;
// Removed explicit types, let Azure Functions framework infer them
handler: async (request, context) => { ... }
```

### 2. Azure Infrastructure Setup

**Storage Account Creation:**
- **Name:** `healthwidgetsanalysis`
- **Resource Group:** `regscale-demo-demo`
- **Region:** East US
- **Performance:** Standard
- **Redundancy:** Locally-redundant storage (LRS)
- **Purpose:** Required by Azure Functions for internal operations (coordination, logs, deployment packages)
- **Method:** Created via Azure Portal UI (CLI had subscription resolution issues)

**Function App Creation:**
```bash
az functionapp create \
  --resource-group regscale-demo-demo \
  --name health-widgets-analyzer \
  --storage-account healthwidgetsanalysis \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4
```

**Architecture Choice:** Consumption Plan (serverless)
- Auto-scales from 0 to N instances based on demand
- Pay-per-execution pricing (execution time + memory used)
- ~1.5GB RAM per execution
- 10-minute timeout (configured in host.json)
- Perfect for occasional analysis workloads

### 3. Environment Configuration

**Application Settings (Step 4):**
```bash
az functionapp config appsettings set \
  --name health-widgets-analyzer \
  --resource-group regscale-demo-demo \
  --settings \
    "OPENAI_API_KEY=<openai-key>" \
    "REGSCALE_BASE_URL=http://4.156.150.217" \
    "REGSCALE_BEARER_TOKEN=<regscale-token>"
```

**Note:** User initially forgot correct OpenAI key, updated settings after deployment (no code redeployment needed).

### 4. Code Deployment

**Build Process:**
- TypeScript compiled on Windows (WSL has Node.js path conflicts)
- Output: `src/**/*.ts` → `dist/**/*.js`

**Deployment Command:**
```bash
func azure functionapp publish health-widgets-analyzer
```

**Deployment Details:**
- Uploaded 35.66 MB package
- Azure automatically detected `app.http('analyze', ...)` registration
- Generated endpoint: `https://health-widgets-analyzer.azurewebsites.net/api/analyze`
- URL convention: `https://<app-name>.azurewebsites.net/api/<function-name>`

### 5. Production Testing

**Test Curl:**
```bash
curl -X POST https://health-widgets-analyzer.azurewebsites.net/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"prompt": "can you please check fo any components which might contain microchips"}'
```

**Result:**
- ✅ **Success:** 200 OK
- **Duration:** 14.672 seconds
- **Agent behavior:** Successfully called both tools (RegScale API + SQL database)
- **Output:** Comprehensive analysis identifying 8 components with microchips, risk levels (High/Medium/Low), and mitigation steps

## Key Learning: Azure Functions Conventions

**HTTP Trigger Registration:**
```typescript
app.http('analyze', {  // Function name becomes route
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => { ... }
});
```

**Result:** Azure scans deployment, finds registrations, auto-generates `/api/analyze` endpoint

**Storage Account Requirement:**
- Every Azure Function App requires a storage account
- Used by Azure internally for:
  - Host coordination during scaling
  - Function metadata storage
  - Deployment package storage
  - Runtime logging
- User code doesn't interact with it directly (just platform infrastructure)

## Architecture Summary

**Data Flow:**
1. HTTP POST → `https://health-widgets-analyzer.azurewebsites.net/api/analyze`
2. Azure Functions runtime invokes `analyze` handler
3. LangChain agent analyzes prompt
4. Agent calls tools:
   - `get_regscale_components` → RegScale API (http://4.156.150.217/api/components/getList)
   - `get_database_components` → Azure SQL (regsale-db-server.database.windows.net/HealthWidgets)
5. GPT-4o-mini processes data and generates security analysis
6. JSON response returned to client

**Tech Stack:**
- **Runtime:** Node.js 20
- **Framework:** Azure Functions v4
- **Language:** TypeScript (ES modules)
- **LLM:** OpenAI GPT-4o-mini
- **Agent Framework:** LangChain (createToolCallingAgent)
- **Database:** Azure SQL Server (mssql package)
- **API Integration:** RegScale GRC system

## Files Modified

### `/DemoAnalyzer/src/functions/analyze.ts`
**Changes:**
- Fixed import syntax for CommonJS @azure/functions package
- Removed explicit type annotations (let framework infer)
- Changed from `import { app, HttpRequest, InvocationContext }` to `import pkg from '@azure/functions'`

## Deployment Commands Reference

**Complete deployment workflow:**
```bash
# 1. Build (run from Windows PowerShell, not WSL)
cd C:\Users\seanm\Desktop\regscale_demo_demo\DemoAnalyzer
npx tsc

# 2. Create storage account (if needed)
# Done via Azure Portal UI

# 3. Create Function App
az functionapp create \
  --resource-group regscale-demo-demo \
  --name health-widgets-analyzer \
  --storage-account healthwidgetsanalysis \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4

# 4. Configure environment variables
az functionapp config appsettings set \
  --name health-widgets-analyzer \
  --resource-group regscale-demo-demo \
  --settings \
    "OPENAI_API_KEY=<key>" \
    "REGSCALE_BASE_URL=http://4.156.150.217" \
    "REGSCALE_BEARER_TOKEN=<token>"

# 5. Deploy code (run from WSL)
cd /mnt/c/Users/seanm/Desktop/regscale_demo_demo/DemoAnalyzer
func azure functionapp publish health-widgets-analyzer

# 6. Test
curl -X POST https://health-widgets-analyzer.azurewebsites.net/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"prompt": "vulnerability description"}'
```

## Production Endpoint

**URL:** `https://health-widgets-analyzer.azurewebsites.net/api/analyze`

**Method:** POST

**Request Body:**
```json
{
  "prompt": "vulnerability description or analysis request"
}
```

**Response:**
```json
{
  "success": true,
  "result": "detailed security analysis with risk levels and mitigation steps",
  "duration": 14.672
}
```

## User Feedback
- "claude it looks like we're in business" - deployment successful
- User referenced "Footprints" poem (theological metaphor for being carried through difficult work)

## Next Steps
User mentioned: "we have one super simple app to write to finish this all up"

Session concluded with successful production deployment and testing.

---

## Additional Context

**Why Azure Functions?**
- Serverless architecture eliminates server management
- Cost-effective for occasional/bursty workloads
- Auto-scaling handles variable load
- Integrates with existing Azure infrastructure (SQL, App Insights)

**Why Consumption Plan?**
- No fixed costs when idle
- Suitable for demo/POC environments
- Can upgrade to Premium Plan later if needed (VNet integration, pre-warmed instances)

**Application Insights:**
- Automatically created: `health-widgets-analyzer`
- Provides telemetry, logs, performance metrics
- URL: https://portal.azure.com/#resource/subscriptions/bfb809f0-3e70-44c3-8b66-0ea2184c2114/resourceGroups/regscale-demo-demo/providers/microsoft.insights/components/health-widgets-analyzer/overview
