/**
 * Enhanced DOM utility functions with error handling and validation
 */
import ErrorHandler from '../core/errorHandler.js';

const DOMUtils = {
  /**
   * Create a new element with optional attributes and content
   * @param {string} tagName - HTML tag name
   * @param {Object} options - Optional attributes and properties
   * @param {string} options.className - CSS class names
   * @param {string} options.id - Element ID
   * @param {string} options.innerHTML - Inner HTML content
   * @param {Object} options.attributes - Additional attributes
   * @returns {HTMLElement|null} Created element or null on error
   */
  createElement(tagName, options = {}) {
    try {
      const element = document.createElement(tagName);
      
      if (options.className) element.className = options.className;
      if (options.id) element.id = options.id;
      if (options.innerHTML) element.innerHTML = options.innerHTML;
      
      if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }
      
      return element;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `createElement(${tagName})`);
      return null;
    }
  },

  /**
   * Get element by ID with error handling
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Element or null if not found
   */
  getElement(id) {
    try {
      const element = document.getElementById(id);
      if (!element) {
        console.warn(`Element with ID '${id}' not found`);
      }
      return element;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `getElement(${id})`);
      return null;
    }
  },

  /**
   * Get elements by class name
   * @param {string} className - CSS class name
   * @returns {HTMLCollection} Collection of elements
   */
  getElementsByClass(className) {
    try {
      return document.getElementsByClassName(className);
    } catch (error) {
      ErrorHandler.handleGenericError(error, `getElementsByClass(${className})`);
      return [];
    }
  },

  /**
   * Get element by selector with error handling
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null} First matching element or null
   */
  querySelector(selector) {
    try {
      return document.querySelector(selector);
    } catch (error) {
      ErrorHandler.handleGenericError(error, `querySelector(${selector})`);
      return null;
    }
  },

  /**
   * Get all elements by selector
   * @param {string} selector - CSS selector
   * @returns {NodeList} List of matching elements
   */
  querySelectorAll(selector) {
    try {
      return document.querySelectorAll(selector);
    } catch (error) {
      ErrorHandler.handleGenericError(error, `querySelectorAll(${selector})`);
      return [];
    }
  },

  /**
   * Toggle a CSS class on an element with validation
   * @param {string} id - Element ID
   * @param {string} className - CSS class to toggle
   * @param {boolean} add - Whether to add (true) or remove (false) the class
   * @returns {boolean} Success status
   */
  toggleElementClass(id, className, add = true) {
    try {
      const element = this.getElement(id);
      if (!element) return false;
      
      if (add) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
      return true;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `toggleElementClass(${id}, ${className})`);
      return false;
    }
  },
  
  /**
   * Enable or disable an element with validation
   * @param {string} id - Element ID
   * @param {boolean} enabled - Whether the element should be enabled
   * @returns {boolean} Success status
   */
  setElementEnabled(id, enabled = true) {
    try {
      const element = this.getElement(id);
      if (!element) return false;
      
      element.disabled = !enabled;
      return true;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `setElementEnabled(${id})`);
      return false;
    }
  },
  
  /**
   * Replace element with a clone to remove all event listeners
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} The newly cloned element
   */
  replaceElementWithClone(id) {
    try {
      const element = this.getElement(id);
      if (!element) return null;
      
      const clone = element.cloneNode(true);
      element.replaceWith(clone);
      return clone;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `replaceElementWithClone(${id})`);
      return null;
    }
  },

  /**
   * Set the innerHTML of an element with XSS protection
   * @param {string} id - Element ID
   * @param {string} html - HTML content (should be trusted)
   * @returns {boolean} Success status
   */
  setElementHTML(id, html) {
    try {
      const element = this.getElement(id);
      if (!element) return false;
      
      element.innerHTML = html;
      return true;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `setElementHTML(${id})`);
      return false;
    }
  },

  /**
   * Set text content of an element (safe from XSS)
   * @param {string} id - Element ID
   * @param {string} text - Text content
   * @returns {boolean} Success status
   */
  setElementText(id, text) {
    try {
      const element = this.getElement(id);
      if (!element) return false;
      
      element.textContent = text;
      return true;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `setElementText(${id})`);
      return false;
    }
  },

  /**
   * Set an attribute on an element
   * @param {string} id - Element ID
   * @param {string} attribute - Attribute name
   * @param {string} value - Attribute value
   * @returns {boolean} Success status
   */
  setElementAttribute(id, attribute, value) {
    try {
      const element = this.getElement(id);
      if (!element) return false;
      
      element.setAttribute(attribute, value);
      return true;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `setElementAttribute(${id}, ${attribute})`);
      return false;
    }
  },

  /**
   * Remove an attribute from an element
   * @param {string} id - Element ID
   * @param {string} attribute - Attribute name
   * @returns {boolean} Success status
   */
  removeElementAttribute(id, attribute) {
    try {
      const element = this.getElement(id);
      if (!element) return false;
      
      element.removeAttribute(attribute);
      return true;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `removeElementAttribute(${id}, ${attribute})`);
      return false;
    }
  },

  /**
   * Add event listener with error handling
   * @param {string} id - Element ID
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event listener options
   * @returns {boolean} Success status
   */
  addEventListener(id, event, handler, options = {}) {
    try {
      const element = this.getElement(id);
      if (!element) return false;
      
      element.addEventListener(event, handler, options);
      return true;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `addEventListener(${id}, ${event})`);
      return false;
    }
  },

  /**
   * Remove event listener
   * @param {string} id - Element ID
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @returns {boolean} Success status
   */
  removeEventListener(id, event, handler) {
    try {
      const element = this.getElement(id);
      if (!element) return false;
      
      element.removeEventListener(event, handler);
      return true;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `removeEventListener(${id}, ${event})`);
      return false;
    }
  },

  /**
   * Show/hide element
   * @param {string} id - Element ID
   * @param {boolean} show - Whether to show the element
   * @returns {boolean} Success status
   */
  toggleElementVisibility(id, show = true) {
    try {
      const element = this.getElement(id);
      if (!element) return false;
      
      element.style.display = show ? '' : 'none';
      return true;
    } catch (error) {
      ErrorHandler.handleGenericError(error, `toggleElementVisibility(${id})`);
      return false;
    }
  }
};

export default DOMUtils;
