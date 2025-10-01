import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { componentTools } from './tools.js';

const modelName = 'gpt-4o-mini';

interface AnalysisResult {
    text: string;
    tokensUsed: number;
}

/**
 * Analyze vulnerability impact on Health Widgets components using LangChain agent with database tools
 */
export async function analyzeControls(vulnerabilityPrompt: string): Promise<AnalysisResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    // Initialize OpenAI model
    const model = new ChatOpenAI({
        modelName: modelName,
        temperature: 0.7,
        openAIApiKey: apiKey
    });

    // Create agent prompt
    const prompt = ChatPromptTemplate.fromMessages([
        ['system', `You are a medical device security analyst for Health Widgets Inc.
Your job is to analyze security vulnerabilities and determine which components in our medical device portfolio may be affected.

When analyzing a vulnerability:
1. Use the available tools to search and retrieve component information from the database
2. Carefully examine component descriptions for technical details, versions, dependencies, and known issues
3. Identify which components may be directly or indirectly affected by the vulnerability
4. Provide a clear assessment with specific component names and risk levels
5. Suggest mitigation steps if applicable

Be thorough but concise. Focus on actionable intelligence.`],
        ['human', '{input}'],
        ['placeholder', '{agent_scratchpad}']
    ]);

    // Create agent with tools
    const agent = await createOpenAIFunctionsAgent({
        llm: model,
        tools: componentTools,
        prompt: prompt
    });

    // Create agent executor
    const agentExecutor = new AgentExecutor({
        agent: agent,
        tools: componentTools,
        verbose: true
    });

    // Execute analysis
    const startTime = Date.now();
    const result = await agentExecutor.invoke({
        input: vulnerabilityPrompt
    });

    // TODO: Token counting is tricky with agents - would need to track across multiple LLM calls
    // For now, return 0 and we can enhance this later
    const tokensUsed = 0;

    return {
        text: result.output,
        tokensUsed: tokensUsed
    };
}
