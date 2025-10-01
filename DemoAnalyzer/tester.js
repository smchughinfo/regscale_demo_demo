const fs = require('fs');
const { analyzeControls } = require('./src/services/langchain');

// Load environment variables from local.settings.json
const settings = JSON.parse(fs.readFileSync('./local.settings.json', 'utf8'));
Object.keys(settings.Values).forEach(key => {
    process.env[key] = settings.Values[key];
});

// Test function
async function test() {
    console.log('Testing LangChain analyzer...\n');

    try {
        // Test 1: Simple prompt without controls
        console.log('=== Test 1: Simple Prompt ===');
        const result1 = await analyzeControls('Say hello world');
        console.log('Result:', result1.text);
        console.log('Tokens:', result1.tokensUsed);
        console.log();

        // Test 2: With RegScale control IDs
        console.log('=== Test 2: With Control IDs ===');
        const result2 = await analyzeControls(
            'Summarize these security controls',
            [1, 2, 3]
        );
        console.log('Result:', result2.text);
        console.log('Tokens:', result2.tokensUsed);
        console.log();

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }
}

// Run the test
test();
