# RegScale Demo Demo

> **Hackathon-style project.** Built fast, deployed live, works. Repo is not cleaned up. `.gitignore` files are ignored. Organization? What organization.

This project demonstrates AI-powered supply chain security analysis using **RegScale**, **LangChain**, **MCP**, and **Azure** services.

---

## Tech Stack

- **RegScale GRC** (Azure Kubernetes Service)
- **LangChain** AI Agent (Azure Functions)
- **MCP** (Model Context Protocol) via Claude Code
- **Azure Services:** App Service, Azure Functions, Azure SQL Database, AKS
- **OpenAI GPT-4o-mini**
- **ASP.NET Core 8** + **Node.js 20** + **React**

---

## Components

### 🌐 Health Widgets Security Portal (Azure App Service)

The primary deliverable - a web frontend for security analysis of components.

**URL:** https://healthwidgets-amfzgge8b9f9aweg.centralus-01.azurewebsites.net/

**Source:** [`/HealthWidgets/Website`](https://github.com/smchughinfo/regscale_demo_demo/tree/main/HealthWidgets/Website)

![Security Portal](Documentation/securityportal.png)

---

### 📊 RegScale Installation (Azure Kubernetes Service)

GRC platform deployed on AKS for governance, risk, and compliance management.

**URL:** http://4.156.150.217
**Username:** `seanmchugh1`
**Password:** `51mpl3Compliance$2`

![RegScale](Documentation/regscale.png)

---

### 🔧 Hydrator Tool (Azure App Service)

Tool for systematically populating RegScale with demo data via API calls with dynamic lookups.

**URL:** https://hydrator-ggctbab8exhcgtgw.westcentralus-01.azurewebsites.net/

**Source:** [`/Hydrator`](https://github.com/smchughinfo/regscale_demo_demo/tree/main/Hydrator)

![Hydrator](Documentation/hydrator.png)

---

### 🗄️ Database Server (Azure SQL Database)

**Server:** `regsale-db-server.database.windows.net`
**User:** `superuser123`
**Password:** `51mpl3Compliance$2`

**Databases:**
- `regscale` - RegScale GRC database
- `HealthWidgets` - Simulated business component database

**Health Widgets Data:** [`/DemoAnalyzer/component-hydration.sql`](https://github.com/smchughinfo/regscale_demo_demo/blob/main/DemoAnalyzer/component-hydration.sql)

![Database](Documentation/database.png)

---

### 🤖 LangChain Component Analyzer (Azure Function App)

AI-powered vulnerability analysis using LangChain agent with custom tools that query both RegScale API and Azure SQL.

**Usage:**
```bash
curl -X POST https://health-widgets-analyzer.azurewebsites.net/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"prompt": "can you please check for any components which might contain microchips"}'
```

**Source:** [`/DemoAnalyzer`](https://github.com/smchughinfo/regscale_demo_demo/tree/main/DemoAnalyzer)

**Tools:**
- `get_regscale_components` - Queries RegScale API
- `get_database_components` - Queries Azure SQL Database

---

### 🛠️ MCP (Model Context Protocol) via Claude Code

Custom MCP server with screen capture tools for development assistance.

**Tools:**
- `list_screens` - Display screen numbers
- `take_screenshot` - Capture screenshot of specific screen

**Source:** [`/MCP`](https://github.com/smchughinfo/regscale_demo_demo/tree/main/MCP)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Security Portal (ASP.NET Core)                 │
│  https://healthwidgets-amfzgge8b9f9aweg...      │
└─────────────────┬───────────────────────────────┘
                  │
                  │ HTTPS POST
                  ▼
┌─────────────────────────────────────────────────┐
│  LangChain Analyzer (Azure Function)            │
│  GPT-4o-mini + Custom Tools                     │
└─────────────────┬───────────────────────────────┘
                  │
          ┌───────┴────────┐
          ▼                ▼
    ┌──────────┐    ┌─────────────┐
    │ RegScale │    │  Azure SQL  │
    │   (AKS)  │    │  Database   │
    └──────────┘    └─────────────┘
```

---

## Project Structure

```
regscale_demo_demo/
├── DemoAnalyzer/           # Azure Function (LangChain analyzer)
├── HealthWidgets/Website/  # ASP.NET Core frontend
├── Hydrator/               # Data population tool (Node.js + React)
├── MCP/                    # Model Context Protocol server
├── Azure/AKS/              # Kubernetes configs for RegScale
├── Documentation/          # Screenshots and images
└── SessionMemory/          # Development logs
```

---

## Setup Notes

**Important Files:**
- **`Azure/notes.md`** - All Azure resources, credentials, endpoints
- **`Hydrator/HYDRATOR_NOTES.md`** - Lookup conventions and field mappings
- **`SessionMemory/`** - Chronological development logs

**Quirks:**
- TypeScript must build on Windows, not WSL (path issues)
- RegScale bearer tokens expire after 24 hours
- CORS works in production, may have localhost issues

---

## Development

Built through pair programming with Claude (Anthropic). Session memories document the entire development journey.

**Key Technologies:**
- RegScale API integration
- LangChain agent with custom tools
- OpenAI GPT-4o-mini
- Azure Functions (serverless)
- Azure Kubernetes Service
- Azure SQL Database
- MCP for development tooling

---

## Disclaimer

This is a hackathon-style demo. Code is messy. Tests are missing. `.gitignore` files are suggestions. But it works, it's deployed, and it demonstrates the concept.

¯\\_(ツ)_/¯
