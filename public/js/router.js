import { renderHome, renderCollection, renderProduct, renderPlayer, renderDeliveryReturns, renderConditions, renderContactUs } from './views.js';

const routes = {
    '': renderHome,
    '/': renderHome,
    'collection': renderCollection,
    'product': renderProduct,
    'player': renderPlayer,
    'delivery': renderDeliveryReturns,
    'conditions': renderConditions,
    'contact': renderContactUs
};

export function initRouter(appElement) {
    
    function handleRoute() {
        const hash = window.location.hash || '#/';
        // Remove # and split
        const path = hash.slice(1); // /collection/Apparel
        const parts = path.split('/').filter(p => p); // ['collection', 'Apparel']
        
        window.scrollTo(0, 0);

        // Default to home if empty
        if (parts.length === 0) {
            renderHome(appElement);
            return;
        }

        const routeName = parts[0];
        const routeParam = parts[1] ? decodeURIComponent(parts[1]) : null;

        if (routes[routeName]) {
            routes[routeName](appElement, routeParam);
        } else {
            console.warn('Route not found:', routeName);
            renderHome(appElement);
        }
        
        // Refresh icons after render
        if (window.feather) window.feather.replace();
    }

    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Initial load
}