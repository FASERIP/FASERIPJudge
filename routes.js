import { GameSystemRoutes } from './game_system_routes.js';
import data from './universal_table.json' assert { type: 'json' };
 
const routes = {
    ...GameSystemRoutes(data),
};

export { routes };