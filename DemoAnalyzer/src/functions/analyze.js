const { app } = require('@azure/functions');
const { analyzeControls } = require('../services/langchain');

app.http('analyze', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const startTime = Date.now();

        try {
            // Parse request body
            const body = await request.json();
            const { prompt, controlIds, model } = body;

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

            context.log('Starting analysis...', { controlIds, model });

            // Run LangChain analysis
            const result = await analyzeControls(prompt, controlIds, model);

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

        } catch (error) {
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
