/**
 * Name: Anthony Balfour
 * Date: 6/2/2023
 *
 * This javascript file, flights.js, lists all of the available flights specified with
 * the given criteria (dates, price, airlines). The list can be viewed in list style or
 * grid style. There is a search bar and filter parameters that can be applied to the list.
 */

"use strict";

(function() {

  // sets the intial flights display as list style, this can be changed to grid
  let listStyle = "list";

  let windowWidth = window.innerWidth;


  window.addEventListener("load", init);

  /**
   * Initializes functionality for the webpage
   * Adds the option to use the flight details section (destination/dates/etc)
   * Grabs the flights matching the query on the home page
   * Enables search by clicking the search magnifying glass button
   * Changes the login option in the navbar to account if a user is logged in
   * Clears local storage of the sign in/create user options when using the
   * login dropdown
   * Enables menu sign out
   */
  function init() {
    qs("#flight-details form").addEventListener("submit", (event) => {
      event.preventDefault();
      submitFlight(event);
    })

    // populates the page with the flights
    getFlightsSearch();

    //functionality for searching through flights
    searchClick();

    // clears the align left property that occurs when a flight is selected
    qsa("#available-flights div").forEach(container => {
      container.classList.remove("align-left");
    })
    changeLoginToAccount();

    // login or create user options
    localStorage.removeItem("sign-in");
    localStorage.removeItem("create-user");

    // menu sign out option
    if (localStorage.getItem("logged-in")) {
      menuEventListener();
    }

    // flight suggestions
    flightSuggestion();

    // sets flight display to grid if the window is less than 600px
  }

  /**
   * Gets the values of the searched items on the landing page from local storage or in the
   * flight details section at the top of the webpage. Populates
   * the page with the flights that met the selected criteria. Fetches using
   * the given start date, end date and destination, if any are provided.
   */
  function getFlightsSearch() {
    id("departing-date").value = localStorage.getItem("startDate");
    id("returning-date").value = localStorage.getItem("endDate");
    id("destination").value = localStorage.getItem("destination");
    let fetchLink = "/flightslist?";
    let startDate = localStorage.getItem("startDate");
    let endDate = localStorage.getItem("endDate");
    let destination = localStorage.getItem("destination");
    if (startDate) {
      fetchLink += "start_date=" + startDate;
    }
    if (endDate) {
      fetchLink += "&end_date=" + endDate;
    }
    if (destination) {
      fetchLink += "&destination=" + destination;
    }
    fetch(fetchLink)
      .then(statusCheck)
      .then(res => res.json())
      .then(displayFlights)
      .catch(handleError);
    }

  /**
   *
   * Submits the flight details form and populates the flights list on the page
   * with flights that match the criteria
   * Saves the input information to local storage and refreshes the page.
   * @param {event} event - flight details section submit event
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
   * Displays all of the flights within the given dates at the given destination.
   * All return locations are currently listed as Seattle.
   * If no criteria is given, the page lists all available flights starting from
   * the current date
   * Enables filter functionality
   * Enables grid list function
   * @param {Object} flightsJson - JSON containing all of the flights and their
   * information
   */
  function displayFlights(flightsJson) {
    let flightsContainer = id("available-flights");
    flightsJson.forEach(flight => {
    let flightContainer = constructFlightCard(flight);
    flightsContainer.appendChild(flightContainer);
    })
    // storing the original featured flights list in this function as a para
    filterSelect(qsa(".flight-card"));

    // enables event listener for clicking grid icon on page above flights list
    attachGridListener();

    // sets the flight display to grid if window size is less than 600px
    if (windowWidth < 600) {
      grid();
    }
  }

  /**
   * Generates each flight card displayed on the list of flights
   * Each card has an airlines logo, airlines name, price, dates, and destination
   * @param {Object} flight
   * @returns the flight div container which contains all of the flight information
   */
  function constructFlightCard(flight) {
    let flightContainer = generate("div");
    flightContainer.id = flight.id;
    let logo = generate("img");
    let price = generate("p");
    let airline = generate("p");
    let date = generate("p");
    let location = generate("p");
    let startDate = flight.start_date.split("-")
    startDate = startDate[1] + "/" + startDate[2];
    let endDate = flight.end_date.split("-")
    endDate = endDate[1] + "/" + endDate[2];
    date.textContent = startDate + " to " + endDate;
    price.textContent = "$" + flight.price;
    price.classList.add("price");
    airline.textContent = flight.airline;
    airline.classList.add("airline");
    location.textContent = flight.location;
    location.classList.add("location");
    logo.src = "/images/" + flight.airline.toLowerCase() + ".png";
    logo.classList.add("logo");
    logo.alt = flight.airline + "logo";
    flightContainer.classList.add("lightgray-border");
    flightContainer.classList.add("flight-card");
    let airlineClone = airline.cloneNode(true);
    let dateClone = date.cloneNode(true);
    let locationClone = location.cloneNode(true);
    let priceClone = price.cloneNode(true);
    flightContainer.append(logo, airline, date, location, price);

    // passing flight info along to reserve card that populates
    // when a flight is selected
    flightContainer.addEventListener("click", () => {
      flightSelect(event, airlineClone, dateClone, locationClone, priceClone, flight);
    });
    return flightContainer;
  }

  /**
   * Selects a flight for possible reservation.
   * In list style: displays a flight reservation card which gives the option to reserve the flight.
   * In grid style: displays a reserve button at the bottom of the grid card
   * @param {event} event - click event on the each flight card displayed
   * @param {HTMLElement} airline - "p" element with airline text
   * @param {HTMLElement} date "p" element with dates text
   * @param {HTMLElement} location "p" element with destination
   * @param {HTMLElement} price "p" element with price
   * @param {HTMLElement} flight - JSON of the flight information
   */
  function flightSelect(event, airline, date, location, price, flight) {
    localStorage.setItem("flight-id", flight.id);
    let target = event.currentTarget;
    // clearing selected flight info container
    if( id("flight-info")){
      id("flight-info").remove();
    }

    // If the current clicked card in grid view does not have a reserve button, a childNode[5],
    // any other reserve button should be cleared and the clicked card should
    // have one
    // Possibly add event for hover away?
      if(!event.currentTarget.childNodes[5]){
        qsa(".reserve-button").forEach(button => {
          button.remove();
        });
      }

    if (listStyle === "list") {
      if (windowWidth >= 900) {
        flightSelectList(airline, date, location, price, flight);
      } else {
        flightSelectListSmall(target);
      }
      // if (listStyle === "grid")
    } else {
      flightSelectGrid(event.currentTarget);
    }
  }

  /**
   * Handles the creation of a flight reservation card if a flight is selected from the list
   * view
   * @param {HTMLElement} airline - "p" element with airline text
   * @param {HTMLElement} date "p" element with dates text
   * @param {HTMLElement} location "p" element with destination
   * @param {HTMLElement} price "p" element with price
   * @param {HTMLElement} flight - JSON of the flight information
   */
  function flightSelectList(airline, date, location, price, flight) {
    // moving available flights to the left
    id("available-flights").classList.add("align-left");
    id("reserve").classList.remove("hidden");
    id("reserve-button").addEventListener("click", reserveFlight);

    // creating container for extra flight details which populates
    // on the right side of the page
    let container = generate("div");
    let reserveHeader = generate("h3");
    reserveHeader.textContent = "Flight Details";
    container.id = "flight-info";
    let capacity = generate("p");
    let newAirline = generate("p");
    newAirline.textContent = "Airlines: " + airline.textContent;
    capacity.textContent = "Capacity: " + flight.capacity;
    let reserve = generate("h3").textContent = "Would you like to reserve this flight?"
    container.append(reserveHeader, location, newAirline, date, capacity, price, reserve);
    id("reserve").prepend(container);
  }

  function flightSelectListSmall(target) {
    if (qs(".align-self")) {
      qs(".align-self").classList.remove("align-self");
    }
    if (id("reserve-copy")) {
      id("reserve-copy").remove();
    }
    target.classList.add("align-self");
    let buttonCopy = id("reserve-button").cloneNode(true);
    buttonCopy.id = "reserve-copy";
    target.style.position = 'relative';
    buttonCopy.style.position = 'absolute';
    target.appendChild(buttonCopy);
    buttonCopy.style.left = '102%';
    buttonCopy.addEventListener("click", reserveFlight);
  }

  /**
   * Handles a flight select to bring up a reserve button when a flight card is selected
   * when in grid view
   * @param {event} event - click event on the each flight card displayed
   */
  function flightSelectGrid(currentTarget) {
    if (id("available-flights").classList.contains("align-left")) {
      id("available-flights").classList.remove("align-left");
    }

      // If the selected flight card does not have a reserve button, a 5th child node
      if(!currentTarget.childNodes[5]){
        let reserveButton = generate("button");
        reserveButton.textContent = "Reserve";
        reserveButton.classList.add("reserve-button");
        reserveButton.addEventListener("click", reserveFlight);

        // appending the reserve button to the grid card
        currentTarget.appendChild(reserveButton);
    }
  }

  /**
   * Directs to the flight confirmation page if the user is logged in.
   * If the user is not logged in, a message will be displayed stating the user
   * needs to login to reserve a flight
   * If the list style is list, this message is displayed in the reserve card
   * If the list style is grid, the message is displayed in the flight card
   * container
   * @param {event} event - click event on the reserve button on the flights.html page
   */
  function reserveFlight(event) {
    if(localStorage.getItem("logged-in")) {
      window.location.href = "confirmation.html";
    } else {
      if (qs(".need-login")){
        qs(".need-login").remove();
      }
      let needToLogin = generate("p");
      needToLogin.classList.add("need-login");
      needToLogin.textContent = "Login to reserve a flight";
      if (listStyle === "list") {
        id("reserve").appendChild(needToLogin);
      } else {
        event.target.parentElement.appendChild(needToLogin);
      }
    }
  }

  /**
   * Brings up the reserve option for the selected flight from flight suggestions
   * OR deal view on the home page ("index.html").
   * Fetches the flight ID using the id stored in localStorage.
   */
  function flightSuggestion() {
    if (localStorage.getItem("flight-suggestion") === "true") {
    let params = new FormData();
    params.append("id", localStorage.getItem("flight-id"));
    fetch("/get_flight", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.json())
      .then(constructFlightSuggestion)
      .then(handleError);
    }
  }

  /**
   * Constructs the flight reservation panel if the flight suggestion
   * card was selected on the index.html homepage
   * OR if the flight deal view booking option was selected in the deal view
   * @param {Object} flightJson - all JSON information about the selected flight
   * including price, destination, dates, airlines
   */
  function constructFlightSuggestion(flightJson) {
    let dates = generate("p");
    let startDate = flightJson.start_date.split("-")
    startDate = startDate[1] + "/" + startDate[2];
    let endDate = flightJson.end_date.split("-")
    endDate = endDate[1] + "/" + endDate[2];
    dates.textContent = startDate + " to " + endDate;

    let destination = generate("p");
    destination.textContent = flightJson.destination;

    let price = generate("p");
    price.textContent = "$" + flightJson.price;

    let airlines = generate("p");
    airlines.textContent = flightJson.airline;

    if(windowWidth >= 900) {
      flightSelectList(airlines, dates, destination, price, flightJson);
    } else {
      let target = id(localStorage.getItem("flight-id"));
      if (listStyle == "list") {
        flightSelectListSmall(target);
      }else {
        id("available-flights").prepend(target);
        flightSelectGrid(target);
      }
    }
  }

  /**
   * Displays all flight cards that have any text that match
   * the text content in the search bar
   */
  function search() {
    let searchText = id("search-bar").value;
    let flightCards = (qsa(".flight-card"));
    flightCards.forEach(flightCard => {
      flightCard.classList.remove("hidden");
      let contains = false;
      for (let i = 0; i < flightCard.children.length; i++) {
        let cardText = flightCard.children[i].textContent.toLowerCase();
        if (cardText.includes(searchText.toLowerCase())) {
          contains = true;
        }
      }
      if(!contains) {
        flightCard.classList.add("hidden");
      }
    });
  }

  /**
   * Adds a change event listener to the filter dropdown menu
   * @param {Array} original - original featured list of flights for the user
   * this list comes up if no criteria for a destination is given
   */
  function filterSelect(original) {
    id("filter").addEventListener("change", (event) => {
      filter(event, original);
    });
  }

  /**
   * Filters the list of flights with 4 options:
   * Price low to high
   * Price high to low
   * Airlines alphabetically
   * Dates
   * @param {event} event - change event of selected filter option in dropdown
   * @param {Array} original - original featured flights list on load
   */
  function filter(event, original) {
    let selection = event.currentTarget.value;
    let flightCards = Array.from(qsa(".flight-card"));
    switch (selection) {
      case "low-price":
        flightCards.sort((a, b) => {
          return a.querySelector(".price").textContent.substring(1) - b.querySelector(".price").textContent.substring(1);
        });
        flightCards.forEach(flightCard =>{
          id("available-flights").appendChild(flightCard);
        });
        break;
        case "high-price":
          flightCards.sort((a, b) => {
            return b.querySelector(".price").textContent.substring(1) - a.querySelector(".price").textContent.substring(1);
          });
          flightCards.forEach(flightCard =>{
            id("available-flights").appendChild(flightCard);
          });
          break;
        case "airlines":
          flightCards.sort((a, b) => {
            if (a.querySelector(".airline").textContent.toLowerCase() < b.querySelector(".airline").textContent.toLowerCase()) {
              return -1
            } else {
              return 1;
            }
          });
          flightCards.forEach(flightCard =>{
            id("available-flights").appendChild(flightCard);
          });
          break;
      // original featured list on load
      case "featured":
        original.forEach(flightCard =>{
          id("available-flights").appendChild(flightCard);
        });
        break;
    }
  }

  /**
   * Displays the list of flights in a grid.
   */
  function grid() {
    if(id("reserve-copy")) {
      id("reserve-copy").remove();
    }
    listStyle = "grid";
    id("reserve").classList.add("hidden");
    attachListListener();
    qsa(".flight-card").forEach(flightCard => {
      flightCard.classList.add("grid");
      flightCard.querySelector(".logo").classList.add("grid-logo");

      // changing location to the top of the grid card
      let location = flightCard.querySelector(".location");
      location.remove();
      flightCard.prepend(location);
    })
    id("available-flights").classList.remove("column");
    id("available-flights").classList.add("row");
  }

  /**
   * Displays the list of flights in a vertical list
   */
  function list() {
    // if a need to login message was onscreen then removes the message
    if (qs(".need-login")){
      qs(".need-login").remove();
    }

    // removes left alignment of selected flight from list view on mobile view
    // if one was selected then the grid view was selected
    if (qs(".align-self")) {
      qs(".align-self").classList.remove("align-self");
    }
    if (listStyle === "grid") {
      id("available-flights").classList.remove("align-left");
    }
    qsa(".reserve-button").forEach(button => {
      button.remove();
    })
    listStyle = "list";
    qsa(".flight-card").forEach(flightCard => {
      flightCard.classList.remove("grid");
      let location = flightCard.querySelector(".location");
      flightCard.insertBefore(location, flightCard.querySelector(".price"));
      flightCard.querySelector(".logo").classList.remove("grid-logo");
    })
    id("available-flights").classList.add("column");
    id("available-flights").classList.remove("row");
  }

  /**
   * Handles an error when getting flights
   * Displays a message stating there was a servor error and to try again
   */
  function handleError(error) {
    let errorMessage = generate("p");
    errorMessage.textContent = error;
    qs("main").append(errorMessage);
  }

  /**
   * Adds a click event listener to the grid icon
   */
  function attachGridListener() {
    id("grid").addEventListener("click", grid);
  }

  /**
   * Adds a click event listener to the list icon
   */
  function attachListListener() {
    id("list").addEventListener("click", list);
  }

  /**
   * Adds an input event listener to the search bar and a
   * click event listener to the search button
   */
  function searchClick() {
    let searchButton = id("search-button");
    let searchBar = id("search-bar");
    searchBar.addEventListener("input", search);
    searchButton.addEventListener("click", search)
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
   * Signs the user out, displays a signed out message,
   * and directs the user to the homepage. The sign out option in the menu is not visible
   * if no user is logged in
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
   * Enables the login dropdown in the navbar which has two options:
   * login
   * create user
   */
  function loginEventListener() {
    id("login").addEventListener("click", loginDropdown);
  }

  /**
   * Displays the login dropdown menu. Presents the options of sign in and create
   * user. Once either option is clicked, directs the user to login.html,
   * with the respective display for logging in or creating a user
   */
  function loginDropdown() {
    let dropdown = id("login-dropdown");
    dropdown.classList.toggle("hidden");

    id("sign-in").addEventListener("click", () => {
      localStorage.setItem("sign-in", "true");
      window.location.href="login.html";
    })
    id("create-user-nav").addEventListener("click", () => {
      localStorage.setItem("create-user", "true");
      window.location.href="login.html";
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