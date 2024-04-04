import { parse } from 'node:url';

// Set HTTP Headers
function setHeaders(res, headers) {
    for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value);
    }
}

// Matches a route by path, respecting route variables
function matchRoute(pathname, routePattern) {
    const pathSegments = pathname.split('/').filter(Boolean);
    const patternSegments = routePattern.split('/').filter(Boolean);

    if (pathSegments.length !== patternSegments.length) {
        return null;
    }

    const params = {};

    for (let i = 0; i < patternSegments.length; i++) {
        if (patternSegments[i].startsWith(':')) {
            const paramName = patternSegments[i].slice(1);
            params[paramName] = pathSegments[i];
        } else if (patternSegments[i] !== pathSegments[i]) {
            return null;
        }
    }

    return params;
}

// Route handlers
const defaultRoutes = {
    '/': (_, res) => {
        res.statusCode = 204;
        res.end();
    }
};

// Default handler for unknown routes
function defaultHandler(_, res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
}

// Handler for server errors
function handleServerError(_, res, error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
    return {
        message: 'An unexpected error occurred',
        error,
    };
}

function Router(config, routes = {}, logger = { logInfo: console.info, logError: console.error }) {
    const myRoutes = {
        ...defaultRoutes,
        ...routes,
    };

    const {
        securityHeaders = {},
        corsHeaders = {},
    } = config;

    function setSecurityHeaders(res) {
        setHeaders(res, securityHeaders);
    }

    function setCORSHeaders(res) {
        setHeaders(res, corsHeaders);
    }

    // Handle incoming requests
    function handleRequest(req, res) {
        setSecurityHeaders(res);
        setCORSHeaders(res);
        const parsedUrl = parse(req.url, true);
        let matchedRoute = null;
        let params = null;

        for (const routePattern in myRoutes) {
            params = matchRoute(parsedUrl.pathname, routePattern);
            if (params) {
                matchedRoute = myRoutes[routePattern];
                break;
            }
        }

        try {
            const routeHandler = matchedRoute || defaultHandler;
            routeHandler(req, res, params);
        } catch (err) {
            const {
                message,
                error
            } = handleServerError(req, res, err);
            console.error('oop');
            logger.logError(message, error);
        }
    }

    return {
        handleRequest,
    };
}

export { Router };