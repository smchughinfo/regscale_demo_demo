import React, { useState, useEffect } from 'react';
import ApiCallCard from './components/ApiCallCard';
import ErrorModal from './components/ErrorModal';
import BusinessModelGraph from './components/BusinessModelGraph';
import './App.css';

const App = () => {
  const [hydrationData, setHydrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Load initial data
    loadHydrationData();

    // Setup WebSocket for real-time updates
    setupWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const setupWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
    const wsUrl = `${protocol}//${window.location.hostname}:${port}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'hydrationUpdated') {
        setHydrationData(message.data);
      }
    };

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(setupWebSocket, 3000);
    };

    setWs(websocket);
  };

  const loadHydrationData = async () => {
    try {
      const response = await fetch('/api/hydration');
      const data = await response.json();
      setHydrationData(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load hydration data');
      setLoading(false);
    }
  };

  const updateHydrationData = async (newData) => {
    try {
      await fetch('/api/hydration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
    } catch (err) {
      setError('Failed to save changes');
    }
  };

  const executeAllCalls = async () => {
    setExecuting(true);
    try {
      const response = await fetch('/api/execute', {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Execution failed');
      }

      const result = await response.json();
      console.log('All calls executed successfully', result);
    } catch (err) {
      setError(`Execution failed: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const clearAllResults = async () => {
    try {
      await fetch('/api/clear', {
        method: 'POST'
      });
    } catch (err) {
      setError('Failed to clear results');
    }
  };

  const addNewCall = async () => {
    try {
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New API Call',
          method: 'GET',
          url: '/api/'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add new call');
      }
    } catch (err) {
      setError('Failed to add new call');
    }
  };

  const executeCall = async (callId) => {
    try {
      const response = await fetch(`/api/execute/${callId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Call execution failed');
      }

      const result = await response.json();
      console.log(`Call ${callId} executed successfully`, result);
    } catch (err) {
      setError(`Call execution failed: ${err.message}`);
    }
  };

  const updateCall = (callId, updatedCall) => {
    const newData = {
      ...hydrationData,
      calls: hydrationData.calls.map(call =>
        call.id === callId ? updatedCall : call
      )
    };
    setHydrationData(newData);
    updateHydrationData(newData);
  };

  const updateBearerToken = (newToken) => {
    const newData = {
      ...hydrationData,
      bearerToken: newToken
    };
    setHydrationData(newData);
    updateHydrationData(newData);
  };

  const toggleSection = (sectionName) => {
    const newData = {
      ...hydrationData,
      uiState: {
        ...hydrationData.uiState,
        [sectionName]: !hydrationData.uiState?.[sectionName]
      }
    };
    setHydrationData(newData);
    updateHydrationData(newData);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <ErrorModal error={error} onClose={() => setError(null)} />

      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 mb-3">
            <i className="bi bi-database-gear me-2"></i>
            RegScale Hydrator
          </h1>

          {/* Bearer Token */}
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-key me-2"></i>
                Bearer Token
              </h5>
              <div className="input-group">
                <span className="input-group-text">Bearer</span>
                <input
                  type="text"
                  className="form-control font-monospace small"
                  value={hydrationData?.bearerToken || ''}
                  onChange={(e) => updateBearerToken(e.target.value)}
                  placeholder="Paste your bearer token here..."
                />
              </div>
              <div className="form-text">
                This token will be automatically included in all API calls
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Model Graph */}
      <div className="row mb-4">
        <div className="col">
          <div
            className="d-flex justify-content-between align-items-center mb-3"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSection('graphExpanded')}
          >
            <h5 className="mb-0">
              <i className="bi bi-diagram-3 me-2"></i>
              Business Model Graph
            </h5>
            <i className={`bi bi-chevron-${hydrationData?.uiState?.graphExpanded ? 'up' : 'down'}`}></i>
          </div>
          {hydrationData?.uiState?.graphExpanded && (
            <div className="card">
              <div className="card-body">
                <BusinessModelGraph hydrationData={hydrationData} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Used RegScale Entities Reference */}
      <div className="row mb-4">
        <div className="col">
          <div
            className="d-flex justify-content-between align-items-center mb-3"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSection('entitiesExpanded')}
          >
            <h5 className="mb-0">
              <i className="bi bi-book me-2"></i>
              Used RegScale Entities Reference
            </h5>
            <i className={`bi bi-chevron-${hydrationData?.uiState?.entitiesExpanded ? 'up' : 'down'}`}></i>
          </div>

          {hydrationData?.uiState?.entitiesExpanded && (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            {/* Organizations */}
            <div className="col">
              <div className="card h-100 border-primary">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0"><strong>Organizations</strong></h6>
                  <small className="font-monospace">/api/organizations</small>
                </div>
                <div className="card-body">
                  <p className="small"><strong>What:</strong> Top-level legal entity that owns all GRC data. The parent container for everything in RegScale.</p>
                  <p className="small"><strong>Our Use:</strong> Created "HealthWidgets Inc" as the root organization for our medical device company.</p>
                  <p className="small mb-0"><strong>Key Fields:</strong> <code>name</code>, <code>description</code>, <code>orgId</code>, <code>isPublic</code></p>
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div className="col">
              <div className="card h-100 border-success">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0"><strong>Facilities</strong></h6>
                  <small className="font-monospace">/api/facilities</small>
                </div>
                <div className="card-body">
                  <p className="small"><strong>What:</strong> Physical or virtual locations where work happens. Manufacturing plants, offices, data centers, cloud regions.</p>
                  <p className="small"><strong>Our Use:</strong> Created 3 facilities - Manufacturing Plant (Carlsbad), R&D Lab (San Diego), AWS Data Centers (us-west-2).</p>
                  <p className="small"><strong>Key Fields:</strong> <code>name</code>, <code>address</code>, <code>facilityType</code>, <code>orgId</code></p>
                  <p className="small mb-0"><strong>Links To:</strong> Organization (parent)</p>
                </div>
              </div>
            </div>

            {/* Accounts */}
            <div className="col">
              <div className="card h-100 border-info">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0"><strong>Accounts</strong></h6>
                  <small className="font-monospace">/api/accounts</small>
                </div>
                <div className="card-body">
                  <p className="small"><strong>What:</strong> User/person records representing employees, contractors, or stakeholders who own or are responsible for GRC entities.</p>
                  <p className="small"><strong>Our Use:</strong> Created 6 users - CEO, CTO, VP Engineering, IT Security Manager, Quality Manager, Legal Counsel.</p>
                  <p className="small"><strong>Key Fields:</strong> <code>firstName</code>, <code>lastName</code>, <code>email</code>, <code>title</code></p>
                  <p className="small mb-0"><strong>Links To:</strong> Organization (parent)</p>
                </div>
              </div>
            </div>

            {/* Security Plans */}
            <div className="col">
              <div className="card h-100 border-warning">
                <div className="card-header bg-warning text-dark">
                  <h6 className="mb-0"><strong>Security Plans</strong></h6>
                  <small className="font-monospace">/api/securityplans</small>
                </div>
                <div className="card-body">
                  <p className="small"><strong>What:</strong> The main container for a product, system, or project's compliance program. Represents what you're trying to secure/certify.</p>
                  <p className="small"><strong>Our Use:</strong> Created 3 security plans - WidgetMonitor (vital signs), GlucoWidget (glucose), WidgetPump (insulin pump).</p>
                  <p className="small"><strong>Key Fields:</strong> <code>name</code>, <code>description</code>, <code>systemOwner</code>, <code>status</code></p>
                  <p className="small mb-0"><strong>Contains:</strong> Components, Controls, Risks, Assets, Assessments</p>
                </div>
              </div>
            </div>

            {/* Catalogues */}
            <div className="col">
              <div className="card h-100 border-danger">
                <div className="card-header bg-danger text-white">
                  <h6 className="mb-0"><strong>Catalogues</strong></h6>
                  <small className="font-monospace">/api/catalogues</small>
                </div>
                <div className="card-body">
                  <p className="small"><strong>What:</strong> Libraries of security controls or compliance requirements (e.g., NIST 800-53, ISO 27001). Reusable control templates.</p>
                  <p className="small"><strong>Our Use:</strong> Created "NIST 800-53 Rev 5 (Medical Device Subset)" with 12 controls.</p>
                  <p className="small"><strong>Key Fields:</strong> <code>title</code>, <code>description</code>, <code>catalogueType</code></p>
                  <p className="small mb-0"><strong>Links To:</strong> Organization</p>
                </div>
              </div>
            </div>

            {/* Security Controls */}
            <div className="col">
              <div className="card h-100 border-secondary">
                <div className="card-header bg-secondary text-white">
                  <h6 className="mb-0"><strong>Security Controls</strong></h6>
                  <small className="font-monospace">/api/securitycontrols</small>
                </div>
                <div className="card-body">
                  <p className="small"><strong>What:</strong> Specific security measures or safeguards implemented to protect systems (e.g., AC-2 Account Management, AU-2 Audit Events).</p>
                  <p className="small"><strong>Our Use:</strong> Created 12 NIST 800-53 controls linked to specific components and security plans.</p>
                  <p className="small"><strong>Key Fields:</strong> <code>controlIdentifier</code>, <code>title</code>, <code>description</code></p>
                  <p className="small mb-0"><strong>Links To:</strong> Catalogue, Security Plan, Component, User (owner)</p>
                </div>
              </div>
            </div>

            {/* Components */}
            <div className="col">
              <div className="card h-100 border-dark">
                <div className="card-header bg-dark text-white">
                  <h6 className="mb-0"><strong>Components</strong></h6>
                  <small className="font-monospace">/api/components</small>
                </div>
                <div className="card-body">
                  <p className="small"><strong>What:</strong> System parts, hardware modules, software libraries, or services that make up a product (e.g., Bluetooth chip, firmware, database).</p>
                  <p className="small"><strong>Our Use:</strong> Created 18 components - hardware (sensors, chips, batteries), software (firmware, mobile apps), cloud services (API gateway, database).</p>
                  <p className="small"><strong>Key Fields:</strong> <code>componentName</code>, <code>description</code>, <code>componentType</code></p>
                  <p className="small mb-0"><strong>Referenced By:</strong> Controls, Risks, Assets, Assessments</p>
                </div>
              </div>
            </div>

            {/* Assets */}
            <div className="col">
              <div className="card h-100" style={{borderColor: '#6f42c1'}}>
                <div className="card-header text-white" style={{backgroundColor: '#6f42c1'}}>
                  <h6 className="mb-0"><strong>Assets</strong></h6>
                  <small className="font-monospace">/api/assets</small>
                </div>
                <div className="card-body">
                  <p className="small"><strong>What:</strong> Physical or IT infrastructure used to develop, manufacture, or operate products. Production lines, servers, cloud accounts, networks.</p>
                  <p className="small"><strong>Our Use:</strong> Created 14 assets - 6 physical (production lines, test equipment), 8 IT (AWS accounts, databases, networks).</p>
                  <p className="small"><strong>Key Fields:</strong> <code>name</code>, <code>assetType</code>, <code>assetCategory</code>, <code>assetOwnerId</code></p>
                  <p className="small mb-0"><strong>Links To:</strong> Security Plan, Facility, User (owner)</p>
                </div>
              </div>
            </div>

            {/* Risks */}
            <div className="col">
              <div className="card h-100" style={{borderColor: '#fd7e14'}}>
                <div className="card-header text-white" style={{backgroundColor: '#fd7e14'}}>
                  <h6 className="mb-0"><strong>Risks</strong></h6>
                  <small className="font-monospace">/api/risks</small>
                </div>
                <div className="card-body">
                  <p className="small"><strong>What:</strong> Identified threats, hazards, or vulnerabilities that could cause harm. Product risks (false alarms), cyber risks (data breach), supply chain risks (supplier failure).</p>
                  <p className="small"><strong>Our Use:</strong> Created 21 risks - 6 product risks, 6 cybersecurity, 5 supply chain, 4 regulatory.</p>
                  <p className="small"><strong>Key Fields:</strong> <code>riskStatement</code>, <code>probability</code>, <code>consequence</code>, <code>mitigation</code></p>
                  <p className="small mb-0"><strong>Links To:</strong> Security Plan, Component, Control, User (owner)</p>
                </div>
              </div>
            </div>

            {/* Assessments */}
            <div className="col">
              <div className="card h-100" style={{borderColor: '#20c997'}}>
                <div className="card-header text-white" style={{backgroundColor: '#20c997'}}>
                  <h6 className="mb-0"><strong>Assessments</strong></h6>
                  <small className="font-monospace">/api/assessments</small>
                </div>
                <div className="card-body">
                  <p className="small"><strong>What:</strong> Formal audits, tests, or evaluations to verify compliance, security, or quality. Internal audits, external certifications, penetration tests, supplier audits.</p>
                  <p className="small"><strong>Our Use:</strong> Created 9 assessments - 3 internal audits, 2 external audits, 2 vulnerability assessments, 2 supplier audits.</p>
                  <p className="small"><strong>Key Fields:</strong> <code>title</code>, <code>assessmentType</code>, <code>status</code>, <code>leadAssessorId</code></p>
                  <p className="small mb-0"><strong>Links To:</strong> Security Plan, Component, Facility, User</p>
                </div>
              </div>
            </div>

            {/* Supply Chain */}
            <div className="col">
              <div className="card h-100" style={{borderColor: '#d63384'}}>
                <div className="card-header text-white" style={{backgroundColor: '#d63384'}}>
                  <h6 className="mb-0"><strong>Supply Chain / Suppliers</strong></h6>
                  <small className="font-monospace">/api/supplychain</small>
                </div>
                <div className="card-body">
                  <p className="small"><strong>What:</strong> Third-party vendor/supplier records tracking contracts, relationships, and strategic importance. Component suppliers, service providers, manufacturers.</p>
                  <p className="small"><strong>Our Use:</strong> Created 4 suppliers - Texas Instruments (chips), Qualcomm (WiFi), Panasonic (batteries), Sensirion (sensors).</p>
                  <p className="small"><strong>Key Fields:</strong> <code>title</code>, <code>contractType</code>, <code>strategicTier</code>, <code>contractValue</code></p>
                  <p className="small mb-0"><strong>Referenced By:</strong> Assessments (supplier audits), Risks (supply chain risks)</p>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Utility Methods */}
      {hydrationData?.utilities && hydrationData.utilities.length > 0 && (
        <div className="row mb-4">
          <div className="col">
            <div
              className="d-flex justify-content-between align-items-center mb-3"
              style={{ cursor: 'pointer' }}
              onClick={() => toggleSection('utilitiesExpanded')}
            >
              <h5 className="mb-0">
                <i className="bi bi-wrench me-2"></i>
                Utility Methods (GET)
              </h5>
              <i className={`bi bi-chevron-${hydrationData?.uiState?.utilitiesExpanded ? 'up' : 'down'}`}></i>
            </div>
            {hydrationData?.uiState?.utilitiesExpanded && hydrationData.utilities.map((call, index) => (
              <ApiCallCard
                key={call.id}
                call={call}
                index={index}
                onUpdate={(callId, updatedCall) => {
                  const newData = {
                    ...hydrationData,
                    utilities: hydrationData.utilities.map(u =>
                      u.id === callId ? updatedCall : u
                    )
                  };
                  setHydrationData(newData);
                  updateHydrationData(newData);
                }}
                onExecute={executeCall}
              />
            ))}
          </div>
        </div>
      )}

      {/* API Calls (Creation Methods) */}
      {hydrationData?.calls?.filter(call => call.method !== 'GET').length > 0 && (
        <div className="row">
          <div className="col">
            <div
              className="d-flex justify-content-between align-items-center mb-3"
              style={{ cursor: 'pointer' }}
              onClick={() => toggleSection('creationExpanded')}
            >
              <h5 className="mb-0">
                <i className="bi bi-plus-square me-2"></i>
                Creation Methods (POST/PUT/PATCH/DELETE)
              </h5>
              <i className={`bi bi-chevron-${hydrationData?.uiState?.creationExpanded ? 'up' : 'down'}`}></i>
            </div>
            {hydrationData?.uiState?.creationExpanded && hydrationData.calls
              .map((call, originalIndex) => ({ call, originalIndex }))
              .filter(({ call }) => call.method !== 'GET')
              .map(({ call, originalIndex }) => (
                <ApiCallCard
                  key={call.id}
                  call={call}
                  index={originalIndex}
                  onUpdate={updateCall}
                  onExecute={executeCall}
                />
              ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!hydrationData?.calls || hydrationData.calls.length === 0) && (
        <div className="row">
          <div className="col">
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <h4 className="text-muted mt-3">No API calls defined</h4>
              <p className="text-muted">Add your first API call to get started</p>
              <button className="btn btn-primary" onClick={addNewCall}>
                <i className="bi bi-plus-circle me-2"></i>
                Add First Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;