import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { componentTools } from './tools.js';

const modelName = 'gpt-4o-mini';

interface AnalysisResult {
    text: string;
}

/**
 * Analyze vulnerability impact on Health Widgets components using LangChain agent with database tools
 */
export async function analyzeComponents(vulnerabilityPrompt: string): Promise<AnalysisResult> {
    const model = new ChatOpenAI({
        modelName: modelName,
        temperature: 0.7,
        openAIApiKey: process.env.OPENAI_API_KEY!
    });

    // Create agent prompt
    const prompt = ChatPromptTemplate.fromMessages([
        ['system', `You are a medical device security analyst for Health Widgets Inc.
Your job is to analyze security vulnerabilities and determine which components in our medical device portfolio may be affected.

You have access to two data sources:
1. RegScale GRC system - Contains the official inventory of components (names, types, status)
2. Component database - Contains detailed technical descriptions, specifications, known issues, and dependencies

When analyzing a vulnerability:
1. First, retrieve the component inventory from RegScale to see what components exist
2. Then, retrieve detailed technical information from the component database
3. Cross-reference both sources to build a complete picture
4. Carefully examine technical descriptions for versions, dependencies, protocols, and known vulnerabilities
5. Identify which components are directly or indirectly affected by the reported vulnerability
6. Provide a clear assessment with specific component names and risk levels (Critical/High/Medium/Low)
7. Suggest mitigation steps if applicable

Be thorough but concise. Focus on actionable intelligence for the security team.`],
        ['human', '{input}'],
        ['placeholder', '{agent_scratchpad}']
    ]);

    // Create agent with tools
    const agent = await createToolCallingAgent({
        llm: model,
        tools: componentTools,
        prompt: prompt
    });

    // Create agent executor
    const agentExecutor = new AgentExecutor({
        agent: agent,
        tools: componentTools,
        verbose: true,
        maxIterations: 5,
        returnIntermediateSteps: false
    });

    // Execute analysis
    const startTime = Date.now();
    const result = await agentExecutor.invoke({
        input: vulnerabilityPrompt
    });

    return {
        text: result.output,
    };
}
