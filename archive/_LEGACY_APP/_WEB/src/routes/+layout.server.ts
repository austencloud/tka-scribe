// src/routes/+layout.server.js
import type { LayoutServerLoad } from './$types';

// Add a cache flag to prevent duplicate fetches
let dataCache: { diamondData: string; boxData: string } | null = null;

export const load: LayoutServerLoad = async ({ fetch: eventFetch }) => {
    // Return cached data if available
    if (dataCache) {
        return {
            csvData: dataCache,
            error: null,
        };
    }

    console.log('Fetching pictograph data in +layout.server.js...');
    try {
        // Use the event.fetch provided by SvelteKit
        const diamondResponse = await eventFetch('/DiamondPictographDataframe.csv');
        const boxResponse = await eventFetch('/BoxPictographDataframe.csv');

        if (!diamondResponse.ok || !boxResponse.ok) {
            console.error('Failed to fetch pictograph CSV files', {
                diamondStatus: diamondResponse.status,
                boxStatus: boxResponse.status,
            });
            // Return empty strings or handle error appropriately for the UI
            return {
                csvData: {
                    diamondData: '',
                    boxData: '',
                },
                error: 'Failed to load pictograph data files.',
            };
        }

        const diamondData = await diamondResponse.text();
        const boxData = await boxResponse.text();

        console.log('Successfully fetched CSV data.');
        
        // Store in cache
        dataCache = { diamondData, boxData };
        
        return {
            csvData: dataCache,
            error: null, // Indicate success
        };
    } catch (error) {
        console.error('Error in +layout.server.js load:', error);
        return {
             csvData: {
                 diamondData: '',
                 boxData: '',
             },
             error: 'An error occurred while loading pictograph data.',
         };
    }
};