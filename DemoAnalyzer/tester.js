import fs from 'fs';
import { analyzeControls } from './dist/services/langchain.js';
import { getAllComponents } from './dist/services/database.js'

// Load environment variables from local.settings.json
const settings = JSON.parse(fs.readFileSync('./local.settings.json', 'utf8'));
Object.keys(settings.Values).forEach(key => {
    process.env[key] = settings.Values[key];
});

// Test function
async function test() {
    var components = await getAllComponents();
    console.log(components);
}

// Run the test
test();
