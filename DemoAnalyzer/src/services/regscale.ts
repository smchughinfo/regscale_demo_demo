import axios from 'axios';

const REGSCALE_BASE_URL = process.env.REGSCALE_BASE_URL || 'http://4.156.150.217';
const BEARER_TOKEN = process.env.REGSCALE_BEARER_TOKEN;

interface RegScaleComponentListItem {
    id: number;
    title: string;
    status: string;
    exclude: boolean;
    componentType: string;
}

/**
 * Fetch all components from RegScale
 */
export async function getComponents(): Promise<RegScaleComponentListItem[]> {
    try {
        const response = await axios.get(
            `${REGSCALE_BASE_URL}/api/components/getList`,
            {
                headers: {
                    'Authorization': `Bearer ${BEARER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data as RegScaleComponentListItem[];
    } catch (error: any) {
        console.error('Failed to fetch components:', error.message);
        throw new Error(`Failed to fetch components: ${error.message}`);
    }
}
