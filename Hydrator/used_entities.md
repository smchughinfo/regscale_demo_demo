
## Used RegScale Entities

### Organizations (`/api/organizations`)
**What**: Top-level legal entity that owns all GRC data. The parent container for everything in RegScale.
**Our Use**: Created "HealthWidgets Inc" as the root organization for our medical device company.
**Key Fields**: `name`, `description`, `orgId` (self-reference), `isPublic`

### Facilities (`/api/facilities`)
**What**: Physical or virtual locations where work happens. Manufacturing plants, offices, data centers, cloud regions.
**Our Use**: Created 3 facilities - Manufacturing Plant (Carlsbad), R&D Lab (San Diego), AWS Data Centers (us-west-2).
**Key Fields**: `name`, `address`, `facilityType`, `orgId`, `isPublic`
**Links To**: Organization (parent)

### Accounts (`/api/accounts`)
**What**: User/person records representing employees, contractors, or stakeholders who own or are responsible for GRC entities.
**Our Use**: Created 6 users - CEO, CTO, VP Engineering, IT Security Manager, Quality Manager, Legal Counsel.
**Key Fields**: `firstName`, `lastName`, `email`, `title`, `orgId`, `isPublic`
**Links To**: Organization (parent)

### Security Plans (`/api/securityplans`)
**What**: The main container for a product, system, or project's compliance program. Represents what you're trying to secure/certify.
**Our Use**: Created 3 security plans - WidgetMonitor (vital signs), GlucoWidget (glucose), WidgetPump (insulin pump).
**Key Fields**: `name`, `description`, `systemOwner`, `status`, `orgId`, `isPublic`
**Links To**: Organization, Facility, Users (owners)
**Contains**: Components, Controls, Risks, Assets, Assessments

### Catalogues (`/api/catalogues`)
**What**: Libraries of security controls or compliance requirements (e.g., NIST 800-53, ISO 27001). Reusable control templates.
**Our Use**: Created "NIST 800-53 Rev 5 (Medical Device Subset)" with 12 controls.
**Key Fields**: `title`, `description`, `catalogueType`, `orgId`, `isPublic`
**Links To**: Organization

### Security Controls (`/api/securitycontrols`)
**What**: Specific security measures or safeguards implemented to protect systems (e.g., AC-2 Account Management, AU-2 Audit Events).
**Our Use**: Created 12 NIST 800-53 controls linked to specific components and security plans.
**Key Fields**: `controlIdentifier`, `title`, `description`, `implementation`, `catalogueId`, `componentId`, `securityPlanId`, `controlOwnerId`
**Links To**: Catalogue (parent), Security Plan, Component, User (owner)

### Components (`/api/components`)
**What**: System parts, hardware modules, software libraries, or services that make up a product (e.g., Bluetooth chip, firmware, database).
**Our Use**: Created 18 components - hardware (sensors, chips, batteries), software (firmware, mobile apps), cloud services (API gateway, database).
**Key Fields**: `componentName`, `description`, `componentType`, `manufacturer`, `version`, `securityPlanId`, `parentModule`, `parentId`
**Links To**: Security Plan (parent), Catalogue
**Referenced By**: Controls, Risks, Assets, Assessments

### Assets (`/api/assets`)
**What**: Physical or IT infrastructure used to develop, manufacture, or operate products. Production lines, servers, cloud accounts, networks.
**Our Use**: Created 14 assets - 6 physical (production lines, test equipment), 8 IT (AWS accounts, databases, networks).
**Key Fields**: `name`, `description`, `assetType`, `assetCategory`, `assetOwnerId`, `facilityId`, `status`, `parentModule`, `parentId`, `securityPlanId`
**Links To**: Security Plan (parent), Facility, User (owner)

### Risks (`/api/risks`)
**What**: Identified threats, hazards, or vulnerabilities that could cause harm. Product risks (false alarms), cyber risks (data breach), supply chain risks (supplier failure).
**Our Use**: Created 21 risks - 6 product risks, 6 cybersecurity, 5 supply chain, 4 regulatory.
**Key Fields**: `riskStatement`, `riskDefinition`, `probability`, `consequence`, `trigger`, `mitigation`, `status`, `riskOwnerId`, `parentModule`, `parentId`, `securityPlanId`, `componentId`, `controlId`
**Links To**: Security Plan (parent), Component (ONE), Control (ONE), User (owner)
**Risk Types**: `safetyRisk`, `securityRisk`, `complianceRisk`, `businessRisk`, `operationalRisk`, `qualityRisk`, `reputationRisk`

### Assessments (`/api/assessments`)
**What**: Formal audits, tests, or evaluations to verify compliance, security, or quality. Internal audits, external certifications, penetration tests, supplier audits.
**Our Use**: Created 9 assessments - 3 internal audits, 2 external audits, 2 vulnerability assessments, 2 supplier audits.
**Key Fields**: `title`, `assessmentType`, `status`, `plannedStart`, `plannedFinish`, `actualFinish`, `leadAssessorId`, `assessmentPlan`, `methodology`, `scopeIncludes`, `scopeExcludes`, `assessmentResult`, `complianceScore`, `parentModule`, `parentId`, `componentId`
**Links To**: Security Plan (parent), Component (optional), Facility, User (lead assessor)

### Supply Chain / Suppliers (`/api/supplychain`)
**What**: Third-party vendor/supplier records tracking contracts, relationships, and strategic importance. Component suppliers, service providers, manufacturers.
**Our Use**: Created 4 suppliers - Texas Instruments (chips), Qualcomm (WiFi), Panasonic (batteries), Sensirion (sensors).
**Key Fields**: `title`, `contractType`, `scope`, `startDate`, `endDate`, `status`, `strategicTier`, `contractValue`, `contractOwnerId`, `duns`, `ein`, `stockSymbol`, `naics`, `fips`, `parentModule`, `parentId`
**Links To**: Security Plan (parent), User (contract owner)
**Referenced By**: Assessments (supplier audits), Risks (supply chain risks)

---