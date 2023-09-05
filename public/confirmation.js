/**
 * Name: Anthony Balfour
 * Date: 6/2/2023
 *
 * This javascript file, confirmation.js, processes the confirmation of the selected flight
 * from the previous page, flights.html. It displays a confirmation message with
 * all of the flight details, and a subsequent message that displays if the flight
 * reservation/confirmation was successful.
 */

"use strict";

(function() {

  window.addEventListener("load", init);

  /**
   * Initializes functionality for the webpage
   * Gets the flight information for the flight being confirmed
   * Checks if the flight is booked on the same departure or return date
   * of another flight. If so, then prevents reservation
   * Adds the menu drop down in the navbar
   */
  function init() {
    getFlightInfo();
    id("confirm-button").addEventListener("click", bookFlight);
    changeLoginToAccount();
    // enabling menu dropdown
    if (localStorage.getItem("logged-in")) {
      menuEventListener();
    }
  }

  /**
   * Gets the flight info for the confirming flight and displays it to the page.
   * Fetches this info from the POST endpoint with the parameter of
   * the flight id
   * If an error occurs, it will be displayed to the page in plain text
   */
  function getFlightInfo() {
    let params = new FormData();
    params.append("id", localStorage.getItem("flight-id"));
    fetch("/get_flight", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.json())
      .then(displayFlightInfo)
      .catch(handleError)
  }

  /**
   * Displays the flight info including the airlines, price, whether it's nonstop,
   * the destination, return location, and dates. The style of the list will
   * be in a flexbox column
   * @param {Object} flight - json of the flight which includes all flight information
   */
  function displayFlightInfo(flight) {
    let flightContainer = generate("div");

    // destination/return
    let destination = generate("p");
    let returnLocation = generate("p");
    destination.classList.add("destination");
    destination.textContent = "Destination: " + flight.destination;
    returnLocation.textContent = "Return Location: " + flight.returnLocation;

    // dates
    let dates = generate("p")
    dates.textContent = flight.start_date + " until " + flight.end_date;

    // price
    let price = generate("p");
    price.textContent = "Price: " + "$" + flight.price;
    price.classList.add("price");

    //airline
    let airline = generate("p");
    airline.textContent = flight.airline;
    airline.classList.add("airline");
    let logo = generate("img");
    logo.src = "/images/" + flight.airline.toLowerCase() + ".png";
    logo.classList.add("logo");
    logo.alt = flight.airline + " logo";

    let nonstop = generate("p");
    nonstop.textContent = "nonstop";
    flightContainer.append(logo, airline, dates, nonstop, price, destination, returnLocation);
    id("flight-info").classList.add("black-border");
    id("flight-info").prepend(flightContainer);
  }

  /**
   * Books the flight for the user
   * If the departure date and return date are not the same to any other
   * current flights, the flight booking is successful. The flight will be stored
   * in the past flights table of the database
   */
  function bookFlight() {
    let flightID = localStorage.getItem("flight-id");
    let customerID = localStorage.getItem("logged-in");

    // storing flight into database if the customer is not already booked
    let params = new FormData();
    params.append("flightID", flightID);
    params.append("customerID", customerID);
    fetch("store_flight", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.text())
      .then(displayFlightBooking)
      .catch(handleError)
  }

  /**
   * Displays whether or not the flight was booked or not. If the flight was booked:
   * "Flight stored successfully. Please wait 2 seconds to confirm"
   * Then displays a congratulations message with pics of the destination
   * If not successful:
   * You are already booked on those dates. Please select a different date for your flight.
   * Thank you
   * @param {String} text - text response of whether the booking was successful
   */
  function displayFlightBooking(text) {
    const TWO_SECONDS = 1750;
    let response = generate("p");
    response.textContent = text;
    response.classList.add("booking-response");

    // if customer is already booked for that date
    if (text.includes("booked")) {
      if (qs("main > p")) {
        qs("main > p").remove();
      }
      response.classList.add("red-text");
      qs("main").appendChild(response);

    } else {
      response.textContent += ". Please wait 2 seconds to confirm.";
      qs("main").appendChild(response);
      setTimeout(() => {
        confirmFlight();
      }, TWO_SECONDS);
    }
  }

  /**
   * Displays a message to the user once the flight is confirmed:
   * "Congratulations"
   * "You're booked! Have an awesome trip to " + destination
   */
  function confirmFlight() {
    // clears a booked flight reponse message if there is one present on the page
    if (qs(".booking-response")) {
      qs(".booking-response").remove();
    }
    id("flight-info").classList.add("hidden");
    id("confirmation").classList.remove("hidden");
    qs("main h1").textContent = "Congratulations!"
    let destination = qs(".destination").textContent;
    qs("#confirmation h1").textContent = "You're booked! Have an awesome trip to " + destination;
  }

   /**
   * Enables drop down menu when clicking menu in the navbar
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
      id("login-container").append(paragraph, paragraph2);
      setTimeout(() => {
        window.location.href="index.html";
      }, TWO_SECONDS);
    }

  /**
   * Changes the login option in the navbar from "login" to "account"
   * if the user is logged in.
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
   * Handles an error from fetching from the "/get_flight" (flight info) endpoint
   * and the "/store_flight" (book flight) endpoint.
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