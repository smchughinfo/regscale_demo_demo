const axios = require('axios');

class HydrationService {
  static async executeCall(call, bearerToken, baseUrl) {
    try {
      console.log(`Executing call: ${call.name} (${call.method} ${call.url})`);

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
      if (call.body && ['post', 'put', 'patch'].includes(config.method)) {
        config.data = call.body;
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