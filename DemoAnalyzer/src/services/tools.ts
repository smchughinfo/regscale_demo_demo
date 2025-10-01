import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { getComponents as getDatabaseComponents } from './database.js';
import { getComponents as getRegScaleComponents } from './regscale.js';

/**
 * Tool for getting component technical details from SQL database
 */
export const getDatabaseComponentsTool = new DynamicStructuredTool({
    name: 'get_database_components',
    description: 'Retrieve detailed technical descriptions of all components from the Health Widgets component database. This returns in-depth technical specifications, known vulnerabilities, version information, dependencies, and implementation details. Use this to analyze technical security implications.',
    schema: z.object({}),
    func: async () => {
        const components = await getDatabaseComponents();
        return JSON.stringify(components, null, 2);
    }
});

/**
 * Tool for getting component inventory from RegScale
 */
export const getRegScaleComponentsTool = new DynamicStructuredTool({
    name: 'get_regscale_components',
    description: 'Retrieve the official component inventory from RegScale GRC system. This returns component names, types (hardware/software), and status information. Use this to get the authoritative list of components currently tracked in the compliance system.',
    schema: z.object({}),
    func: async () => {
        const components = await getRegScaleComponents();
        return JSON.stringify(components, null, 2);
    }
});

/**
 * Export all tools as an array for easy use with LangChain agents
 */
export const componentTools = [
    getDatabaseComponentsTool,
    getRegScaleComponentsTool
];
