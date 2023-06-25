/**
 * Name: Anthony Balfour
 * Date: 6/2/ 2023
 *
 * This javascript file, index.js, handles functionality for handling the input
 * for entering flight detail information, clicking links such as flight deals and
 * flight suggestions, and navbar interactivity.
 */

"use strict";

(function() {

  window.addEventListener("load", init);

  /**
   * Initializes functionality for the webpage
   * Fills the three flight suggestions in the bottom left of the page
   */
  function init() {
    qs("#flight-details form").addEventListener("submit", (event) => {
      event.preventDefault();
      submitFlight(event);
    })

    changeLoginToAccount();

    // clearing signin/create_user attribute of local storage
    localStorage.removeItem("sign-in");
    localStorage.removeItem("create-user");

    // enabling sign out
    if (localStorage.getItem("logged-in")) {
      menuEventListener();
    }

    // flight suggestions
    fillFlightSuggestions("Los Angeles");
    fillFlightSuggestions("New York");
    fillFlightSuggestions("Austin");
  }

  /**
   * Fills in the flight suggestion card in the flight suggestions section
   * @param {String} destination
   */
  function fillFlightSuggestions(destination) {
    fetch("flightslist?destination=" + destination)
      .then(statusCheck)
      .then(res => res.json())
      .then(displayFlight)
      .catch(handleError);
  }

  /**
   * Displays the flight information of the suggested flight:
   * logo
   * price
   * date
   * @param {Object} destinationJson - JSON of the flight information
   */
  function displayFlight(destinationJson) {
    let flight = destinationJson[1];
    if (destinationJson[1].location === "Austin") {
      flight = destinationJson[3]
    }
    let logo = generate("img");
    let price = generate("p");
    let date = generate("p");
    let location = generate("p");
    let startDate = flight.start_date.split("-")
    startDate = startDate[1] + "/" + startDate[2];
    let endDate = flight.end_date.split("-")
    endDate = endDate[1] + "/" + endDate[2];
    date.textContent = startDate + " to " + endDate;
    price.textContent = "$" + flight.price;
    price.classList.add("price");
    location.textContent = flight.location;
    logo.src = "/images/" + flight.airline.toLowerCase() + ".png";
    logo.classList.add("logo");
    logo.alt = flight.airline + " logo";
    let flightContainer = flight.location.toLowerCase().split(" ").join("-");

    // in the index.html page, each container has the id of the suggested location
    id(flightContainer).classList.add("flight-card");
    id(flightContainer).append(location, price, date, logo);
  }

  /**
   * Submits the flight details form and then directs to the flights page which will be populated
   * by flights within the given criteria.
   * Saves the input information to local storage to use on the flights.html page.
   * @param {event} event - click event on the enter button in the flight details section
   */
  function submitFlight(event) {
    let destination = event.target[1].value;
    localStorage.setItem("destination", destination);
    localStorage.setItem("startDate", event.target[2].value);
    localStorage.setItem("endDate", event.target[3].value);
    localStorage.setItem("roundTrip", qs("#flight-details select").value);
    window.location.href="flights.html";
  }

  /**
   * Adds a click event listener to the login option in the navbar
   */
  function loginEventListener() {
    id("login").addEventListener("click", loginDropdown);
  }

  /**
   * Displays the login options in the login dropdown
   * The two options are login and create user
   */
  function loginDropdown() {
    let dropdown = id("login-dropdown");
    dropdown.classList.toggle("hidden");

    id("sign-in").addEventListener("click", () => {
      localStorage.setItem("sign-in", "true");
      window.location.href="login.html";
    });
    id("create-user").addEventListener("click", () => {
      localStorage.setItem("create-user", "true");
      window.location.href="login.html";
    });

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
   * Displays error message to the page
   * @param {String} error
   */
  function handleError(error) {
    let errorMessage = generate("p");
    errorMessage.textContent = error;
    qs("main").append(errorMessage);
  }

  /**
   * Enables drop down menu when selecting menu in the navbar
   */
  function menuEventListener() {
    qs("#menu p").addEventListener("click", menuDropdown);
    id("sign-out").addEventListener("click", signOut)
  }

  /**
   * Shows the menu dropdown in the navbar
   */
  function menuDropdown() {
    let menuDropdown = qs("#menu .dropdown");
    menuDropdown.classList.toggle("hidden");
  }

  /**
   * Signs the user out, displays a signed out message,
   * and directs the user to the homepage. The sign out is not visible
   * if no user is logged in
   */
  function signOut() {
    if (id("sign-out-message")) {
      id("sign-out-message").remove();
    }
    localStorage.removeItem("logged-in");
    let paragraph = generate("p");
    paragraph.id = "sign-out-message";
    paragraph.textContent = "You have been signed out successfully";
    id("menu").appendChild(paragraph);
  }

  /**
   * Changes the login option in the navbar to account if a user is logged in
   */
  function changeLoginToAccount() {
    if(localStorage.getItem("logged-in")){
      id("login").href = "account.html";
      qs("#login p").textContent = "Account";
    } else {
      qs("#login p").textContent = "Login";
      loginEventListener();
    }
  }

  /**
   * Displays the error when fetching the flight suggestions in the flight
   * suggestions section
   */
  function handleError(error) {
    let errorMessage = generate("p");
    errorMessage.textContent = error;
    id("flight-suggestions").append(errorMessage);
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