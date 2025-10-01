# RegScale Demo Demo

A demo application showcasing AI-powered supply chain security analysis using RegScale GRC, Azure Functions, LangChain, and OpenAI.

> **Note:** This is a rapid prototype/demo built through exploratory development. The codebase reflects the journey of getting things working rather than pristine production code. You've been warned! 😅

## What It Does

Health Widgets LLC needs to analyze their component inventory for security vulnerabilities. This system:

1. **Stores component data** in RegScale GRC system and Azure SQL
2. **Analyzes components** using a LangChain agent powered by GPT-4o-mini
3. **Presents results** through a clean web interface

Ask questions like:
- "Check for components containing microchips"
- "What vulnerabilities exist in supplier X?"
- "Which components have high security risk?"

The AI agent queries both the RegScale API and SQL database, then provides detailed risk assessments and mitigation recommendations.

## Live Demo

🌐 **Web Interface:** https://healthwidgets-amfzgge8b9f9aweg.centralus-01.azurewebsites.net

🔧 **Hydrator Tool:** https://hydrator-gpcfssb3bkh3guec.westcentralus-01.azurewebsites.net

📊 **RegScale GRC:** http://4.156.150.217

## Architecture

```
┌─────────────────────────────────────────────────┐
│  User Browser (ASP.NET Core Frontend)           │
│  https://healthwidgets-amfzgge8b9f9aweg...net   │
└─────────────────┬───────────────────────────────┘
                  │
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────┐
│  Azure Function (Node.js 20)                    │
│  LangChain Agent + GPT-4o-mini                  │
│  https://health-widgets-analyzer...net/api/...  │
└─────────────────┬───────────────────────────────┘
                  │
                  │ Parallel Data Fetch
                  ▼
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ RegScale API │    │ Azure SQL DB │
│ (AKS/K8s)    │    │ HealthWidgets│
└──────────────┘    └──────────────┘
```

## Technology Stack

- **Frontend:** ASP.NET Core 8 MVC (Azure App Service)
- **Backend:** Azure Functions v4 (Node.js 20, Consumption Plan)
- **AI:** LangChain + OpenAI GPT-4o-mini
- **Database:** Azure SQL Server
- **GRC Platform:** RegScale (Kubernetes/AKS)
- **Data Tool:** Hydrator (Node.js + React)

## Project Structure

```
regscale_demo_demo/
├── DemoAnalyzer/              # Azure Function (LangChain agent)
│   ├── src/
│   │   ├── functions/         # HTTP triggers
│   │   └── services/          # LangChain, RegScale, SQL
│   └── host.json
├── HealthWidgets/
│   └── Website/               # ASP.NET Core frontend
│       ├── Controllers/
│       ├── Views/
│       └── wwwroot/
├── Hydrator/                  # Data population tool
│   ├── frontend/              # React UI
│   ├── update_controls.js     # Security controls hydrator
│   └── analyze.js             # Analysis scripts
├── Azure/
│   ├── AKS/                   # Kubernetes configs for RegScale
│   └── notes.md               # Azure resources documentation
├── SessionMemory/             # Development session logs
└── StartStopScripts/          # RegScale management scripts
```

## Key Components

### 1. DemoAnalyzer (Azure Function)
- **Purpose:** AI-powered vulnerability analysis
- **Tools:** LangChain agent with custom tools
  - `get_regscale_components` - Queries RegScale API
  - `get_database_components` - Queries Azure SQL
- **Model:** OpenAI GPT-4o-mini
- **Deployment:** Serverless (Consumption Plan)

### 2. HealthWidgets Website (ASP.NET)
- **Purpose:** User-facing web interface
- **Features:**
  - Clean, modern UI with gradients and animations
  - Single-page security analysis form
  - Real-time results display
- **Design:** "Vibe coded" with Inter font and professional color scheme

### 3. RegScale GRC Platform
- **Purpose:** Governance, Risk, and Compliance management
- **Deployment:** Azure Kubernetes Service (AKS)
- **Data:** Organizations, users, security plans, components, controls, etc.

### 4. Hydrator
- **Purpose:** Systematically populate RegScale with demo data
- **Features:**
  - Dynamic lookups (organizations, users, security plans)
  - Bulk entity creation via API
  - React frontend for monitoring
- **Note:** Read `Hydrator/HYDRATOR_NOTES.md` for lookup conventions

## Setup & Deployment

### Prerequisites
- Azure subscription
- OpenAI API key
- Node.js 20+
- .NET 8 SDK
- Azure Functions Core Tools
- kubectl (for AKS)

### Environment Variables

**DemoAnalyzer Function:**
```bash
OPENAI_API_KEY=<your-key>
REGSCALE_BASE_URL=http://4.156.150.217
REGSCALE_BEARER_TOKEN=<bearer-token>
```

**Azure SQL Connection:**
```
Server: regsale-db-server.database.windows.net
Database: HealthWidgets
User: superuser123
Password: <see Azure/notes.md>
```

### Deploy Azure Function
```bash
# Build TypeScript
cd DemoAnalyzer
npx tsc

# Deploy
func azure functionapp publish health-widgets-analyzer
```

### Deploy ASP.NET Frontend
```bash
# Via Visual Studio
# Right-click project → Publish → Azure App Service (Linux)

# Or via CLI
cd HealthWidgets/Website
az webapp up \
  --resource-group regscale-demo-demo-2 \
  --name HealthWidgets \
  --runtime "DOTNET:8"
```

### Deploy RegScale (AKS)
See `Azure/AKS/` for Kubernetes configs and `SessionMemory/` for detailed setup notes.

## Important Files

- **`Azure/notes.md`** - All Azure resources, credentials, and endpoints
- **`Hydrator/HYDRATOR_NOTES.md`** - Lookup array conventions and field mappings
- **`SessionMemory/`** - Chronological development logs (great for understanding what happened when)
- **`CLAUDE.md`** - Project instructions and conventions

## Known Issues & Quirks

1. **CORS:** Works in production, but may have issues with localhost development
2. **TypeScript Build:** Must build on Windows, not WSL (path issues)
3. **Bearer Token:** Expires after 24 hours, need to regenerate from RegScale
4. **Code Organization:** This was built iteratively, so expect some... creative file structures
5. **Error Handling:** Exists, but could be more robust
6. **Tests:** What tests? 🙃

## Development Notes

This project was developed through pair programming sessions with Claude (Anthropic). Session memories in `/SessionMemory/` provide detailed context about:

- Why certain decisions were made
- What problems were encountered and how they were solved
- What was learned along the way
- Timestamps and technical details

**Key Sessions:**
- `09-29-25-03-05-project-initialization.md` - Initial setup
- `10-01-25-02-30-analyzer-langchain-agent.md` - LangChain agent implementation
- `10-01-25-03-10-analyzer-azure-deployment.md` - Azure Function deployment
- `10-01-25-04-17-healthwidgets-frontend-deployment.md` - Frontend deployment

## Credits

- **Frontend UI Design:** Claude (Anthropic)
- **Architecture & Implementation:** Sean + Claude
- **RegScale Platform:** RegScale, Inc.
- **AI Models:** OpenAI GPT-4o-mini
- **Cloud Infrastructure:** Microsoft Azure

## License

This is a demo project. Use at your own risk. No warranty expressed or implied.

---

## Apologies

Yes, the code is messy. Yes, there are unused files. Yes, some things could be refactored. But it works, it's deployed, and it demonstrates the concept!

This is what real exploratory development looks like - not everything is pristine, and that's okay. If you need to understand something specific, check the session memories or just ask.

¯\\_(ツ)_/¯

## Questions?

Check the session memories first - there's probably a detailed explanation of what you're looking for. If not, good luck! 🚀
