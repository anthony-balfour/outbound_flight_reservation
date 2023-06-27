/**
 * Name: Anthony Balfour
 * Date: 6/2/2023

 * This javascript file, account.js, handles the functionality for populating the currently booked
 * and past flights. It also displays user info like the users name and account number.
 */

"use strict";

(function() {

  const USER_ID = localStorage.getItem("logged-in");

  window.addEventListener("load", init);

  /**
   * Initializes functionality for the webpage.
   * Fetches flight history of the user
   * Fetches the logged in user information
   * Enables the menu dropdown option in the navbar
   */
  function init() {
    // checks if the user has any past flights or current ones
    fetchFlightHistory();
    getUserInfo();

    // enabling menu option
    if (localStorage.getItem("logged-in")) {
      menuEventListener();
    }
  }

  /**
   * Fetches the current and past flights of a user with a POST request
   * the POST parameter is the user ID which is in local storage
   * The returned json from the api endpoint returns an array of a past flights object
   * and a current flights object. Both are displayed to the page if either
   * has any elements
   */
  function fetchFlightHistory() {
    let params = new FormData();
    params.append("id", USER_ID);
    fetch("/flight_history", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.json())
      .then(displayFlights)
      .catch(handleError);
  }

  /**
   * Fetches the first and last name of a user and their account number
   * This is done with a POST request with the parameter of user id
   * Both are dispalyed to the page
   */
  function getUserInfo(){
    let params = new FormData();
    params.append("id", USER_ID);
    fetch("/user_info", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.json())
      .then(displayUserInfo)
      .catch(handleError);
  }


/**
 * Displays the user's first and last name  and displays the user's account number
 * Displays a welcome message positioned on the same row as the user's full name
 * @param {Object} userInfo - json of user information: first name, last name, account #
 */
  function displayUserInfo(userInfo) {
    qs("aside h1").textContent = userInfo["first name"] + " " + userInfo["last name"];
    qs("aside h1:nth-child(2)").textContent = "Welcome!"
    id("account").textContent = "Account Number: " + userInfo.id;
  }

  /**
   * Displays the current and past flights of the given user given the
   * json from the API endpoint. Displays the confirmation number, the dates of the flights,
   * and the specific flight information (price, destination, airlines)
   * @param {Object} flightJson - json of all the current and past flights
   */
  function displayFlights(flightJson) {

    // past flights
    flightJson.past_flights.forEach(flight => {
      let container = generate("div");
      container.classList.add("past-flights");
      container.classList.add("lightgray-border");
      let confirmationNumber = generate("p");
      let dates = generate("span");
      dates.textContent = "Start Date: " + flight.start_date + " End Date: " + flight.end_date;
      confirmationNumber.textContent = "Confirmation # " + flight["confirmation_number"];
      let flightCard = constructFlightCard(flight);
      container.append(confirmationNumber, dates, flightCard);
      id("past").appendChild(container);
    });

    // current flights
    flightJson.current_flights.forEach(flight => {
      let container = generate("div");
      container.classList.add("current-flights");
      container.classList.add("lightgray-border");
      let confirmationNumber = generate("p");
      let dates = generate("span");
      dates.textContent = "Start Date: " + flight.start_date + " End Date: " + flight.end_date;
      confirmationNumber.textContent = "Confirmation # " + flight["confirmation_number"];
      let flightCard = constructFlightCard(flight);
      container.append(confirmationNumber, dates, flightCard);
      id("current").appendChild(container);
    });
  }

 /**
  * Constructs a flight container with the information from the given flight json parameter
  * The flight card contains the airlines logo, the airlines name, the destination,
  * the return location, and the price of the flight
  * @param {Object} flight - json of all of the flight information
  * @returns the created container
  */
  function constructFlightCard(flight) {
    let flightContainer = generate("div");;
    let logo = generate("img");
    let price = generate("p");
    let airline = generate("p");
    let destination = generate("p");
    let returnLocation = generate("p");

    price.textContent = "$" + flight.price;
    price.classList.add("price");
    let airlineContainer = generate("div");
    airline.textContent = flight.airline;
    airline.classList.add("airline");
    destination.textContent = flight.destination;
    returnLocation.textContent = flight.returnLocation;
    logo.src = "/images/" + flight.airline.toLowerCase() + ".png";
    logo.classList.add("logo");
    logo.alt = flight.airline + " logo";
    airlineContainer.append(logo, airline);
    flightContainer.classList.add("lightgray-border");
    flightContainer.classList.add("flight-card");
    flightContainer.append(logo, airline, returnLocation, destination, price);
    return flightContainer;
  }

  /**
   * Enables drop down menu when selecting menu in the navbar
   * Enables the signout option within the dropdown menu
   */
  function menuEventListener() {
    qs("#menu p").addEventListener("click", menuDropdown);
    id("sign-out").addEventListener("click", signOut)
  }

  /**
   * Shows the menu, by removing the display: none property
   */
  function menuDropdown() {
    let menuDropdown = qs("#menu .dropdown");
    menuDropdown.classList.toggle("hidden");
  }

  /**
   * Signs the user out. The account option in the nav bar is changed to login
   * Displays a message under the sign out button stating the user is signed out.
   * Directs the user to the home page after 1.5 seconds
   */
  function signOut() {
    // this clears repeated sign out messages
    if (id("sign-out-message")) {
      id("sign-out-message").remove();
    }
    const TWO_SECONDS = 1750;
    localStorage.removeItem("logged-in");
    let paragraph = generate("p");
    let paragraph2 = generate("p");
    paragraph.classList.add("sign-out-message");
    paragraph2.classList.add("sign-out-message-two");
    paragraph.textContent = "You have been signed out successfully";
    paragraph2.textContent = "You will be directed to the homepage";
    id("account-nav").append(paragraph, paragraph2);
    setTimeout(() => {
      window.location.href="index.html";
    }, TWO_SECONDS);
  }

  /**
   * Handles an error from fetching the flight history endpoint or the
   * user info endpoint.
   * Displays the error on the webpage
   * @param {Error} err
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