/**
 * Centralized error handling for the Distant Viewing Explorer
 */

import CONFIG from './config.js';

export class DVError extends Error {
  constructor(message, code = 'GENERIC_ERROR', details = null) {
    super(message);
    this.name = 'DVError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class ErrorHandler {
  static logError(error, context = '') {
    const errorInfo = {
      message: error.message,
      code: error.code || 'UNKNOWN',
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };
    
    console.error('DV Error:', errorInfo);
    
    // In production, this could send to error reporting service
    return errorInfo;
  }

  static handleNetworkError(error, context = '') {
    const dvError = new DVError(
      CONFIG.ERRORS.NETWORK_ERROR,
      'NETWORK_ERROR',
      { originalError: error.message }
    );
    
    this.logError(dvError, context);
    this.showUserError(dvError.message);
    return dvError;
  }

  static handleFileError(error, filename = '', context = '') {
    const dvError = new DVError(
      CONFIG.ERRORS.FILE_LOAD_ERROR,
      'FILE_ERROR',
      { filename, originalError: error.message }
    );
    
    this.logError(dvError, context);
    this.showUserError(`${dvError.message} (${filename})`);
    return dvError;
  }

  static handleModelError(error, modelName = '', context = '') {
    const dvError = new DVError(
      CONFIG.ERRORS.MODEL_LOAD_ERROR,
      'MODEL_ERROR',
      { modelName, originalError: error.message }
    );
    
    this.logError(dvError, context);
    this.showUserError(dvError.message);
    return dvError;
  }

  static handleWorkerError(error, workerType = '', context = '') {
    const dvError = new DVError(
      CONFIG.ERRORS.WORKER_ERROR,
      'WORKER_ERROR',
      { workerType, originalError: error.message }
    );
    
    this.logError(dvError, context);
    this.showUserError(dvError.message);
    return dvError;
  }

  static handleGenericError(error, context = '') {
    const dvError = error instanceof DVError ? error : new DVError(
      CONFIG.ERRORS.GENERIC_ERROR,
      'GENERIC_ERROR',
      { originalError: error.message }
    );
    
    this.logError(dvError, context);
    this.showUserError(dvError.message);
    return dvError;
  }

  static showUserError(message) {
    // Create or update error display element
    let errorDiv = document.getElementById('dv-error-display');
    
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'dv-error-display';
      errorDiv.className = 'notification is-danger is-light';
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        z-index: 9999;
        display: none;
      `;
      
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.className = 'delete';
      closeButton.onclick = () => {
        errorDiv.style.display = 'none';
      };
      
      errorDiv.appendChild(closeButton);
      document.body.appendChild(errorDiv);
    }

    // Update content and show
    const existingButton = errorDiv.querySelector('.delete');
    errorDiv.innerHTML = `<strong>Error:</strong> ${message}`;
    if (existingButton) {
      errorDiv.appendChild(existingButton);
    }
    
    errorDiv.style.display = 'block';
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 10000);
  }

  static clearUserErrors() {
    const errorDiv = document.getElementById('dv-error-display');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }
}

export default ErrorHandler;