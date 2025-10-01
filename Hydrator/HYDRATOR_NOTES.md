# RegScale Hydrator - Reference Documentation

## Lookup Array Index Conventions

When using `${lookup:...}` templates in hydration.json, these array indices are used:

### Organizations (/api/organizations/getList)
```
[0] - Health Widgets Inc. (parent org)
[1] - Engineering Department
[2] - Quality Assurance Department
[3] - Manufacturing Department
```

### Users/Accounts (/api/accounts/getList)
```
[0] - Lisa Thompson (Regulatory Affairs Specialist)
[1] - seanmchugh1 (Admin - you!)
[2] - Sarah Chen (CEO)
[3] - Mike Rodriguez (VP Engineering) ← DEFAULT COMPONENT OWNER
[4] - David Kim (Security Lead)
[5] - Jennifer Park (Quality Manager)
```

### Security Plans (/api/securityplans/getList)
```
[0] - WidgetMonitor System (vital signs monitor)
[1] - GlucoWidget System (glucose monitor)
[2] - WidgetPump System (insulin pump - in development)
[3] - Health Widgets Cloud Platform
[4] - GlucoWidget Mobile App
```

## Standard Field Mappings

### Components
- **componentOwner**: Use `${lookup:/api/accounts/getList, [3].id}` (Mike Rodriguez)
- **complianceSettingsId**: Always `1` (default)
- **status**: Usually `"Active"`

### Security Plans
- **Field name**: `systemName` (not `name`)
- **complianceSettingsId**: Always `1`

### Organizations
- **Field name**: `name` (standard)
- **parentOrgId**: Reference parent org ID for departments

### Users
- **Field name**: `userName`, `firstName`, `lastName` (not `name`)
- **password**: Minimum 12 characters - using `51mpl3Compliance$2`
- **orgId**: Link to organization via lookup

## Lookup Syntax Examples

```json
"componentOwner": "${lookup:/api/accounts/getList, [3].id}"
"securityPlanId": "${lookup:/api/securityplans/getList, [0].id}"
"orgId": "${lookup:/api/organizations/getList, [1].id}"
"parentOrgId": "${lookup:/api/organizations/getList, [0].id}"
```

## Notes
- Array indices are based on the ORDER returned by getList endpoints
- These indices should remain stable unless entities are deleted and recreated
- Always verify indices with utility calls if uncertain
- The lookup system resolves values at execution time, making hydration repeatable

## Execution Order
Current hydration sequence:
1. Organizations (4)
2. Users (5)
3. Facilities (3)
4. Security Plans (5)
5. Components (18)
6. (Future: Controls, Assets, Risks, etc.)