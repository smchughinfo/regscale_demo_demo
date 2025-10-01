# Health Widgets - Business Model

## Company Overview

**Health Widgets Inc.** is a small medical device manufacturer that creates connected healthcare monitoring devices. Started 5 years ago, the company is growing rapidly and now faces increasing compliance requirements from regulators, customers, and insurance companies.

## Products

Health Widgets manufactures three main product lines:

### 1. WidgetMonitor™
- **What it is:** Bedside patient vital signs monitor
- **What it does:** Tracks heart rate, blood pressure, temperature, oxygen levels
- **Technology:** Wi-Fi connected device that sends data to hospital systems
- **Used by:** Hospitals, urgent care centers, nursing homes

### 2. GlucoWidget™
- **What it is:** Continuous glucose monitoring system
- **What it does:** Small sensor that tracks blood sugar 24/7 and sends alerts to patient's phone
- **Technology:** Bluetooth sensor + mobile app + cloud dashboard
- **Used by:** Diabetic patients, endocrinologists

### 3. WidgetPump™ (Coming Soon)
- **What it is:** Smart insulin delivery pump
- **What it does:** Automatically adjusts insulin based on glucose readings
- **Technology:** Integrated with GlucoWidget sensors
- **Status:** Currently in development and regulatory review

## Business Model

- **Revenue:** Sell devices to hospitals and distribute consumer devices through pharmacies
- **Customers:** Healthcare facilities (70%), individual patients (30%)
- **Scale:** 50 employees, manufacturing in the US, growing 40% year-over-year
- **Challenge:** Compliance requirements are becoming complex as they grow

## Why They Need Compliance

### Regulatory Requirements
Health Widgets must comply with several regulations:

1. **FDA (Food and Drug Administration)**
   - All medical devices must be approved before sale
   - Must prove devices are safe and effective
   - Subject to surprise inspections
   - Must report any device failures or patient incidents

2. **Cybersecurity Standards**
   - Connected devices can be hacked
   - Must protect patient health data
   - Need security controls in device software
   - Must respond to security vulnerabilities

3. **Quality Management (ISO 13485)**
   - International standard for medical device quality
   - Required by many hospital customers
   - Covers design, manufacturing, testing, distribution

4. **Privacy (HIPAA)**
   - Patient health data must be protected
   - Applies to their cloud systems and mobile apps
   - Requires security controls and audit trails

## The Compliance Problem

Health Widgets is struggling because:

### Too Much to Track
- 3 product lines, each with different compliance needs
- 20+ suppliers providing components (chips, sensors, batteries)
- Multiple software versions for each device
- Hundreds of security and quality controls to maintain

### Manual Documentation
- Using spreadsheets and Word documents
- Information scattered across systems
- Hard to find evidence during audits
- Takes weeks to prepare for inspections

### Growing Risk
- One security breach could shut down the business
- One failed inspection could stop product sales
- Customers demanding proof of compliance before purchasing
- Insurance costs rising due to compliance gaps

## How RegScale Helps

Health Widgets uses RegScale to:

1. **Track Everything in One Place**
   - All devices, components, and controls in one system
   - Link controls to specific product versions
   - Map risks to mitigation plans

2. **Prepare for Audits Quickly**
   - Generate compliance reports on demand
   - Show evidence for any control
   - Track assessment history

3. **Manage Suppliers**
   - Risk score for each supplier
   - Track which devices use which components
   - Get alerts when supplier has issues

4. **Monitor Security**
   - Track security controls across all devices
   - Document vulnerability responses
   - Show customers their security posture

## Key Data We'll Model

To demonstrate RegScale's value for Health Widgets, we need to model:

### Products/Systems
- WidgetMonitor (Production)
- GlucoWidget (Production)
- WidgetPump (Development)
- Cloud Platform (supporting all devices)
- Mobile App (for GlucoWidget)

### Components
- Hardware: Sensors, processors, batteries, displays, wireless modules
- Software: Embedded firmware, mobile apps, cloud services
- Infrastructure: AWS servers, databases, APIs

### Compliance Requirements
- Security controls (encryption, authentication, access control)
- Quality controls (testing, validation, manufacturing processes)
- Risk controls (risk assessments, mitigation plans)

### Stakeholders
- FDA (regulator)
- Hospital customers (require compliance proof)
- Component suppliers (introduce supply chain risk)
- Internal teams (engineering, quality, security)

### Activities
- Security assessments
- Internal quality audits
- FDA mock inspections
- Supplier evaluations
- Vulnerability scans
- Risk reviews

## Demo Application Ideas

Using this business model, we could build demos that show:

1. **Compliance Dashboard**
   - Overview: How compliant is each product?
   - Visual: Green/yellow/red status indicators
   - Drill-down: See which controls need attention

2. **Product Security Report**
   - Generate a security summary for a specific device
   - Show what security controls are implemented
   - Export as PDF for customer requests

3. **Supply Chain Risk View**
   - Map which components are in which devices
   - Highlight high-risk suppliers
   - Show impact if a supplier has problems

4. **Audit Preparation Tool**
   - Checklist of what auditors will ask for
   - Quick links to evidence for each requirement
   - Status tracking for remediation items

5. **Risk Heat Map**
   - Visualize risks across products
   - Show which risks are mitigated vs. open
   - Link to specific controls that address each risk

## Keeping It Simple

For our demo, we'll focus on:
- **3 products** (not dozens)
- **Basic compliance concepts** (controls, risks, assessments)
- **Simple relationships** (product → controls → assessments)
- **Realistic but minimal data** (enough to show value, not overwhelming)

We don't need to be compliance experts - just show how RegScale organizes compliance information in a way that's useful for a small medical device company.

---

**Next Steps:**
1. Use the Hydrator to create these entities in RegScale via API
2. Build relationships between products, controls, and risks
3. Create sample assessment data
4. Design and build a simple demo application that visualizes this data