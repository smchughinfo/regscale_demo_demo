const fs = require('fs');
const data = JSON.parse(fs.readFileSync('hydration.json', 'utf8'));

console.log('=== ANALYSIS OF CREATED ENTITIES ===\n');

const calls = data.calls || [];

// Extract sample data from successful POST calls
const entities = {
  organizations: [],
  facilities: [],
  accounts: [],
  securityplans: [],
  catalogues: [],
  securitycontrols: [],
  components: [],
  assets: [],
  risks: [],
  assessments: [],
  supplychain: []
};

calls.forEach(call => {
  if (call.method !== 'GET' && call.result && call.statusCode === 200) {
    const url = call.url.toLowerCase();
    const result = call.result;

    if (url.includes('/organizations')) entities.organizations.push(result);
    if (url.includes('/facilities')) entities.facilities.push(result);
    if (url.includes('/accounts')) entities.accounts.push(result);
    if (url.includes('/securityplans')) entities.securityplans.push(result);
    if (url.includes('/catalogues')) entities.catalogues.push(result);
    if (url.includes('/securitycontrols')) entities.securitycontrols.push(result);
    if (url.includes('/components')) entities.components.push(result);
    if (url.includes('/assets')) entities.assets.push(result);
    if (url.includes('/risks')) entities.risks.push(result);
    if (url.includes('/assessments')) entities.assessments.push(result);
    if (url.includes('/supplychain')) entities.supplychain.push(result);
  }
});

console.log('Entity Counts:');
Object.entries(entities).forEach(([type, items]) => {
  if (items.length > 0) console.log(`  ${type}: ${items.length}`);
});

console.log('\n=== SAMPLE DATA (first 2 of each) ===\n');

// Organizations
if (entities.organizations.length > 0) {
  console.log('Organizations:');
  entities.organizations.slice(0, 2).forEach(org => {
    console.log(`  - ${org.name || org.title || 'Unnamed'}`);
  });
}

// Accounts
if (entities.accounts.length > 0) {
  console.log('\nAccounts:');
  entities.accounts.slice(0, 3).forEach(acc => {
    const name = `${acc.firstName || ''} ${acc.lastName || ''}`.trim();
    const title = acc.title ? ` - ${acc.title}` : '';
    console.log(`  - ${name}${title}`);
  });
}

// Security Plans
if (entities.securityplans.length > 0) {
  console.log('\nSecurity Plans:');
  entities.securityplans.slice(0, 3).forEach(sp => {
    console.log(`  - ${sp.name || sp.title || 'Unnamed'}`);
  });
}

// Components
if (entities.components.length > 0) {
  console.log('\nComponents:');
  entities.components.slice(0, 3).forEach(comp => {
    console.log(`  - ${comp.componentName || comp.name || 'Unnamed'}`);
  });
}

console.log('\n=== RELATIONSHIP ANALYSIS ===\n');

// Check what fields exist for relationships
const sampleControl = entities.securitycontrols[0];
if (sampleControl) {
  console.log('Sample Security Control fields:', Object.keys(sampleControl).join(', '));
}

const sampleRisk = entities.risks[0];
if (sampleRisk) {
  console.log('Sample Risk fields:', Object.keys(sampleRisk).join(', '));
}

const sampleComponent = entities.components[0];
if (sampleComponent) {
  console.log('Sample Component fields:', Object.keys(sampleComponent).join(', '));
}