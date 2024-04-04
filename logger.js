function Logger(logger) {
  // Raw logging function
  function logRaw(level, message, error = null) {
    const formattedMessage = `[${level.toUpperCase()}] ${message}`;
    if (error) {
      logger[level](formattedMessage, error);
    } else {
      logger[level](formattedMessage);
    }
  }

  // Error logging function
  function logError(message, error) {
    logRaw('error', message, error);
  }

  // Info logging function
  function logInfo(message) {
    logRaw('info', message);
  }

  // Warn logging function
  function logWarn(message) {
    logRaw('warn', message);
  }

  return {
    logError,
    logInfo,
    logWarn,
  };
}

export default { Logger };
