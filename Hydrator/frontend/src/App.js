import React, { useState, useEffect } from 'react';
import ApiCallCard from './components/ApiCallCard';
import ErrorModal from './components/ErrorModal';
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
    const wsUrl = `ws://${window.location.hostname}:3001`;
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

          {/* Control Buttons */}
          <div className="d-flex gap-2 mb-4">
            <button
              className="btn btn-success"
              onClick={executeAllCalls}
              disabled={executing}
            >
              {executing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Executing...
                </>
              ) : (
                <>
                  <i className="bi bi-play-fill me-2"></i>
                  Execute All
                </>
              )}
            </button>

            <button
              className="btn btn-warning"
              onClick={clearAllResults}
            >
              <i className="bi bi-eraser me-2"></i>
              Clear Results
            </button>

            <button
              className="btn btn-primary"
              onClick={addNewCall}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add New Call
            </button>
          </div>
        </div>
      </div>

      {/* API Calls */}
      <div className="row">
        <div className="col">
          {hydrationData?.calls?.map((call, index) => (
            <ApiCallCard
              key={call.id}
              call={call}
              index={index}
              onUpdate={updateCall}
              onExecute={executeCall}
            />
          ))}

          {(!hydrationData?.calls || hydrationData.calls.length === 0) && (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <h4 className="text-muted mt-3">No API calls defined</h4>
              <p className="text-muted">Add your first API call to get started</p>
              <button className="btn btn-primary" onClick={addNewCall}>
                <i className="bi bi-plus-circle me-2"></i>
                Add First Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;