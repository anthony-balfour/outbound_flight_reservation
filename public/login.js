/**
 * Name: Anthony Balfour
 * Date: 6/2/2023
 *
 * This file, login.js, handles functionality for for logging a user in
 * and creating a new user.
 * If the user input credentials are correct, logs the user in after a 2 second delay.
 * If the user input is not correct, logs a message to the page.
 */

"use strict";

(function() {

  window.addEventListener("load", init);

  /**
   * Enables form submissions for user login and create user
   * Changes "login" option in the nav to "account" if the user is logged in
   */
  function init() {
    formListener();
    createOrLogin();
    changeLoginToAccount();

    // clearing sign in attribute of local storage
    // localStorage.removeItem("sign-in");
    // localStorage.removeItem("create-user");
  }

  /**
   * Adds a submit type eventListener to the user login form and
   * the create user form. Only one form is visible at a time
   */
  function formListener() {
    id("create-user").addEventListener("submit", (event) => {
      event.preventDefault();
      submitNewUser();
    });
    id("login").addEventListener("submit", (event) => {
      event.preventDefault();
      submitLogin();
    });
  }

  /**
   * Displays either the create user form or login form
   * based on the attribute stored in local storage
   */
  function createOrLogin() {
    if (localStorage.getItem("create-user")) {
      id("create-section").classList.remove("hidden");
      qs("#create-section h1").classList.remove("hidden");
    } else if (localStorage.getItem("sign-in")) {
      id("login-section").classList.remove("hidden");
      qs("#login-section h1").classList.remove("hidden");
    }
  }

  /**
   * Submits the create a new user credentials to the form. If the input
   * parameters are formatted properly and no user already exists with
   * the given username, there will be a message displayed that the user has been
   * created, and will direct the user to the login page.
   * If the username is taken, a message stating this will be displayed the page
   */
  function submitNewUser() {
    let params = new FormData(id("create-user"));
    fetch("/create_user", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.text())
      .then(displaySuccess)
      .catch(handleError);
  }

  /**
   * Submits the username and password to login. If the credentials
   * match the expedia.db info, logs the user in after a 2 second delay
   * If the user input does not match, a message will display
   */
  function submitLogin() {
    let params = new FormData(id("login"));
    fetch("/user_login", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.json())
      .then(handleLogin)
      .catch(handleError);
  }

  /**
   * Logs a user in and directs the user to the account page automatically
   * in 2 seconds. If the login is unsuccessful, an appropriate message
   * is diplayed in red font
   * @param {Object} loginJson - response to the user logging in. A successful login
   * will return an object with the user ID, all of which are above 0. Otherwise
   * the login ID will be -1
   */
  function handleLogin(loginJson) {
    qs("#login-section p").textContent = loginJson.message;
    if (loginJson.id > 0) {
      localStorage.setItem("logged-in", loginJson.id);
      const TWO_SECONDS = 1500;
      setTimeout(() => {
        window.location.href = "account.html";
      }, TWO_SECONDS);
    } else {
      qs("#login-section p").classList.add("red-font");
    }
  }

  /**
   * Adds a click event listener to the "login" option in the navbar
   */
  function loginEventListener() {
    id("login-nav").addEventListener("click", loginDropdown);
  }

  /**
   * Displays the login options in the login dropdown
   * The two options are login and create user
   */
  function loginDropdown() {
    let dropdown = id("login-dropdown");
    dropdown.classList.toggle("hidden");

    id("sign-in").addEventListener("click", () => {
      // localStorage.setItem("sign-in", "true");
      // window.location.href="login.html";
      id("login-section").classList.remove("hidden");
      qs("#login-section h1").classList.remove("hidden");
      id("create-section").classList.add("hidden");
      qs("#create-section h1").classList.add("hidden");
    })
    id("create-user-nav").addEventListener("click", () => {
      id("login-section").classList.add("hidden");
      qs("#login-section h1").classList.add("hidden");
      id("create-section").classList.remove("hidden");
      qs("#create-section h1").classList.remove("hidden");
    })

    // functionality for closing the login dropdown when clickinng anywhere but
    // on the "Login" option on the nav
    closeLoginDropdown();
  }

  /**
   * Hides the login dropdown menu when clicking anywhere but the "Login" option
   * in the navbar
   */
  function closeLoginDropdown() {
    let loginNav = qs("#login-dropdown > p");
    let loginDropdown = id("login-dropdown");
    document.addEventListener("click", (event) => {
      if(!loginDropdown.classList.contains("hidden")) {
        const clickInsideDropdown = (event.target.textContent === loginNav.textContent);
        if (!clickInsideDropdown) {
          id("login-dropdown").classList.add("hidden");
        }
      }
    });
  }

  /**
   * Changes the "login" option in the navbar to "account" if a user is logged in
   */
  function changeLoginToAccount() {
    if(localStorage.getItem("logged-in")){
      id("login-nav").href = "account.html";
      qs("#login-nav p").textContent = "Account";
    } else {
      qs("#login-nav p").textContent = "Login";
    }
    loginEventListener();
  }

  /**
   * Handles an error from fetching the "create_user" post endpoint
   * Displays the type of error on the webpage
   * @param {Error} error - any error from fetching the endpoint
   */
  function handleError(error) {
    let errorMessage = generate("p");
    errorMessage.textContent = error;
    qs("main").append(errorMessage);
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