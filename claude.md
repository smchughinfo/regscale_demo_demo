# RegScale Demo Project

## Project Overview

**RegScale Demo Demo** A demo app that uses RegScale and LangChain ...in the cloud!

## Development Tools

### RegScale API
- **Swagger Documentation**: http://localhost:5000/swagger/index.html
- **Base URL**: http://localhost:5000/

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
2. **Save to** `/SessionMemory/MM-DD-YY-HH-MM-topic.txt`
3. **Include**: Development progress, technical insights, decisions made, and next steps

### File Structure
```
/SessionMemory/
├── 09-29-25-14-30-initial-setup.txt
├── 09-29-25-15-45-api-exploration.txt
└── [future sessions]
```