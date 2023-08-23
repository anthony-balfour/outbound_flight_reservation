"use strict";

(function() {

  window.addEventListener("load", init);

  function init() {
    openMobileMenu();
    adjustMobileMenu();
    mobileLoginPage();
  }

  function openMobileMenu() {
    let menuBar = id("menu-bar");
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

  function adjustMobileMenu() {
    let mobileLogin = id("mobile-login");
    let mobileCreate = id("mobile-create");
    let mobileAccount = id("mobile-account");
    let mobileSignOut = id("mobile-sign-out");
    if (localStorage.getItem("logged-in")) {
      mobileLogin.classList.add("hidden");
      mobileCreate.classList.add("hidden");
    } else {
      mobileAccount.classList.add("hidden");
      mobileSignOut.classList.add("hidden");
    }
  }

  /**
   * If the client is not logged in, sets event listeners to
   * the login and create user option in the mobile menu bar
   */
  function mobileLoginPage() {
    let create = localStorage.getItem("create-user");
    let loggedIn = localStorage.getItem("logged-in");
    if(!loggedIn) {
      id("mobile-login").addEventListener("click", () => {
        if (create) {
          localStorage.removeItem("create-user");
        }
        localStorage.setItem("sign-in", "true");
        window.location.href="login.html";
      });
      id("mobile-create").addEventListener("click", () => {
        if (localStorage.getItem("sign-in")) {
          localStorage.removeItem("sign-in");
        }
        localStorage.setItem("create-user", "true");
        window.location.href="login.html";
      });
    }
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