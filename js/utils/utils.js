/**
 * Utility functions for the Distant Viewing Explorer
 * @deprecated Many functions moved to DataService - use DataService instead
 */

import ErrorHandler from '../core/errorHandler.js';
import DataService from '../core/dataService.js';

/**
 * @deprecated Use DOMUtils.toggleElementClass instead
 */
const setClass = function (elem, className, addFlag = true) {
  console.warn('setClass is deprecated. Use DOMUtils.toggleElementClass instead.');
  try {
    if (addFlag) {
      elem.classList.add(className);
    } else {
      elem.classList.remove(className);
    }
  } catch (error) {
    ErrorHandler.handleGenericError(error, 'setClass');
  }
};

/**
 * @deprecated Use DataService.fetchData instead
 */
const getData = async function (path) {
  console.warn('getData is deprecated. Use DataService.fetchData instead.');
  return DataService.fetchData(path);
};

/**
 * Get URL search parameter with default value
 * @param {string} name - Parameter name
 * @param {string} def - Default value
 * @returns {string} Parameter value or default
 */
const getSearchParam = function (name, def = '') {
  try {
    const url = new URL(window.location.href);
    let np = url.searchParams.get(name);
    if (np == null) {
      np = def;
    }
    return np;
  } catch (error) {
    ErrorHandler.handleGenericError(error, `getSearchParam(${name})`);
    return def;
  }
};

/**
 * Set URL search parameters
 * @param {Object} nvpair - Key-value pairs to set
 */
const setSearchParam = function (nvpair) {
  try {
    const url = new URL(window.location.href);

    for (const [key, value] of Object.entries(nvpair)) {
      url.searchParams.set(key, value);
    }

    history.pushState(null, '', url);
  } catch (error) {
    ErrorHandler.handleGenericError(error, 'setSearchParam');
  }
};

/**
 * @deprecated Use DataService.readFileAsText instead
 */
const readJsonAsync = function (file) {
  console.warn('readJsonAsync is deprecated. Use DataService.readFileAsText instead.');
  return DataService.readFileAsText(file);
};

/**
 * Format seconds to HH:MM:SS.mmm format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
const formatTime = function (seconds) {
  try {
    // Extract hours, minutes, seconds, and milliseconds
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    // Format each component to ensure 2 digits for HH, MM, SS, and 3 digits for milliseconds
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(sec).padStart(2, '0');
    const formattedMilliseconds = String(milliseconds).padStart(3, '0');

    // Combine and return the formatted time
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
  } catch (error) {
    ErrorHandler.handleGenericError(error, 'formatTime');
    return '00:00:00.000';
  }
};

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = function(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = function(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
const generateId = function(prefix = 'dv') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
const deepClone = function(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    ErrorHandler.handleGenericError(error, 'deepClone');
    return obj;
  }
};

export {
  setClass,
  getSearchParam,
  getData,
  setSearchParam,
  formatTime,
  readJsonAsync,
  debounce,
  throttle,
  generateId,
  deepClone
};
