import { app, HttpRequest, type HttpResponseInit, InvocationContext } from '@azure/functions';
import { analyzeControls } from '../services/langchain.js';

interface AnalyzeRequest {
    prompt: string;
}

app.http('analyze', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        const startTime = Date.now();

        try {
            // Parse request body
            const body = await request.json() as AnalyzeRequest;
            const { prompt } = body;

            // Validate input
            if (!prompt) {
                return {
                    status: 400,
                    jsonBody: {
                        success: false,
                        error: 'Missing required field: prompt'
                    }
                };
            }

            context.log('Starting vulnerability analysis...', { prompt });

            // Run LangChain agent analysis with database tools
            const result = await analyzeControls(prompt);

            const duration = (Date.now() - startTime) / 1000;

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                jsonBody: {
                    success: true,
                    result: result.text,
                    tokensUsed: result.tokensUsed,
                    duration: duration
                }
            };

        } catch (error: any) {
            context.error('Analysis failed:', error);

            return {
                status: 500,
                jsonBody: {
                    success: false,
                    error: error.message
                }
            };
        }
    }
});
