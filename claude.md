# RegScale Demo Project

## Project Overview

**RegScale Demo Demo** A demo app that uses RegScale and LangChain ...in the cloud!

## Target Solution Architecture (TSA)

**Cloud Infrastructure (Azure):**
- **AKS (Azure Kubernetes Service)**: RegScale GRC platform
- **Azure Functions**: LangChain backend (serverless, pay-per-execution)
- **App Service**: ASP.NET frontend
- **App Service**: Hydrator (Node.js + React)
- **Azure SQL Database**: RegScale database (required for K8s deployment)
- **Resource Group**: `regscale-demo-demo`
- **Region**: East US

## Development Tools

### RegScale API
- **Swagger Documentation**: http://localhost:5000/swagger/index.html
- **Base URL**: http://localhost:5000/

### RegScale Hydrator
The Hydrator is a custom tool for systematically building RegScale data via API calls with dynamic lookups.

**IMPORTANT:** Always read `/Hydrator/HYDRATOR_NOTES.md` when working with the Hydrator. This file contains:
- Lookup array index conventions (organizations, users, security plans)
- Standard field mappings for each entity type
- Lookup syntax examples
- Current execution order

Without this reference, lookup indices like `[3]` will be meaningless after conversation compaction.

### Tmux Integration
For collaborative terminal work, use tmux sessions:

**Create session**: `tmux new-session -s regscale_demo`
**Attach to session**: `tmux attach-session -t regscale_demo`
**Detach from session**: `Ctrl+B` then `D`
**List sessions**: `tmux list-sessions`

Tmux allows persistent terminal sessions that can be shared and resumed, perfect for ongoing development work.

## Session Memory

### Purpose
Session memory provides a chronological record of development conversations and progress, capturing key decisions, technical insights, and project evolution.

### Implementation
When requested to save session memory:

1. **Summarize conversation** focusing on technical progress and decisions
2. **Save to** `/SessionMemory/MM-DD-YY-HH-MM-topic.md`
3. **Include**: Development progress, technical insights, decisions made, and next steps

### File Structure
```
/SessionMemory/
├── 09-29-25-14-30-initial-setup.md
├── 09-29-25-15-45-api-exploration.md
└── [future sessions]
```