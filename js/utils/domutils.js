/**
 * DOM utility functions
 */
const DOMUtils = {
  /**
   * Create a new element.
   * @param {string} className
   * @returns {HTMLElement}
   */
  createElement(className) {
    return document.createElement(className);
  },


  /**
   * Get element by ID
   * @param {string} id - Element ID
   * @returns {HTMLElement}
   */
  getElement(id) {
    return document.getElementById(id);
  },

  /**
   * Get element by ID
   * @param {string} className
   * @returns {HTMLElement}
   */
  getElementsByClass(className) {
    return document.getElementsByClassName(className);
  },

  /**
   * Toggle a CSS class on an element
   * @param {string} id - Element ID
   * @param {string} className - CSS class to toggle
   * @param {boolean} add - Whether to add (true) or remove (false) the class
   */
  toggleElementClass(id, className, add = true) {
    const element = this.getElement(id);
    if (element) {
      if (add) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    }
  },
  
  /**
   * Enable or disable an element
   * @param {string} id - Element ID
   * @param {boolean} enabled - Whether the element should be enabled
   */
  setElementEnabled(id, enabled = true) {
    const element = this.getElement(id);
    if (element) {
      element.disabled = !enabled;
    }
  },
  
  /**
   * Replace element with a clone to remove all event listeners
   * @param {string} id - Element ID
   * @returns {HTMLElement} - The newly cloned element
   */
  replaceElementWithClone(id) {
    const element = this.getElement(id);
    if (element) {
      const clone = element.cloneNode(true);
      element.replaceWith(clone);
      return clone;
    }
    return null;
  },

  /**
   * Set the innerHTML of an element
   * @param {string} id - Element ID
   * @param {string} html - HTML content
   */
  setElementHTML(id, html) {
    const element = this.getElement(id);
    if (element) {
      element.innerHTML = html;
    }
  },

  /**
   * Set an attribute on an element
   * @param {string} id - Element ID
   * @param {string} attribute - Attribute name
   * @param {string} value - Attribute value
   */
  setElementAttribute(id, attribute, value) {
    const element = this.getElement(id);
    if (element) {
      element.setAttribute(attribute, value);
    }
  },

  /**
   * Remove an attribute from an element
   * @param {string} id - Element ID
   * @param {string} attribute - Attribute name
   */
  removeElementAttribute(id, attribute) {
    const element = this.getElement(id);
    if (element) {
      element.removeAttribute(attribute);
    }
  }
};

export default DOMUtils;
