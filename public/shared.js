"use strict";

(function() {

  window.addEventListener("load", init);

  function init() {
    openMobileMenu();
  }

  function openMobileMenu() {
    let menuBar = id("menu-bar");
    console.log(menuBar);
    let mobileMenu = id("mobile-menu");
    menuBar.addEventListener("click", () => {
      mobileMenu.classList.toggle("show-mobile-menu");

      // ability to close the menu
      closeMobileMenu();
    })
  }

  function closeMobileMenu() {
    let xIcon = id("mobile-close");
    let mobileMenu = id("mobile-menu");
    console.log(xIcon);
    xIcon.addEventListener("click", () => {
      mobileMenu.classList.remove("show-mobile-menu");
    })
  }

  /**
   * Finds the element with the specified selector
   *
   * @param {String} selector - css selector
   * @returns {HTMLElement} HTML element associated with the selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Finds the element with the specified selector
   *
   * @param {String} selector - css selector
   * @returns {HTMLElement} - all HTML elements matching the given selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Finds the element with the specified ID attribute.
   *
   * @param {string} id - element ID
   * @returns {HTMLElement} HTML element associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Generates a HTMLElement of the given type
   *
   * @param {String} type - HTML element type
   * @return {HTMLElement} returns generated HTML element
   */
  function generate(type) {
    return document.createElement(type);
  }

  /**
   * Checks the status code of the fetched endpoint
   * @param {Promise} response - response Object from the endpoint
   * @return {Promise} - response Object from the endpoint
   * @throws API error if the the status code is 400 or 500 level, or not ok
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }
})();