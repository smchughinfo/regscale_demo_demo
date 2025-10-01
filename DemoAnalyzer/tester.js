import fs from 'fs';
import * as database from './dist/services/database.js';
import * as regscale from './dist/services/regscale.js';
import * as langchain from './dist/services/langchain.js';

// Load environment variables from local.settings.json
const settings = JSON.parse(fs.readFileSync('./local.settings.json', 'utf8'));
Object.keys(settings.Values).forEach(key => {
    process.env[key] = settings.Values[key];
});

// Test function
async function test() {
    //var databaseComponents = await getComponents();
    //var regScaleComponents = await regscale.getComponents();
    var result = await langchain.analyzeComponents("we've discovered a software vulnerability in microchips that may have been manufactured in china.");
    console.log(result);
}

// Run the test
test();
