const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage } = require('@langchain/core/messages');
const { getControls } = require('./regscale');

/**
 * Analyze RegScale controls using LangChain + OpenAI
 * @param {string} prompt - Analysis prompt/question
 * @param {number[]} controlIds - Optional array of control IDs to analyze
 * @param {string} modelName - OpenAI model (default: gpt-4o-mini)
 * @returns {Promise<{text: string, tokensUsed: number}>}
 */
async function analyzeControls(prompt, controlIds = null, modelName = 'gpt-4o-mini') {
    // Initialize OpenAI model
    const model = new ChatOpenAI({
        modelName: modelName,
        temperature: 0.7,
        openAIApiKey: process.env.OPENAI_API_KEY
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
    const response = await model.call([
        new HumanMessage(fullPrompt)
    ]);

    return {
        text: "THIS IS TEXT -->" + response.content,
        tokensUsed: response.response_metadata?.tokenUsage?.totalTokens || 0
    };
}

module.exports = {
    analyzeControls
};
