/**
 * Worker manager for handling web workers consistently
 */

import CONFIG from './config.js';
import ErrorHandler from './errorHandler.js';

export class WorkerManager {
  constructor() {
    this.workers = new Map();
    this.messageHandlers = new Map();
  }

  /**
   * Create a new worker
   * @param {string} id - Unique worker ID
   * @param {string} scriptPath - Path to worker script
   * @param {Object} options - Worker options
   * @returns {Promise<Worker>} Worker instance
   */
  async createWorker(id, scriptPath, options = {}) {
    try {
      // Terminate existing worker with same ID
      if (this.workers.has(id)) {
        await this.terminateWorker(id);
      }

      const worker = new Worker(
        new URL(scriptPath, import.meta.url),
        { type: 'module', ...options }
      );

      // Set up error handling
      worker.onerror = (error) => {
        ErrorHandler.handleWorkerError(error, id, 'worker.onerror');
        this.terminateWorker(id);
      };

      worker.onmessageerror = (error) => {
        ErrorHandler.handleWorkerError(error, id, 'worker.onmessageerror');
      };

      this.workers.set(id, worker);
      console.log(`Worker ${id} created successfully`);
      
      return worker;
    } catch (error) {
      throw ErrorHandler.handleWorkerError(error, id, 'createWorker');
    }
  }

  /**
   * Get existing worker
   * @param {string} id - Worker ID
   * @returns {Worker|null} Worker instance or null
   */
  getWorker(id) {
    return this.workers.get(id) || null;
  }

  /**
   * Send message to worker
   * @param {string} id - Worker ID
   * @param {any} message - Message to send
   * @returns {Promise<boolean>} Success status
   */
  async postMessage(id, message) {
    try {
      const worker = this.workers.get(id);
      if (!worker) {
        throw new Error(`Worker ${id} not found`);
      }

      worker.postMessage(message);
      return true;
    } catch (error) {
      ErrorHandler.handleWorkerError(error, id, 'postMessage');
      return false;
    }
  }

  /**
   * Set up message handler for worker
   * @param {string} id - Worker ID
   * @param {Function} handler - Message handler function
   * @returns {boolean} Success status
   */
  setMessageHandler(id, handler) {
    try {
      const worker = this.workers.get(id);
      if (!worker) {
        throw new Error(`Worker ${id} not found`);
      }

      // Wrap handler with error handling
      const wrappedHandler = (event) => {
        try {
          handler(event);
        } catch (error) {
          ErrorHandler.handleWorkerError(error, id, 'messageHandler');
        }
      };

      worker.onmessage = wrappedHandler;
      this.messageHandlers.set(id, wrappedHandler);
      
      return true;
    } catch (error) {
      ErrorHandler.handleWorkerError(error, id, 'setMessageHandler');
      return false;
    }
  }

  /**
   * Terminate worker
   * @param {string} id - Worker ID
   * @returns {Promise<boolean>} Success status
   */
  async terminateWorker(id) {
    try {
      const worker = this.workers.get(id);
      if (worker) {
        worker.terminate();
        this.workers.delete(id);
        this.messageHandlers.delete(id);
        console.log(`Worker ${id} terminated`);
      }
      return true;
    } catch (error) {
      ErrorHandler.handleWorkerError(error, id, 'terminateWorker');
      return false;
    }
  }

  /**
   * Terminate all workers
   * @returns {Promise<void>}
   */
  async terminateAllWorkers() {
    const terminationPromises = Array.from(this.workers.keys()).map(id => 
      this.terminateWorker(id)
    );
    
    await Promise.all(terminationPromises);
    console.log('All workers terminated');
  }

  /**
   * Get worker statistics
   * @returns {Object} Worker statistics
   */
  getStats() {
    return {
      activeWorkers: this.workers.size,
      workerIds: Array.from(this.workers.keys())
    };
  }

  /**
   * Send message to worker and wait for specific response
   * @param {string} id - Worker ID
   * @param {any} message - Message to send
   * @param {string} responseType - Expected response type
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<any>} Worker response
   */
  async sendAndWaitForResponse(id, message, responseType, timeout = CONFIG.MODELS.TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
      const worker = this.getWorker(id);
      if (!worker) {
        reject(new Error(`Worker ${id} not found`));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error(`Worker ${id} response timeout`));
      }, timeout);

      const originalHandler = this.messageHandlers.get(id);
      
      // Temporary handler for this specific request
      const responseHandler = (event) => {
        if (event.data.type === responseType) {
          clearTimeout(timeoutId);
          
          // Restore original handler
          if (originalHandler) {
            worker.onmessage = originalHandler;
          }
          
          resolve(event.data);
        } else if (originalHandler) {
          // Forward other messages to original handler
          originalHandler(event);
        }
      };

      worker.onmessage = responseHandler;
      worker.postMessage(message);
    });
  }
}

// Global worker manager instance
export const workerManager = new WorkerManager();

export default WorkerManager;