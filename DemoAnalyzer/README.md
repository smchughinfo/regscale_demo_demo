# DemoAnalyzer - Azure Function

LangChain-powered analysis function for RegScale controls.

## Local Development

### Prerequisites
- Node.js 18+
- Azure Functions Core Tools: `npm install -g azure-functions-core-tools@4`

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure `local.settings.json`:
```json
{
  "Values": {
    "OPENAI_API_KEY": "sk-...",
    "REGSCALE_BASE_URL": "http://4.156.150.217",
    "REGSCALE_BEARER_TOKEN": "Bearer eyJ..."
  }
}
```

3. Start the function locally:
```bash
npm start
```

Function will run at `http://localhost:7071/api/analyze`

## Usage

### Request
```bash
curl -X POST http://localhost:7071/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analyze these controls for NIST 800-53 compliance",
    "controlIds": [1, 2, 3],
    "model": "gpt-4o-mini"
  }'
```

### Response
```json
{
  "success": true,
  "result": "Analysis results...",
  "tokensUsed": 1234,
  "duration": 2.5
}
```

## Deployment

Deploy to Azure:
```bash
func azure functionapp publish <function-app-name>
```

Set environment variables in Azure portal:
- `OPENAI_API_KEY`
- `REGSCALE_BASE_URL`
- `REGSCALE_BEARER_TOKEN`
