/**
 * Name: Anthony Balfour
 * Date: 8/7/2023
 *
 * This javascript file, index.js, handles functionality for handling the input
 * for entering flight detail information to look at avaialable flights, managing a separate
 * view for flight deals, showing flight suggestions, and navbar interactivity.
 */

"use strict";

(function() {

  window.addEventListener("load", init);

  /**
   * Initializes functionality for the webpage
   * Fills the three flight suggestions in the bottom left of the page
   */
  function init() {
    // adds submit event to flight reservation details form
    qs("#flight-details form").addEventListener("submit", (event) => {
      event.preventDefault();
      submitFlight(event);
    })

    // changes login to account if a user is logged in
    changeLoginToAccount();

    // clearing sign-in/create-user attributes of local storage
    localStorage.removeItem("sign-in");
    localStorage.removeItem("create-user");

    // enabling sign out when clicking the menu button
    if (localStorage.getItem("logged-in")) {
      menuEventListener();
    }

    // flight suggestions
    fillFlightSuggestions("Los Angeles");
    fillFlightSuggestions("New York");
    fillFlightSuggestions("Austin");

    // move the submit button for the flight details reservation form based on screen size
    // moves the sections around for smaller screens
    smallScreenButtonMove();
    smallScreenSectionsMove();

    // create deal view on deal flight click which is centered on the screen
    flightDealsClick();

    // opens the mobile menu
    // openMobileMenu();
    // adjustMobileMenu();
  }

  /*** Flight Reservation Form ***/

  /**
   * Submits the flight details form and then directs to the "flights.html" page which will be populated
   * by flights within the given criteria.
   * Saves the input information to local storage to use on the flights.html page.
   * @param {event} event - click on the "Enter" button in the flight details section
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
   * Submits the flight and directs the user to the flights page with the flight deal information
   * @param {Object} flightJson - JSON of flight information
   */
  function dealViewSubmitFlight(event, flightJson) {
    localStorage.setItem("destination", flightJson.destination);
    localStorage.setItem("startDate", flightJson.start_date);
    localStorage.setItem("endDate", flightJson.end_date);
    localStorage.setItem("flight-id", flightJson.id);
    localStorage.setItem("flight-suggestion", "true");
    window.location.href="flights.html";
  }

  /***************** Flight Suggestions *******************/

  /**
   * Fills in the flight suggestion card in the flight suggestions section
   * @param {String} destination - destination of the selected flight
   */
  function fillFlightSuggestions(destination) {
    fetch("/flightslist?destination=" + destination)
      .then(statusCheck)
      .then(res => res.json())
      .then(displayFlight)
      .catch(handleError);
  }

  /**
   * Displays the flight information of the suggested flight.
   * - airline logo
   * - price
   * - dates
   * @param {Object} destinationJson - JSON of the flight
   */
  function displayFlight(destinationJson) {
    // destinationJson[1] is the second flight in the list of flights to the given location
    // this was done for choosing different airline logo looks for the landing page
    let flight = destinationJson[1];
    if (destinationJson[1].location === "Austin") {
      flight = destinationJson[3]
    }

    // logo
    let logo = generate("img");
    logo.src = "/images/" + flight.airline.toLowerCase() + ".png";
    logo.classList.add("logo");
    logo.alt = flight.airline + " logo";

    // price
    let price = generate("p");
    price.textContent = "$" + flight.price;

    // dates
    let date = generate("p");
    let startDate = flight.start_date.split("-")
    startDate = startDate[1] + "/" + startDate[2];
    let endDate = flight.end_date.split("-")
    endDate = endDate[1] + "/" + endDate[2];
    date.textContent = startDate + " to " + endDate;

    // location
    let location = generate("p");
    location.textContent = flight.location;


    let flightLocation = flight.location.toLowerCase().split(" ").join("-");
    // On the html page there are id's for los-angeles, new-york, and Austin as default suggestions
    id(flightLocation).classList.add("flight-card");
    id(flightLocation).addEventListener("click", (event) => {
      flightSuggestion(event, flight);
    });
    id(flightLocation).append(location, price, date, logo);
  }

  /**
   * Directs the user to the "flights.html" webpage and directly to the reserve view for the
   * selected flight.
   * Sets the flight id, airline, and dates to local storage
   * @param {event} event - "click" on flight suggestions flight on landing page
   */
  function flightSuggestion(event, flight) {
    // info in order: location, price, dates, airlines logo
    let flightDetails = event.currentTarget.children;

    // dates
    let dates = flightDetails[2].textContent.split("to");
    let startYear = flight.start_date.split("-")[0];
    let endYear = flight.end_date.split("-")[0];
    let startDate =  startYear + "-" + dates[0].split("/").join("-").trim();
    let endDate = endYear + "-" + dates[1].split("/").join("-").trim();

    //destination
    let destination = flightDetails[0].textContent;

    localStorage.setItem("flight-suggestion", "true");
    localStorage.setItem("destination", destination);
    localStorage.setItem("startDate", startDate);
    localStorage.setItem("endDate", endDate);
    localStorage.setItem("flight-id", flight.id);
    localStorage.setItem("price", flight.price);

    // directs to "flights.html" webpage
    window.location.href="flights.html";
  }

  /********************* Flight Deals *********************/

  /**
   * Adds a "click" event listener to the flight deals images (Italy, Thailand, Phillipines)
   */
  function flightDealsClick() {
    qsa("#flight-deals img").forEach(img => {
      img.addEventListener("click", (event) => {
        flightDealView(event);
      });
    })
  }

  /**
   * Displays the flight deal view in the center of the screen with 4 panels once a flight deal image
   * is clicked.
   * @param {event} event - click event on flight deal image
   */
  function flightDealView(event) {
    let blur = generate("div");
    blur.id = "blur";
    qs("main").appendChild(blur);
    // qs("main").style.filter = "blur(5px)";
    let clickedImage = event.currentTarget;

    // fetches the flight information of the selected location
    fetchFlightDeal(clickedImage.getAttribute("data-flight-id"))

    // showing mobile deal view if window is less than 900px
    if (window.innerWidth < 900) {
      id("mobile-deal-view").classList.remove("hidden");
      qs("#mobile-deal-view span").addEventListener("click", () => {
        id("mobile-deal-view").classList.add("hidden");
        id("cloned-image").remove();
        id("blur").remove();
      })
    } else {
      id("deal-view").classList.remove("hidden");
      // adding close option to deal-view "X" close button
    qs("#deal-view .fa-circle-xmark").addEventListener("click", () => {
      id("deal-view").classList.add("hidden");
      id("cloned-image").remove();
      id("blur").remove();

    })

    }

    // removing visible attribute from panels except for the main deal image
    qsa(".visible").forEach(element => {
      element.classList.remove("visible");
    });

    // removes deal view image if already present
    if (qs("#cloned-image")) {
      id("cloned-image").remove();
    }

    // moves the clicked image to the deal view container
    createMovingImageEffect(event);

    // removising visible:hidden attribute once the image has finished moving
    setTimeout(() => {
      qsa(".invisible").forEach(element => {
        element.classList.add("visible");
      })
    }, 1000);
    }

    /**
     * Gets information on the flight with the given flight ID with an API request
     * Displays that information to the price panel, the flight details panel,
     * and the panel with two images of the destination
     * @param {String} flightId - ID of the selected deal flight
     */
    function fetchFlightDeal(flightId) {
      let params = new FormData();
      params.append("id", flightId);
      fetch("/get_flight", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.json())
      .then(displayDealInformation)
      .catch(handleError);
    }

    /**
     * Displays the deal view trip information in the top right panel
     * and the flight price in the bottom right panel
     * displays two images of the location in the bottom left panel
     * If the screen is in mobile mode, displays the separate mobile panel
     * Adds functionality to book button when directing to flights page
     * @param {Object} flightJson - JSON of the flight
     */
    function displayDealInformation(flightJson) {
      if (window.innerWidth <= 900) {
        mobileDealDisplay(flightJson);
        qs("#mobile-deal-view button").addEventListener("click", (event) => {
          dealViewSubmitFlight(event, flightJson);
        })
      } else {
        displayDealPrice(flightJson);
        displayTripInfo(flightJson);
        addTwoDealImages(flightJson.destination);
        qs("#deal-view button").addEventListener("click", (event) => {
          dealViewSubmitFlight(event, flightJson);
        });
      }
    }

    /**
     * Displays the mobile deal view when the screen is less than 900px wide
     * @param {Object} flightJson - Flight information
     */
    function mobileDealDisplay(flightJson) {
      qs("#mobile-title p").textContent = flightJson.destination;

      // setting price display
      qs("#mobile-details > p").textContent = "$" + flightJson.price;

      // airline logo
      qs("#mobile-details img").src = "/images/" + flightJson.airline.toLowerCase().trim() + ".png";

      // dates
      let date = qs("#mobile-details div p");
      let startDate = flightJson.start_date.split("-");
      let endDate = flightJson.end_date.split("-");
      date.textContent = startDate[1] + "/" + startDate[2] + " - " + endDate[1] + "/" + endDate[2];
    }

    /**
     * Moves the clicked image to the upper left deal view panel and enlarges it as it moves to fit
     * the ensuing container
     * @param {event} event - the image clicked on out of the three deal options
     * presented on the landing page
     */
    function createMovingImageEffect(event) {
      // moving image from flight deal container to deal view panel container
    let clickedImage = event.currentTarget;
    let imageBoundaries = clickedImage.getBoundingClientRect();

    // setting cloned image on top of the same image
    let clonedImage = clickedImage.cloneNode();
    clonedImage.classList.add("deal-image");
    clonedImage.style.top = clickedImage.offsetTop + 'px';
    clonedImage.style.left = clickedImage.offsetLeft + 'px';
    let imageContainer = clickedImage.parentElement;
    imageContainer.appendChild(clonedImage);
    clonedImage.id = "cloned-image";
    clonedImage.style.height = `${clickedImage.offsetHeight}px`;
    clonedImage.style.width = `${clickedImage.offsetWidth}px`;

    // moving cloned image to figure container in the deal-view
    let nextImageContainer = qs("#deal-view figure");
    if (window.innerWidth < 900) {
      nextImageContainer = id("mobile-deal-img");
    }
    let imageContainerBoundaries = nextImageContainer.getBoundingClientRect();
    let leftMove = (imageBoundaries.left - imageContainerBoundaries.left) * -1;
    let upMove = (imageBoundaries.top - imageContainerBoundaries.top) * -1;
    clonedImage.style.transition = "all 2s";
    if (window.innerWidth < 900) {
      clonedImage.style.transition ="all 1.5s";
    }
    clonedImage.style.transform = `translate(${leftMove}px, ${upMove}px)`;
    clonedImage.style.height = `${imageContainerBoundaries.height}px`;
    clonedImage.style.width = `${imageContainerBoundaries.width}px`;
    }

    /**
     * Displays the trip/flight information in the top right panel of the deal view
     * @param {Object} flightJson - JSON info of the given flight
     */
    function displayTripInfo(flightJson) {
     // clearing the details panel whenever a flight deal image is clicked
      qs(".details").innerHTML = "";

      // setting destination header
      let destination = generate("h2");
     destination.textContent = flightJson.destination;

      // airline information
      let airlineContainer = generate("div");
      let airline = generate("p");
      airline.textContent = flightJson.airline;
      airline.classList.add("deal-text");
      let header = generate("p");
      header.textContent = "Airline";
      let line = generate("hr");
      header.classList.add("deal-text");
      airlineContainer.append(header, line, airline);

      // dates information
      let start = flightJson.start_date.split("-");
      let end = flightJson.end_date.split("-");
      let dates = start[1] + "/" + start[2] + " to " + end[1] + "/" + end[2];
      let dateContainer = generate("div");
      let dateHeader = generate("p");
      dateHeader.textContent = "Dates";
      let line2 = generate("hr");
      dateHeader.classList.add("deal-text");
      dateContainer.append(dateHeader, line2, dates);

      //tickets
      let ticketHeader = generate("p");
      ticketHeader.textContent = "Tickets";
      ticketHeader.classList.add("deal-text");
      let numTickets = generate("p");
      numTickets.textContent = "2";
      let ticketsContainer = generate("div");
      let line3 = generate("hr");
      numTickets.classList.add("deal-text");
      ticketsContainer.append(ticketHeader, line3, numTickets);

      let info = generate("section");
      info.append(airlineContainer, dateContainer, ticketsContainer);
      qs(".details").append(destination, info);
    }

    /**
     * Adds two images of the destination to the lower left panel of the deal view once a location is clicked
     * @param {String} destination - destination of the selected flight deal
     */
    function addTwoDealImages(destination) {

      let imageContainer = qs(".itinerary");
      imageContainer.innerHTML = "";
      if (destination == "Italy") {
        displayTwoImages("images/pantheon.jpg","Roman Pantheon",
          "images/caracalla.jpg", "Roman Baths of Caracalla");
      } else if (destination == "Phuket") {
        displayTwoImages("images/elephants.jpg","Thai Elephants",
          "images/kohsamui.jpg", "Koh Samui");
      } else if (destination == "Manila") {
        displayTwoImages("images/palawan.jpg","Palawan Beach",
          "images/diving.jpg", "Diver at Palawan");
      }
    }

    /**
     * Displays the two images in the bottom left panel of deal view
     * @param {String} src1 - File path for first image in the two images in the bottom left panel
     *  of deal view
     * @param {String} alt1 - Alt description for image 1
     * @param {String} src2 - File path for the second image in the two images in the bottom left
     * panel of deal view
     * @param {String} alt2 - Alt description for image 2
     */
    function displayTwoImages(src1, alt1, src2, alt2) {
      let imageContainer = qs(".itinerary");
      let img1 = generate("img");
      let img2 = generate("img");
      img1.src = src1;
      img1.alt = alt1;
      img2.src = src2;
      img2.alt = alt2;
      imageContainer.append(img1, img2);
    }

    /**
     * Displays the given flight price in the bottom right panel of the flight deal display
     * @param {Object} flightJson- Flight json information including price
     */
    function displayDealPrice(flightJson) {
      let heading = qs(".price").querySelector("h3");
      heading.textContent = "Deal Price";
      let price = qs(".price").querySelector("p");
      price.textContent = "$" + flightJson.price;
    }

/*** Smaller Screen Responsiveness ***/

  /**
   * Moves the flight details button into the #flight-places form section if the screen size
   * is less than 950px. This is so the button is not hanging outside of the given flight reservation
   * section
   * The original placement is within the form but outside of #flight-places section.
   */
  function smallScreenButtonMove() {
    const smallQuery = window.matchMedia("(max-width: 950px)");
    if (smallQuery.matches) {
      let enterButton = qs("#flight-details button");
      id("flight-places").appendChild(enterButton);
      id("round-one-way").classList.add("hidden");
    }
  }

  /**
   * Moves flight deals before flight suggestions if the screen is smaller than 900px
   * This is for page layout flow
   */
  function smallScreenSectionsMove() {
    const sectionsQuery = window.matchMedia("(max-width: 900px)");
    if (sectionsQuery.matches) {
      // qs("main").insertBefore(id("company-name"),id("flight-suggestions"));
      qs("main").insertBefore(id("flight-deals"),id("flight-suggestions"));
    }
  }

  /**
   * Adds a "click" event listener to the "login" option in the navbar
   */
  function loginEventListener() {
    id("login").addEventListener("click", loginDropdown);
  }

  /**
   * Displays the login options in the login dropdown
   * The two options are "login" and "create user"
   */
  function loginDropdown() {
    let dropdown = id("login-dropdown");
    dropdown.classList.toggle("hidden");

    id("sign-in").addEventListener("click", () => {
      localStorage.setItem("sign-in", "true");
      window.location.href="login.html";
    });
    id("create-user-nav").addEventListener("click", () => {
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
   * Changes the "login" option in the navbar to "Account" if a user is logged in
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
   * Enables drop down menu when selecting "menu" in the navbar
   */
  function menuEventListener() {
    qs("#menu p").addEventListener("click", menuDropdown);
    id("sign-out").addEventListener("click", signOut)
  }

  /**
   * Shows the "menu" dropdown in the navbar. It contains the option of
   * "sign out"
   */
  function menuDropdown() {
    let menuDropdown = qs("#menu .dropdown");
    menuDropdown.classList.toggle("hidden");
  }

  /**
   * Signs the user out, displays a signed out message,
   * and directs the user to the homepage. The "sign out" option is not visible
   * if no user is logged in
   */
  function signOut() {
    const ONE_SECOND = 500;
    if (id("sign-out-message")) {
      id("sign-out-message").remove();
    }
    localStorage.removeItem("logged-in");
    let paragraph = generate("p");
    paragraph.id = "sign-out-message";
    paragraph.textContent = "You have been signed out successfully";
    setTimeout(() => {
      id("login-container").appendChild(paragraph);
      qs("#menu .dropdown").classList.add("hidden");
    }, ONE_SECOND);


  }

   /**
   * Displays error message to the page
   * @param {String} error
   */
   function handleError(error) {
    console.log(error);
    // let errorMessage = generate("p");
    // errorMessage.textContent = error;
    // qs("body").append(errorMessage);
  }

  /*** Helper Functions ***/

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