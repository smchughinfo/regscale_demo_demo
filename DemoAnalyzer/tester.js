import fs from 'fs';
import { analyzeControls } from './dist/services/langchain.js';
import * as database from './dist/services/database.js';
import * as regscale from './dist/services/regscale.js';

// Load environment variables from local.settings.json
const settings = JSON.parse(fs.readFileSync('./local.settings.json', 'utf8'));
Object.keys(settings.Values).forEach(key => {
    process.env[key] = settings.Values[key];
});

// Test function
async function test() {
    var databaseComponents = await getComponents();
    var regScaleComponents = await regscale.getComponents();
}

// Run the test
test();
