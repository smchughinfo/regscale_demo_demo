# RegScale Hydrator

A mini-Postman style tool for systematically building and testing RegScale API workflows. This tool allows you to create repeatable sequences of API calls to hydrate your RegScale tenant with data.

## Features

- **Visual API Call Editor**: Swagger-style interface for editing API calls
- **Real-time File Sync**: Changes to `hydration.json` are instantly reflected in the UI
- **Sequential Execution**: Execute all calls in order with automatic stopping on errors
- **Individual Testing**: Test individual calls during development
- **Bearer Token Management**: Automatically injects your authentication token
- **Result Tracking**: Stores response data and status codes for each call

## Quick Start

1. **Start the Server**:
   ```bash
   cd Hydrator
   npm start
   ```

2. **Open Web Interface**:
   Navigate to `http://localhost:3001` in your browser

3. **Configure Bearer Token**:
   Paste your RegScale API bearer token in the token field at the top

4. **Execute Calls**:
   - Click individual "Play" buttons to test single calls
   - Use "Execute All" to run the entire sequence
   - Use "Clear Results" to reset all response data

## File Structure

```
Hydrator/
├── hydration.json          # Core configuration file with API calls
├── server.js              # Express server with file watching
├── Services/
│   └── HydrationService.js # API execution logic
└── frontend/
    └── dist/
        └── index.html      # Web interface
```

## hydration.json Schema

```json
{
  "bearerToken": "your-jwt-token-here",
  "baseUrl": "http://localhost:5000",
  "calls": [
    {
      "id": "unique-call-id",
      "name": "Human Readable Name",
      "method": "GET|POST|PUT|PATCH|DELETE",
      "url": "/api/endpoint/path",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "key": "value"
      },
      "result": null,        // Auto-populated after execution
      "statusCode": null     // Auto-populated after execution
    }
  ]
}
```

## Usage Patterns

### Adding New Calls

You can add calls in two ways:

1. **Via Web Interface**: Click "Add New Call" button
2. **Direct File Edit**: Add to `hydration.json` and changes will appear instantly

### Sequential Workflows

The system is designed for building up complex data states:

1. Create basic entities (users, organizations)
2. Create security plans
3. Add components and assets
4. Implement controls
5. Run assessments

### Error Handling

- Individual call failures show red error dialogs
- Batch execution stops immediately on first failure
- Non-200 status codes are treated as failures
- All results (success and failure) are saved to the JSON file

## API Endpoints

The server provides these endpoints:

- `GET /api/hydration` - Get current hydration data
- `PUT /api/hydration` - Update hydration data
- `POST /api/execute/:callId` - Execute single call
- `POST /api/execute` - Execute all calls sequentially
- `POST /api/clear` - Clear all results
- `POST /api/calls` - Add new call

## Development Tips

1. **Test Individual Calls First**: Use the individual execute buttons to debug calls
2. **Check RegScale API**: Ensure your RegScale instance is running on port 5000
3. **Monitor Server Logs**: The console shows detailed execution logs
4. **File Watching**: Edit `hydration.json` directly for bulk changes
5. **Token Expiry**: Update the bearer token when it expires

## Example Workflow

1. Get user info to verify authentication
2. List existing security plans
3. Create a new security plan
4. Add components to the security plan
5. Implement controls for each component
6. Create assessment schedules

Each step builds on the previous ones, creating a complete RegScale tenant setup that can be repeated for different environments.

## Troubleshooting

- **Connection Errors**: Verify RegScale API is running on port 5000
- **Authentication Errors**: Check that your bearer token is valid and not expired
- **File Permission Errors**: Ensure the hydration.json file is writable
- **WebSocket Issues**: The page will auto-reconnect if the connection drops

## Next Steps

This tool is designed to be iterative. Start with basic calls, test them individually, then build up complex workflows that can be executed repeatedly to achieve your desired RegScale configuration state.