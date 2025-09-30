const fs = require('fs');

// Read hydration.json
const data = JSON.parse(fs.readFileSync('hydration.json', 'utf8'));

// Control definitions with proper titles and controlIds
const controlUpdates = [
  { id: 'control-encryption-rest', title: 'Data Encryption at Rest', controlId: 'SEC-001', type: 'Security' },
  { id: 'control-encryption-transit', title: 'Data Encryption in Transit (TLS 1.3)', controlId: 'SEC-002', type: 'Security' },
  { id: 'control-mfa', title: 'User Authentication (Multi-factor)', controlId: 'SEC-003', type: 'Security' },
  { id: 'control-rbac', title: 'Access Control (Role-based)', controlId: 'SEC-004', type: 'Security' },
  { id: 'control-logging', title: 'Security Logging and Monitoring', controlId: 'SEC-005', type: 'Security' },
  { id: 'control-vuln-scanning', title: 'Vulnerability Scanning', controlId: 'SEC-006', type: 'Security' },
  { id: 'control-secure-boot', title: 'Secure Boot (Device firmware)', controlId: 'SEC-007', type: 'Security' },
  { id: 'control-code-signing', title: 'Code Signing (Software updates)', controlId: 'SEC-008', type: 'Security' },
  { id: 'control-pentest', title: 'Penetration Testing (Annual)', controlId: 'SEC-009', type: 'Security' },
  { id: 'control-incident-response', title: 'Incident Response Plan', controlId: 'SEC-010', type: 'Security' },
  { id: 'control-design-validation', title: 'Design Validation Testing', controlId: 'QUA-001', type: 'Quality' },
  { id: 'control-sterilization', title: 'Sterilization Validation', controlId: 'QUA-002', type: 'Quality' },
  { id: 'control-electrical-safety', title: 'Electrical Safety Testing', controlId: 'QUA-003', type: 'Quality' },
  { id: 'control-emc-emi', title: 'EMC/EMI Testing', controlId: 'QUA-004', type: 'Quality' },
  { id: 'control-software-validation', title: 'Software Validation (IEC 62304)', controlId: 'QUA-005', type: 'Quality' },
  { id: 'control-usability', title: 'Usability Testing', controlId: 'QUA-006', type: 'Quality' },
  { id: 'control-manufacturing-process', title: 'Manufacturing Process Controls', controlId: 'QUA-007', type: 'Quality' },
  { id: 'control-incoming-inspection', title: 'Component Incoming Inspection', controlId: 'QUA-008', type: 'Quality' },
  { id: 'control-calibration', title: 'Calibration Management', controlId: 'QUA-009', type: 'Quality' },
  { id: 'control-capa', title: 'Corrective/Preventive Action (CAPA)', controlId: 'QUA-010', type: 'Quality' }
];

// Update each control in the calls array
for (let call of data.calls) {
  const update = controlUpdates.find(u => u.id === call.id);

  if (update) {
    // Preserve the existing description
    const oldDescription = call.body.description;

    // Replace the body with the correct structure
    call.body = {
      isPublic: true,
      title: update.title,
      description: oldDescription,
      controlId: update.controlId,
      controlType: update.type,
      catalogueId: "${lookup:/api/catalogues/getList, [0].id}"
    };

    // Reset result and statusCode
    call.result = null;
    call.statusCode = null;

    console.log(`Updated: ${update.title}`);
  }
}

// Write back to file
fs.writeFileSync('hydration.json', JSON.stringify(data, null, 2));
console.log('\nAll controls updated successfully!');