import { createServer } from 'http';
import { readFileSync } from 'fs';

import { Logger } from './logger';
import { Router } from './router';

const defaultConfig = {
  port: 3000,
  logger: console,
  securityHeaders: {
    'Content-Security-Policy': "default-src 'self'",
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  },
  corsHeaders: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  },
  gameSystemDataPath: './universal_table.json',
};

let config = defaultConfig;
let gameSystemData = {};
let {
  logger = console,
} = config;

// Load configuration
function loadConfig(customConfig = {}) {
  config = { ...defaultConfig, ...customConfig };
  logger = config.logger;
}

// Load game system data
function loadGameSystemData(gameSystemDataPath = config.gameSystemDataPath) {
  const rawData = readFileSync(gameSystemDataPath, 'utf8');
  gameSystemData = JSON.parse(rawData);
}

// Start the server
function startServer(customConfig = {}) {
  loadConfig(customConfig);

  const {
    logError,
    logInfo,
  } = Logger(logger);
  logInfo("Configuration loaded.");
  try {
    loadGameSystemData();
    logInfo("Game system data loaded successfully.");
  } catch (error) {
    logError(`Failed to load game system data: ${error.message}`, error);
    process.exit(1);
  }

  const {
    handleRequest
  } = Router(config, routes);

  const server = createServer(handleRequest);
  logInfo("Server starting.");
  server.listen(config.port, () => {
    logInfo(`Server started on port ${config.port}`);
  });
}

// Export the startServer function for external use
export default {
  startServer
};
