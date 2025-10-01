# Azure Resources Notes

## SQL Server Credentials

**Server admin login:** superuser123
**Password:** 51mpl3Compliance$2
**Server:** regsale-db-server.database.windows.net
**Database:** regscale

## RegScale AKS Deployment

**Public IP:** http://4.156.150.217
**Namespace:** regscale
**Cluster:** regscale-aks
**Resource Group:** regscale-demo-demo

**Default RegScale Admin:**
- Username: admin
- Password: 51mpl3Compliance$2

**Health Widgets LLC Tenant Administrator:**
- Username: seanmchugh1
- Password: 51mpl3Compliance$2

**API Bearer Token (Production - AKS RegScale):**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjpbInNlYW5tY2h1Z2gxIiwic2Vhbm1jaHVnaDEiXSwiaWQiOiJkYjRhMDE1ZC03MmU3LTRiMDgtYTQ4Zi03NmI4MDRiYzc5ZTIiLCJyb2wiOiJhcGlfYWNjZXNzIiwic3ViIjoic2Vhbm1jaHVnaDEiLCJqdGkiOiJjMTI3ZDNkYS1kYmQzLTRjNGQtYTcwZi1hZmE4YTJiZmI3ZmMiLCJpYXQiOjE3NTkyODA3MDIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiZGI0YTAxNWQtNzJlNy00YjA4LWE0OGYtNzZiODA0YmM3OWUyIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9wcmltYXJ5Z3JvdXBzaWQiOiIxIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW5pc3RyYXRvciIsIm5iZiI6MTc1OTI4MDcwMiwiZXhwIjoxNzU5MzY3MTAyLCJpc3MiOiJSZWdTY2FsZSIsImF1ZCI6Imh0dHBzOi8vd3d3LnJlZ3NjYWxlLmlvLyJ9.EI4-KaIECT7mL9GvD5hGrTYg3WfBDgzhX3AuHhPYuts
```
- User: seanmchugh1
- Expires: 2025-10-01 (24 hours from issue)

## Hydrator App Service

**App Name:** hydrator
**Resource Group:** regscale-demo-demo
**URL:** https://hydrator-gpcfssb3bkh3guec.westcentralus-01.azurewebsites.net
**Runtime:** Node.js (with React frontend)
**Purpose:** Custom tool for systematically building RegScale data via API calls with dynamic lookups

## DemoAnalyzer Azure Function

**Function App Name:** health-widgets-analyzer
**Resource Group:** regscale-demo-demo
**URL:** https://health-widgets-analyzer.azurewebsites.net/api/analyze
**Runtime:** Node.js 20
**Framework:** Azure Functions v4
**Plan:** Consumption (serverless)
**Purpose:** LangChain-powered vulnerability analysis tool
- Analyzes components from RegScale API and Azure SQL
- Uses GPT-4o-mini for security analysis
- Returns risk levels and mitigation steps

**Environment Variables:**
- `OPENAI_API_KEY`
- `REGSCALE_BASE_URL=http://4.156.150.217`
- `REGSCALE_BEARER_TOKEN`

**Test Command:**
```bash
curl -X POST https://health-widgets-analyzer.azurewebsites.net/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "vulnerability description"}'
```

**CORS Configuration:**
- Configured to allow all origins (`*`) via Azure CLI
- CORS headers also explicitly set in function code to handle preflight OPTIONS requests
- Function accepts both POST and OPTIONS methods
- Headers included: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`
- Note: CORS works in production deployment but may have issues with localhost development

## HealthWidgets ASP.NET App Service

**App Name:** HealthWidgets
**Resource Group:** regscale-demo-demo-2
**URL:** https://healthwidgets-amfzgge8b9f9aweg.centralus-01.azurewebsites.net
**Runtime:** .NET 8 (LTS)
**Platform:** Linux
**Deployment Mode:** Framework-dependent
**Plan:** Basic B1 (Small, 1.75GB RAM, 100 ACU)
**Location:** Central US
**Purpose:** Frontend web application for vulnerability analysis

**Deployment:**
- Published via Visual Studio 2022 (Zip Deploy method)
- Publish Profile: `HealthWidgets - Zip Deploy.pubxml`
- Published successfully on 10/1/2025 at 3:45 AM
