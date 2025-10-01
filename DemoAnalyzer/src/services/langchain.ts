import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { getControls } from './regscale.js';

interface AnalysisResult {
    text: string;
    tokensUsed: number;
}

/**
 * Analyze RegScale controls using LangChain + OpenAI
 */
export async function analyzeControls(
    prompt: string,
    controlIds?: number[],
    modelName: string = 'gpt-4o-mini'
): Promise<AnalysisResult> {
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

    // Fetch control data if IDs provided
    let controlContext = '';
    if (controlIds && controlIds.length > 0) {
        const controls = await getControls(controlIds);
        controlContext = '\n\nControl Data:\n' + JSON.stringify(controls, null, 2);
    }

    // Build full prompt
    const fullPrompt = prompt + controlContext;

    // Call LangChain
    const response = await model.invoke(fullPrompt);

    return {
        text: response.content as string,
        tokensUsed: response.response_metadata?.tokenUsage?.totalTokens || 0
    };
}
