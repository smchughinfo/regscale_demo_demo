import pkg from '@azure/functions';
const { app } = pkg;
import { analyzeComponents } from '../services/langchain.js';

interface AnalyzeRequest {
    prompt: string;
}

app.http('analyze', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        };

        // Handle preflight OPTIONS request
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: corsHeaders
            };
        }

        const startTime = Date.now();

        try {
            // Parse request body
            const body = await request.json() as AnalyzeRequest;
            const { prompt } = body;

            // Validate input
            if (!prompt) {
                return {
                    status: 400,
                    headers: corsHeaders,
                    jsonBody: {
                        success: false,
                        error: 'Missing required field: prompt'
                    }
                };
            }

            context.log('Starting vulnerability analysis...', { prompt });

            // Run LangChain agent analysis with database tools
            const result = await analyzeComponents(prompt);

            const duration = (Date.now() - startTime) / 1000;

            return {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                jsonBody: {
                    success: true,
                    result: result.text,
                    duration: duration
                }
            };

        } catch (error: any) {
            context.error('Analysis failed:', error);

            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: {
                    success: false,
                    error: error.message
                }
            };
        }
    }
});
