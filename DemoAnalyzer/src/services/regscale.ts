import axios from 'axios';

const REGSCALE_BASE_URL = process.env.REGSCALE_BASE_URL || 'http://4.156.150.217';
const BEARER_TOKEN = process.env.REGSCALE_BEARER_TOKEN;

interface RegScaleControl {
    id: number;
    [key: string]: any;
}

interface ControlError {
    id: number;
    error: string;
}

/**
 * Fetch controls from RegScale by IDs
 */
export async function getControls(controlIds: number[]): Promise<(RegScaleControl | ControlError)[]> {
    const controls: (RegScaleControl | ControlError)[] = [];

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
        } catch (error: any) {
            console.error(`Failed to fetch control ${id}:`, error.message);
            controls.push({ id, error: error.message });
        }
    }

    return controls;
}

/**
 * Get all controls (with pagination)
 */
export async function getAllControls(): Promise<RegScaleControl[]> {
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
    } catch (error: any) {
        console.error('Failed to fetch controls:', error.message);
        throw error;
    }
}
