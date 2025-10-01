# RegScale Vulnerability Impact Analyzer

## Demo Concept

**Problem**: When a security vulnerability is discovered in a hardware component (e.g., CVE affecting TI CC2640 Bluetooth chip), GRC teams manually search through spreadsheets, documents, and systems to identify impact.

**Solution**: LangChain-powered natural language query system that leverages RegScale's GRC data to provide instant vulnerability impact analysis.

## Real-World Use Case

### Example Scenarios:
1. **Log4j vulnerability (Dec 2021)** - Organizations scrambled to find all systems using Log4j
2. **Heartbleed (OpenSSL)** - Medical device manufacturers needed to identify affected devices
3. **Spectre/Meltdown (Intel CPUs)** - Impact analysis across entire product portfolios
4. **Chip supply chain issues** - Identifying alternative suppliers and affected products

### Medical Device Context:
- FDA requires Software Bill of Materials (SBOM) tracking
- Vulnerability disclosure requires rapid impact assessment
- Patient safety depends on quick identification of affected devices
- Regulatory reporting deadlines are tight

## Demo Flow

### Input:
```
"CVE-2024-XXXX affects TI CC2640 Bluetooth chips"
```

### LangChain Agent Workflow:
1. **Parse vulnerability** - Extract component identifiers (manufacturer, part number, CVE)
2. **Query RegScale API** - Find matching components via `/api/components/getList`
3. **Traverse relationships** - Follow links to:
   - Security Plans (products)
   - Assets (production infrastructure)
   - Risks (related risks)
   - Suppliers (vendor information)
   - Assessments (recent audits/tests)
4. **Aggregate context** - Build comprehensive impact picture
5. **Generate report** - Natural language summary with actionable insights

### Expected Output:
```
⚠️ VULNERABILITY IMPACT ANALYSIS

CVE-2024-XXXX: TI CC2640 Bluetooth Chip Buffer Overflow

AFFECTED PRODUCTS:
- WidgetMonitor (Vital Signs Monitor) - Component ID: 1
- GlucoWidget (Glucose Monitor) - Component ID: 1
- WidgetPump (Insulin Pump) - Component ID: 1

DEPLOYMENT IMPACT:
- Estimated deployed units: 15,000+ devices in field
- FDA Device Class: Class II/III (regulated medical devices)
- Patient safety impact: Medium-High

MITIGATION REQUIRED:
- Firmware update required for all three products
- Responsible: Mike Rodriguez (IT Security) - rodriguez@healthwidgets.com
- Alternative component: Nordic nRF52840 (already qualified)

SUPPLIER INFORMATION:
- Supplier: Texas Instruments
- Contract: Active through 2026-01-14
- Strategic Tier: Tier 1 - Critical
- Contract Value: $750,000
- Supplier audit: Completed 2025-06-18 (Passed)

RELATED RISKS:
- Risk #10: Supply chain compromise (malicious component)
- Risk #5: Firmware tampering

NEXT STEPS:
1. Contact TI for vulnerability details and patch timeline
2. Assess firmware update feasibility and timeline
3. Evaluate patient safety impact (ISO 14971 risk analysis)
4. Determine if FDA reporting required (per 21 CFR 806)
5. Prepare customer notification if devices affected
```

## Technical Architecture

### Stack:
- **LangChain** - Agent orchestration, tool calling, prompt management
- **RegScale API** - GRC data source (localhost:5000)
- **Python** - Backend logic
- **OpenAI/Claude** - LLM for natural language understanding

### RegScale API Endpoints to Use:
```
GET /api/components/getList
GET /api/components/{id}
GET /api/securityplans/getList
GET /api/supplychain/getList
GET /api/risks/getAllByParent/{intParentId}/{strModule}
GET /api/assessments/getAllByParent/{intParentID}/{strModule}
GET /api/assets/getList
```

### LangChain Tools:
1. **ComponentLookup** - Search components by name/manufacturer/part number
2. **ImpactAnalysis** - Traverse component relationships to find affected systems
3. **RiskAssessment** - Find related risks and security concerns
4. **SupplierInfo** - Get supplier details and contracts
5. **MitigationRecommendations** - Generate actionable next steps

## Why This Demo Works for Interview

### Shows Understanding Of:
1. **GRC Workflows** - Real vulnerability management process
2. **RegScale Data Model** - Components, Security Plans, Suppliers, Risks all linked
3. **Medical Device Compliance** - FDA requirements, SBOM, patient safety
4. **Practical AI Application** - Not just chatbot, but actual workflow automation
5. **API Integration** - Can extend RegScale platform

### Value Proposition:
- Reduces manual impact analysis from hours/days to seconds
- Improves accuracy by querying structured GRC data
- Provides audit trail for compliance
- Enables proactive risk management
- Natural language interface for non-technical stakeholders

## HealthWidgets Demo Data

### Components We Created:
- TI CC2640 Bluetooth Module (Component ID: 1)
- Qualcomm QCA4020 WiFi Module (Component ID: 2)
- STM32 Microcontroller (Component ID: 3)
- Lithium Ion Battery Pack (Component ID: 4)
- Blood Glucose Sensor (Component ID: 5)
- Heart Rate Sensor (Component ID: 6)
- Blood Pressure Sensor (Component ID: 7)
- LCD Display Module (Component ID: 8)

### Products (Security Plans):
- WidgetMonitor - Vital signs monitoring device
- GlucoWidget - Continuous glucose monitor
- WidgetPump - Insulin delivery system (beta)

### Suppliers:
- Texas Instruments - Bluetooth/MCU
- Qualcomm - WiFi
- Panasonic - Batteries
- Sensirion - Environmental sensors

### Sample Queries to Demonstrate:
1. "Which products use TI Bluetooth chips?"
2. "What's the impact if Qualcomm WiFi modules have a vulnerability?"
3. "Show me all Panasonic battery-powered devices and their deployment status"
4. "What risks are associated with our STM32 microcontroller?"
5. "When was our TI supplier last audited?"

## Next Steps

1. Set up Python environment with LangChain
2. Create RegScale API client wrapper
3. Implement LangChain tools for each API endpoint
4. Build agent with tool-calling capability
5. Test with sample vulnerability scenarios
6. Create simple CLI/web interface
7. Prepare demo script for interview

## Future Enhancements

- **Automated CVE monitoring** - Webhook integration with NVD/CVE feeds
- **Risk scoring** - Calculate quantitative impact based on deployment data
- **Remediation tracking** - Create tasks/issues automatically in RegScale
- **Multi-product analysis** - Compare vulnerability exposure across product lines
- **Supplier scorecards** - Track vulnerability history by supplier
- **Compliance reporting** - Generate FDA/ISO formatted reports