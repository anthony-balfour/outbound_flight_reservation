/**
 * Name: Anthony Balfour
 * Section: AF
 * Date: 6/2/2023
 * TA: Donovan, Sonia
 *
 * This file, app.js, serves as the backend manager for the Expedia flights webpage. It pulls data
 * from expedia.db to get and handle information for users, flights, reservations, user history,
 * and locations. Example endpoints are getting list of flights that match a criteria or creating a
 * new user.
 */

"use strict";

const express = require("express");
const app = express();
const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const CLIENT_ERROR_NUMBER = 400;
const CLIENT_ERROR_MESSAGE = "There was an error with the input information.";
const SERVER_ERROR_NUMBER = 500;
const DEFAULT_PORT = 8000;
const SERVER_ERROR_MESSAGE = "An error occured on the server. Try again later";

/**
 * Gets all of the available flights
 * Has optional search queries of start date, end date, and destination
 * Destination must be the city name with the first letter capitalized
 * The dates must be in the format of YYYY-MM-DD
 */
app.get("/flightslist", async (req, res) => {
  let db = await getDBConnection();
  let startDate = req.query["start_date"];
  let endDate = req.query["end_date"];
  let destination = req.query.destination;
  let selectFlightsLocationQuery = "SELECT flights.id, flights.price, flights.airline, " +
  "flights.destination_id, flights.return_id, flights.start_date, flights.end_date, " +
  "flights.capacity, locations.location ";
  try {
    if (startDate && destination) {
      if (endDate) {
        let flightsQuery = selectFlightsLocationQuery + "FROM flights, locations WHERE flights.start_date >= ? AND flights.end_date <= ? " +
        "AND locations.location = ? " +
        "AND locations.id = flights.destination_id " +
        "AND flights.capacity > 0";
        let flightResults = await db.all(flightsQuery, [startDate, endDate, destination]);
        res.json(flightResults);
      }
      else {
        let flightsQuery =
        selectFlightsLocationQuery + " FROM flights, locations WHERE flights.start_date >= ? AND ? = locations.location " +
        "AND flights.destination_id = locations.id " +
        "AND flights.capacity > 0";
        let flightResults = await db.all(flightsQuery, [startDate, destination]);
        res.json(flightResults);
      }
    } else if (destination) {
      let flightsQuery = selectFlightsLocationQuery +
      "FROM flights, locations where flights.start_date >= date() AND " +
      "locations.id = destination_id AND locations.location = ? AND flights.capacity > 0";
      let flightResults = await db.all(flightsQuery, [destination]);
      res.json(flightResults);
    } else {
      let flightsQuery = selectFlightsLocationQuery + "FROM flights, locations where flights.start_date >= date() AND " +
      "locations.id = destination_id AND flights.capacity > 0";
      let flightResults = await db.all(flightsQuery);
      res.json(flightResults);
    }
    await db.close();
  } catch {
    res.status(SERVER_ERROR_NUMBER).type("text").send(SERVER_ERROR_MESSAGE);
  }
});

/**
 * Gets the flight information for the given flight ID
 */
app.post("/get_flight", async (req, res) => {
  let db = await getDBConnection();
  let flightID = req.body.id;
  try {
    if (flightID) {
      let flightQuery = "SELECT * FROM flights WHERE id = ? ";
      let results = await db.get(flightQuery, [flightID]);
      let destination = await db.get("SELECT * FROM locations WHERE id = " + results.destination_id);
      let returnLocation = await db.get("SELECT * FROM locations WHERE id = " + results.return_id);
      results.destination = destination.location;
      results.returnLocation = returnLocation.location;
      res.json(results);
    } else {
      res.status(CLIENT_ERROR_NUMBER).type("text")
        .send(CLIENT_ERROR_MESSAGE);
    }
    await db.close();
  } catch(err){
    res.status(SERVER_ERROR_NUMBER).type("text")
      .send(SERVER_ERROR_MESSAGE);
  }
})

/**
 * Creates a new user with the given POST parameters of username, password, email,
 * firstName and lastName. This user is added to the expedia.db database and a plain text
 * message is sent stating "New user created successfully"
 * If the user input is not formatted correctly, returns a message stating:
 * "Unsuccessful: Incorrect input parameters"
 * Throws server error if something goes wrong on the server
 */
app.post("/create_user", async (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;
  let db = await getDBConnection();
  res.type("text");
  try {
    if (username && password && email && firstName && lastName) {
      // checking if the email or username is already in the system
      let usernameCheckQuery = "SELECT username, email FROM customers WHERE username = ? " +
      "OR email = ?";
      let usernameCheck = await db.all(usernameCheckQuery, [username, email]);
      if (usernameCheck.length === 0) {
        let insertQuery = "INSERT INTO customers ('first name', 'last name', 'email', 'username', 'password') " +
        "VALUES (?, ?, ?, ?, ?)";
        await db.run(insertQuery, [firstName, lastName, email, username, password]);
        res.send("New user created successfully");
      } else {
        // branch for if the username or email is already in use
        // checking if either the entered email or the entered username is already in use

        for (let i = 0; i < usernameCheck.length; i++) {
          if (usernameCheck[i].email === email) {
            res.send("That email is already registered to an account.");
          } else {
          res.send("That username is already taken. Try another one.");
          }
        }
      }
    } else {
      res.status(CLIENT_ERROR_NUMBER).send("Unsuccessful: Incorrect input parameters");
    }
    await db.close();
  } catch (err) {
    res.status(SERVER_ERROR_NUMBER).send(SERVER_ERROR_MESSAGE);
  }
});

/**
 * Reserves a flight given POST parameters of flightID and customerID
 */
app.post("/store_flight", async (req, res) => {
  let flightID = req.body.flightID;
  let customerID = req.body.customerID;
  const TEN = 10;
  let confirmationNumber = "c" + flightID * TEN;
  let db = await getDBConnection();
  res.type("text");
  try {
    if(flightID && customerID) {

      // checking if selected flight time starts or ends on the same day as any other booked flights
      // coming up
      let flightQuery = "SELECT * FROM flights WHERE id = ?";
      let currentFlight = await db.get(flightQuery, [flightID]);
      let startDate = currentFlight.start_date;
      let endDate = currentFlight.end_date;

      // if the current flight is equal to any flights in past_flights, then it's unbookable
      let bookingCheckQuery = "SELECT * FROM flights f, past_flights p WHERE p.customer_id = ? AND f.id = p.flight_id AND (f.start_date = ? OR f.end_date = ?)";
      let bookingCheck = await db.all(bookingCheckQuery, [customerID, startDate, endDate]);
      if (bookingCheck.length > 0) {
        res.send("You are already booked on those dates. Please select a different date for your flight. Thank you");
      } else {
        let storeFlightQuery = "INSERT INTO past_flights (customer_id, flight_id, confirmation_number) " +
        "VALUES (?, ?, ?)";

        // capacity handling
        let capacityQuery = "SELECT capacity FROM flights WHERE id = ?";
        let capacity = await db.get(capacityQuery, [flightID]);
        let newCapacity = capacity.capacity - 1;
        let updateCapacityQuery = "UPDATE flights SET capacity = ? WHERE id = ?";
        await db.run(updateCapacityQuery, [newCapacity, flightID]);

        //storing the flight
        await db.run(storeFlightQuery, [customerID, flightID, confirmationNumber]);
        res.send("Flight stored successfully");
      }
    } else {
      res.status(CLIENT_ERROR_NUMBER).send(CLIENT_ERROR_MESSAGE);
    }
    await db.close();
  } catch(err) {
    res.type("text").status(SERVER_ERROR_NUMBER)
      .send(SERVER_ERROR_MESSAGE);
  }
});

/**
 * Gets the current and past flights for the selected user using the POST parameter
 * of id (customer id). Returns JSON with the every flight with the details:
 * price
 * destination
 * dates
 * airlines
 * Throws client error if the given ID is not within the database
 * Throws server error if something goes wrong on the server
 */
app.post("/flight_history", async (req, res) => {
  let customerID = req.body.id;
  let db = await getDBConnection();
  try {
    if (customerID) {
      let historyQuery =
      "SELECT f.price, f.airline, f.start_date, f.end_date, f.destination_id, f.return_id, p.confirmation_number " +
      "FROM past_flights p, flights f WHERE p.customer_id = ? " +
      "AND p.flight_id = f.id " +
      "AND f.end_date < date() ";

      let currentQuery =
      "SELECT f.price, f.airline, f.start_date, f.end_date, f.destination_id, f.return_id, p.confirmation_number  " +
      "FROM past_flights p, flights f WHERE p.customer_id = ? " +
      "AND p.flight_id = f.id " +
      "AND f.end_date >= date() ";

      let results = {};
      results.past_flights = await db.all(historyQuery, [customerID]);
      for (let i = 0; i < results.past_flights.length; i++) {
        let destinationQuery = "SELECT * FROM locations WHERE id = ?";
        let destination = await db.get(destinationQuery, [results.past_flights[i].destination_id]);
        let returnLocation = await db.get(destinationQuery, [results.past_flights[i].return_id]);
        results.past_flights[i].destination = destination.location;
        results.past_flights[i].returnLocation = returnLocation.location;
      }

      results.current_flights = await db.all(currentQuery, [customerID]);
      for (let i = 0; i < results.current_flights.length; i++) {
        let destinationQuery = "SELECT * FROM locations WHERE id = ?";
        let destination = await db.get(destinationQuery, [results.current_flights[i].destination_id]);
        let returnLocation = await db.get(destinationQuery, [results.current_flights[i].return_id]);
        results.current_flights[i].destination = destination.location;
        results.current_flights[i].returnLocation = returnLocation.location;
      }
      res.json(results);
    } else {
      res.type("text").status(CLIENT_ERROR_NUMBER)
        .send(CLIENT_ERROR_MESSAGE);
    }
    await db.close();
  } catch(err) {
    res.type("text").status(SERVER_ERROR_NUMBER)
      .send(SERVER_ERROR_MESSAGE);
  }
})

/**
 * Checks if the user is in the expedia.db database with the POST parameters of
 * username and password. If the user is in the database, returns JSON with the
 * id of the customer. Else, returns an error message stating the user is not
 * in the system.
 * Throws server error if something goes wrong on the server
 */
app.post("/user_login", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let db = await getDBConnection();
  try {
    if(username && password) {
      let userQuery = "SELECT * FROM customers WHERE username = ? " +
      "AND password = ? ";
      let user = await db.get(userQuery, [username, password]);
      if (user === undefined) {
        res.json({
          id: -1,
          message: "Those credentials do not match a user in the system."
        });
      } else {
        let customerID = user.id;
        res.json({
          id: customerID,
          message: "Success. You will be logged in shortly."
        });
      }
    }
    await db.close();
  } catch(err) {
    res.type("text").status(SERVER_ERROR_NUMBER)
      .send(SERVER_ERROR_MESSAGE);
  }
});

/**
 * Gets the user info for the given id POST paramter. This includes
 *
 *
 * Throws client error if the given ID is not within the database.
 * Throws server error if something goes wrong on the server
 */
app.post("/user_info", async (req, res) => {
  let db = await getDBConnection();
  let id = req.body.id;
  try {
    if (id) {
      let userQuery = "SELECT * FROM customers where id = ?";
      let user = await db.get(userQuery, [id]);
      res.json(user);
    } else {
      res.type("text").status(CLIENT_ERROR_NUMBER)
        .send("That user does not exist in the system");
    }
    await db.close();
  } catch(err) {
    res.type("text").status(SERVER_ERROR_NUMBER)
      .send(SERVER_ERROR_MESSAGE);
  }
})

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {sqlite3.Database} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "expedia.db",
    driver: sqlite3.Database
  });

  return db;
}

// forward facing files
app.use(express.static("public"));
const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT);