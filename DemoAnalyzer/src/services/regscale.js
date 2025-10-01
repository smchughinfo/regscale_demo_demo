const axios = require('axios');

const REGSCALE_BASE_URL = process.env.REGSCALE_BASE_URL || 'http://4.156.150.217';
const BEARER_TOKEN = process.env.REGSCALE_BEARER_TOKEN;

/**
 * Fetch controls from RegScale by IDs
 * @param {number[]} controlIds - Array of control IDs
 * @returns {Promise<Object[]>} Array of control objects
 */
async function getControls(controlIds) {
    const controls = [];

    for (const id of controlIds) {
        try {
            const response = await axios.get(
                `${REGSCALE_BASE_URL}/api/securitycontrols/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${BEARER_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            controls.push(response.data);
        } catch (error) {
            console.error(`Failed to fetch control ${id}:`, error.message);
            controls.push({ id, error: error.message });
        }
    }

    return controls;
}

/**
 * Get all controls (with pagination)
 * @returns {Promise<Object[]>}
 */
async function getAllControls() {
    try {
        const response = await axios.get(
            `${REGSCALE_BASE_URL}/api/securitycontrols/getList`,
            {
                headers: {
                    'Authorization': `Bearer ${BEARER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to fetch controls:', error.message);
        throw error;
    }
}

module.exports = {
    getControls,
    getAllControls
};
