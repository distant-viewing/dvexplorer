/**
 * Data service layer for handling API calls and data fetching
 */

import CONFIG from './config.js';
import ErrorHandler from './errorHandler.js';

export class DataService {
  static cache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch data with caching and error handling
   * @param {string} path - Data path
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} Parsed data
   */
  static async fetchData(path, options = {}) {
    try {
      // Check cache first
      const cacheKey = `${path}-${JSON.stringify(options)}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.MODELS.TIMEOUT_MS);

      const response = await fetch(path, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw ErrorHandler.handleNetworkError(
          new Error('Request timeout'), 
          `fetchData(${path})`
        );
      }
      throw ErrorHandler.handleNetworkError(error, `fetchData(${path})`);
    }
  }

  /**
   * Load model information
   * @param {string} modelName - Name of the model
   * @returns {Promise<Object>} Model configuration
   */
  static async loadModelInfo(modelName) {
    const path = `${CONFIG.PATHS.INFO}/${modelName}.json`;
    return this.fetchData(path);
  }

  /**
   * Load examples data
   * @returns {Promise<Object>} Examples configuration
   */
  static async loadExamples() {
    return this.fetchData(CONFIG.PATHS.EXAMPLES);
  }

  /**
   * Read file as text
   * @param {File} file - File object
   * @returns {Promise<string>} File content
   */
  static async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(ErrorHandler.handleFileError(
        reader.error, 
        file.name, 
        'readFileAsText'
      ));
      
      reader.readAsText(file);
    });
  }

  /**
   * Read file as data URL
   * @param {File} file - File object
   * @returns {Promise<string>} File data URL
   */
  static async readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(ErrorHandler.handleFileError(
        reader.error, 
        file.name, 
        'readFileAsDataURL'
      ));
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate file type
   * @param {File} file - File to validate
   * @param {string[]} allowedTypes - Array of allowed MIME types
   * @returns {boolean} Whether file type is allowed
   */
  static validateFileType(file, allowedTypes) {
    if (!allowedTypes || allowedTypes.length === 0) return true;
    
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
  }

  /**
   * Validate file size
   * @param {File} file - File to validate
   * @param {number} maxSizeMB - Maximum file size in MB
   * @returns {boolean} Whether file size is within limit
   */
  static validateFileSize(file, maxSizeMB = 50) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Process multiple files with validation
   * @param {FileList} files - Files to process
   * @param {Object} validation - Validation options
   * @param {string[]} validation.allowedTypes - Allowed file types
   * @param {number} validation.maxSizeMB - Maximum file size in MB
   * @param {number} validation.maxFiles - Maximum number of files
   * @returns {Promise<File[]>} Valid files
   */
  static async processFiles(files, validation = {}) {
    try {
      const {
        allowedTypes = [],
        maxSizeMB = 50,
        maxFiles = 100
      } = validation;

      const fileArray = Array.from(files);
      
      if (fileArray.length > maxFiles) {
        throw new Error(`Too many files. Maximum ${maxFiles} allowed.`);
      }

      const validFiles = [];
      const errors = [];

      for (const file of fileArray) {
        if (!this.validateFileType(file, allowedTypes)) {
          errors.push(`${file.name}: Invalid file type`);
          continue;
        }

        if (!this.validateFileSize(file, maxSizeMB)) {
          errors.push(`${file.name}: File too large (max ${maxSizeMB}MB)`);
          continue;
        }

        validFiles.push(file);
      }

      if (errors.length > 0) {
        console.warn('File validation errors:', errors);
      }

      if (validFiles.length === 0) {
        throw new Error('No valid files found');
      }

      return validFiles;
    } catch (error) {
      throw ErrorHandler.handleFileError(error, '', 'processFiles');
    }
  }

  /**
   * Clear cache
   */
  static clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default DataService;