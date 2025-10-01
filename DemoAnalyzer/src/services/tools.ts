import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { getAllComponents, getComponentById, searchComponentsByName } from './database.js';

/**
 * Tool for getting all components from the database
 */
export const getAllComponentsTool = new DynamicStructuredTool({
    name: 'get_all_components',
    description: 'Retrieve all medical device components from the Health Widgets component database. Use this to get a complete list of hardware and software components that may be affected by a security vulnerability.',
    schema: z.object({}),
    func: async () => {
        const components = await getAllComponents();
        return JSON.stringify(components, null, 2);
    }
});

/**
 * Tool for getting a specific component by ID
 */
export const getComponentByIdTool = new DynamicStructuredTool({
    name: 'get_component_by_id',
    description: 'Retrieve detailed information about a specific component by its ID. Use this when you know the component ID and need its full technical description.',
    schema: z.object({
        id: z.number().describe('The numeric ID of the component to retrieve')
    }),
    func: async ({ id }) => {
        const component = await getComponentById(id);
        if (!component) {
            return `Component with ID ${id} not found.`;
        }
        return JSON.stringify(component, null, 2);
    }
});

/**
 * Tool for searching components by name
 */
export const searchComponentsTool = new DynamicStructuredTool({
    name: 'search_components',
    description: 'Search for components by name (case-insensitive partial match). Use this when you need to find components related to specific technologies, manufacturers, or keywords mentioned in a vulnerability report.',
    schema: z.object({
        searchTerm: z.string().describe('The search term to match against component names (e.g., "Bluetooth", "firmware", "WiFi")')
    }),
    func: async ({ searchTerm }) => {
        const components = await searchComponentsByName(searchTerm);
        if (components.length === 0) {
            return `No components found matching "${searchTerm}".`;
        }
        return JSON.stringify(components, null, 2);
    }
});

/**
 * Export all tools as an array for easy use with LangChain agents
 */
export const componentTools = [
    getAllComponentsTool,
    getComponentByIdTool,
    searchComponentsTool
];
