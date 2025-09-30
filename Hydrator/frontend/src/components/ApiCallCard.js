import React, { useState } from 'react';

const ApiCallCard = ({ call, index, onUpdate, onExecute }) => {
  const [expanded, setExpanded] = useState(false);

  const methodColors = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    PATCH: 'info',
    DELETE: 'danger'
  };

  const statusColors = {
    200: 'success',
    201: 'success',
    400: 'warning',
    401: 'warning',
    403: 'warning',
    404: 'warning',
    500: 'danger'
  };

  const updateField = (field, value) => {
    const updatedCall = { ...call, [field]: value };
    onUpdate(call.id, updatedCall);
  };

  const updateHeader = (key, value) => {
    const newHeaders = { ...call.headers };
    if (value.trim() === '') {
      delete newHeaders[key];
    } else {
      newHeaders[key] = value;
    }
    updateField('headers', newHeaders);
  };

  const addHeader = () => {
    const newHeaders = { ...call.headers, '': '' };
    updateField('headers', newHeaders);
  };

  const removeHeader = (key) => {
    const newHeaders = { ...call.headers };
    delete newHeaders[key];
    updateField('headers', newHeaders);
  };

  const updateBody = (value) => {
    try {
      const parsed = value.trim() === '' ? null : JSON.parse(value);
      updateField('body', parsed);
    } catch (e) {
      // Invalid JSON, keep as string for now
      updateField('body', value);
    }
  };

  const formatJson = (obj) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return String(obj);
    }
  };

  const hasResult = call.result !== null || call.statusCode !== null;

  return (
    <div className="card mb-3 api-call-card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <span className="badge bg-secondary me-2">#{index + 1}</span>
          <span className={`badge bg-${methodColors[call.method] || 'secondary'} me-2`}>
            {call.method}
          </span>
          <h6 className="mb-0">{call.name}</h6>
          {hasResult && (
            <span className={`badge bg-${statusColors[call.statusCode] || 'secondary'} ms-2`}>
              {call.statusCode}
            </span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => onExecute(call.id)}
          >
            <i className="bi bi-play-fill"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setExpanded(!expanded)}
          >
            <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Basic Info */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={call.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Method</label>
            <select
              className="form-select"
              value={call.method}
              onChange={(e) => updateField('method', e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">URL</label>
            <input
              type="text"
              className="form-control font-monospace"
              value={call.url}
              onChange={(e) => updateField('url', e.target.value)}
              placeholder="/api/endpoint"
            />
          </div>
        </div>

        {expanded && (
          <>
            {/* Headers */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">Headers</label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addHeader}
                >
                  <i className="bi bi-plus"></i> Add Header
                </button>
              </div>
              {Object.entries(call.headers || {}).map(([key, value]) => (
                <div key={key} className="row mb-2">
                  <div className="col-5">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Header name"
                      value={key}
                      onChange={(e) => {
                        const newHeaders = { ...call.headers };
                        delete newHeaders[key];
                        newHeaders[e.target.value] = value;
                        updateField('headers', newHeaders);
                      }}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Header value"
                      value={value}
                      onChange={(e) => updateHeader(key, e.target.value)}
                    />
                  </div>
                  <div className="col-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeHeader(key)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
              {Object.keys(call.headers || {}).length === 0 && (
                <div className="text-muted small">No headers defined</div>
              )}
            </div>

            {/* Body */}
            {['POST', 'PUT', 'PATCH'].includes(call.method) && (
              <div className="mb-3">
                <label className="form-label">Request Body (JSON)</label>
                <textarea
                  className="form-control font-monospace"
                  rows="6"
                  value={formatJson(call.body)}
                  onChange={(e) => updateBody(e.target.value)}
                  placeholder='{"key": "value"}'
                />
              </div>
            )}
          </>
        )}

        {/* Results */}
        {hasResult && (
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0">
                <i className="bi bi-check-circle-fill text-success me-1"></i>
                Response
              </label>
              <small className="text-muted">
                Status: <span className={`text-${statusColors[call.statusCode] || 'secondary'}`}>
                  {call.statusCode}
                </span>
              </small>
            </div>
            <div className="border rounded p-3 bg-light">
              <pre className="mb-0 small">{formatJson(call.result)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiCallCard;