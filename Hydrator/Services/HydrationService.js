const axios = require('axios');

class HydrationService {
  /**
   * Resolves ${lookup:...} templates in a value
   * Syntax: ${lookup:/api/endpoint, jsonPath}
   * Example: ${lookup:/api/organizations/getList, [1].id}
   */
  static async resolveLookup(lookupString, bearerToken, baseUrl) {
    // Extract the endpoint and path from the lookup string
    const match = lookupString.match(/\$\{lookup:([^,]+),\s*(.+)\}/);
    if (!match) {
      throw new Error(`Invalid lookup syntax: ${lookupString}`);
    }

    const endpoint = match[1].trim();
    const jsonPath = match[2].trim();

    console.log(`  🔍 Lookup: ${endpoint} -> ${jsonPath}`);

    // Execute the lookup call
    const config = {
      method: 'get',
      url: `${baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios(config);

    // Navigate the JSON path
    let value = response.data;

    // Parse and evaluate the JSON path
    // Handle array notation like [0] and object notation like .property
    const pathParts = jsonPath.match(/\[(\d+)\]|\.?(\w+)/g);

    if (pathParts) {
      for (const part of pathParts) {
        if (part.startsWith('[')) {
          // Array index
          const index = parseInt(part.slice(1, -1));
          value = value[index];
        } else {
          // Object property
          const prop = part.startsWith('.') ? part.slice(1) : part;
          value = value[prop];
        }

        if (value === undefined) {
          throw new Error(`Path ${jsonPath} not found in response from ${endpoint}`);
        }
      }
    }

    console.log(`  ✓ Resolved to: ${value}`);
    return value;
  }

  /**
   * Recursively processes an object/array to resolve all ${lookup:...} templates
   */
  static async resolveTemplates(obj, bearerToken, baseUrl) {
    if (typeof obj === 'string') {
      // Check if this string contains a lookup template
      if (obj.includes('${lookup:')) {
        return await this.resolveLookup(obj, bearerToken, baseUrl);
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      const resolved = [];
      for (const item of obj) {
        resolved.push(await this.resolveTemplates(item, bearerToken, baseUrl));
      }
      return resolved;
    }

    if (obj !== null && typeof obj === 'object') {
      const resolved = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = await this.resolveTemplates(value, bearerToken, baseUrl);
      }
      return resolved;
    }

    return obj;
  }

  static async executeCall(call, bearerToken, baseUrl) {
    try {
      console.log(`Executing call: ${call.name} (${call.method} ${call.url})`);

      // Resolve any templates in the call body
      let resolvedBody = call.body;
      if (call.body) {
        resolvedBody = await this.resolveTemplates(call.body, bearerToken, baseUrl);
      }

      const config = {
        method: call.method.toLowerCase(),
        url: `${baseUrl}${call.url}`,
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
          ...call.headers
        }
      };

      // Add body for POST, PUT, PATCH requests
      if (resolvedBody && ['post', 'put', 'patch'].includes(config.method)) {
        config.data = resolvedBody;
      }

      const response = await axios(config);

      console.log(`✅ Call ${call.name} completed with status ${response.status}`);

      return {
        statusCode: response.status,
        data: response.data
      };

    } catch (error) {
      console.error(`❌ Call ${call.name} failed:`, error.message);

      const statusCode = error.response?.status || 500;
      const data = error.response?.data || { error: error.message };

      return {
        statusCode,
        data
      };
    }
  }

  static async executeAllCalls(hydrationData) {
    console.log('🚀 Starting batch execution of all calls...');

    const results = [];

    for (let i = 0; i < hydrationData.calls.length; i++) {
      const call = hydrationData.calls[i];

      console.log(`\n📞 Executing call ${i + 1}/${hydrationData.calls.length}: ${call.name}`);

      const result = await this.executeCall(call, hydrationData.bearerToken, hydrationData.baseUrl);

      // Update the call with result
      call.result = result.data;
      call.statusCode = result.statusCode;

      results.push({
        callId: call.id,
        callName: call.name,
        statusCode: result.statusCode,
        success: result.statusCode >= 200 && result.statusCode < 300
      });

      // Stop execution if call failed (non-2xx status)
      if (result.statusCode < 200 || result.statusCode >= 300) {
        console.error(`💥 Execution stopped at call "${call.name}" with status ${result.statusCode}`);
        throw new Error(`Call "${call.name}" failed with status ${result.statusCode}. Execution stopped.`);
      }

      // Small delay between calls to be gentle on the API
      if (i < hydrationData.calls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('✅ All calls executed successfully!');
    return results;
  }

  static validateCall(call) {
    const errors = [];

    if (!call.name || call.name.trim() === '') {
      errors.push('Call name is required');
    }

    if (!call.method || !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(call.method.toUpperCase())) {
      errors.push('Valid HTTP method is required');
    }

    if (!call.url || call.url.trim() === '') {
      errors.push('URL is required');
    }

    return errors;
  }

  static createCallTemplate() {
    return {
      id: `call-${Date.now()}`,
      name: 'New API Call',
      method: 'GET',
      url: '/api/',
      headers: {},
      body: null,
      result: null,
      statusCode: null
    };
  }
}

module.exports = HydrationService;