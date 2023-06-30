# "Expedia" API documentation
The Expedia API provides information on all flights, users, reservation statuses, and locations. It enables the ability to reserve flights for customers, add users,
and update flight capacity.

## List of Flights matching criteria

**Request Format:** /flightslist

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns JSON with about each flight given the specified criteria. Returns price, airline, destination, start_date, and end_date, id, capacity
Takes in query paramters of:<br>
-start_date<br>
-end_date<br>
-destination<br>
If no parameters are given, gives a list of all flights occuring at the current date
or later

**Example Request:** /flightslist?start_date=2023-06-28&end_date=2023-07-04&destination=Phuket

**Example Response:**
```json
{
    "price": "$1000",
    "start_date": "06/10/2023",
    "end_date": "6/17/2023",
    "destination_id": 16,
    "return_id": 1,
    "id": 1,
    "airline": "Alaska",
    "capacity": 130
}
```

**Error Handling:**
-If no flights match the specified criteria (dates, price, etc):
  Returns a message stating: `No found flights`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message:
`An error occured on the server. Try again later.`

## Gets detailed information for a single flight

**Request Format:** /get_flight

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Takes in flight id and returns JSON with about the flight. Returns price, airline, destination, start_date, end_date, id, capacity, return location.
Takes in query paramters of
-id
If no parameters are given, gives a list of all flights occuring at the current date
or later

**Example Request:** /get_flight with POST parameter of id

**Example Response:**
```json
{
  "id": 2,
  "price": 75,
  "airline": "Alaska",
  "destination_id": 14,
  "return_id": 1,
  "start_date": "2023-05-13",
  "end_date": "2023-05-18",
  "capacity": 150,
  "destination": "Portland",
  "returnLocation": "Seattle"
}
```

**Error Handling:**
-If no flights match the specified criteria (dates, price, etc):
  Returns a message stating: `No found flights`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message:
`An error occured on the server. Try again later.`

## Creates a user

**Request Format:** /create_user

**Request Type:** POST

**Returned Data Format**: text

**Description:** Creates a user with the given informtation. Parameters are:
-firstName
-lastName
-username
-password
-email
Stores the user in the customers tables in the database

**Example Request:** / with POST parameters of `firstName`, `password`,
`username`, `lastName`, `password`

**Example Responses:**

"New user created successfully"

"That email is already registered to an account."

"That username is already taken. Try another one."

**Error Handling:**
400 (invalid request) errors (all plain text):
  - If passed a username that does not exist or a non-matching username and password,\
  returns an error with the
  message: `"Unsuccessful: Incorrect input parameters"`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message:
`Something went wrong. Please try again later.`

## Reserve a Flight
**Request Format:** /store_flight

**Request Type:** POST

**Returned Data Format**: TEXT

**Description:** Reserves a flight by storing the flight in the past flights table
in the database. Does not book if the flight occurs on the same day as another flight.

**Example Request:** /reserve with POST parameters of `flightID` and `customerID`

**Example Responses:**

```
"Flight stored successfully"
```

```
"You are already booked on those dates. Please select a different date for your flight. Thank you"
```
**Error Handling:**
400 (invalid request) errors (all plain text):
  - If any  flight parameters are missing or
    If the one-way parameter is marked as false and any inbound flight paramaters are missing,
    returns an error with the message:
  `There was an error with the input information.`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message:
  `An error occured on the server. Try again later.`

## Flight History of a user
**Request Format:** flight_history

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Returns the currently booked flights and past flights of
the given user. Takes in a user ID parameter.

**Example Request:** /flight_history with POST parameter of `id`

**Example Response:**
```json
{
  "past_flights": [
    {
      "price": 75,
      "airline": "Alaska",
      "start_date": "2023-05-13\r\n",
      "end_date": "2023-05-18\r\n\r\n",
      "destination_id": 14,
      "return_id": 1,
      "confirmation_number": "c1",
      "destination": "Portland",
      "returnLocation": "Seattle"
    },
    {
      "price": 3200,
      "airline": "Southwest",
      "start_date": "2023-05-27\r\n",
      "end_date": "2023-05-29\r\n",
      "destination_id": 12,
      "return_id": 1,
      "confirmation_number": "c700",
      "destination": "Tokyo",
      "returnLocation": "Seattle"
    },
    {
      "price": 2200,
      "airline": "Alaska",
      "start_date": "2023-05-20\r\n",
      "end_date": "2023-05-27\r\n",
      "destination_id": 11,
      "return_id": 1,
      "confirmation_number": "c650",
      "destination": "Italy",
      "returnLocation": "Seattle"
    },
    {
      "price": 2500,
      "airline": "Delta",
      "start_date": "2023-05-05\r\n",
      "end_date": "2023-05-10\r\n",
      "destination_id": 17,
      "return_id": 1,
      "confirmation_number": "c920",
      "destination": "Paris",
      "returnLocation": "Seattle"
    },
    {
      "price": 75,
      "airline": "Alaska",
      "start_date": "2023-05-13\r\n",
      "end_date": "2023-05-18\r\n\r\n",
      "destination_id": 14,
      "return_id": 1,
      "confirmation_number": "c20",
      "destination": "Portland",
      "returnLocation": "Seattle"
    }
  ],
  "current_flights": [
    {
      "price": 2200,
      "airline": "Delta",
      "start_date": "2023-06-28",
      "end_date": "2023-07-12",
      "destination_id": 11,
      "return_id": 1,
      "confirmation_number": "c660",
      "destination": "Italy",
      "returnLocation": "Seattle"
    },
    {
      "price": 500,
      "airline": "Southwest",
      "start_date": "2023-08-28",
      "end_date": "2023-09-12",
      "destination_id": 11,
      "return_id": 1,
      "confirmation_number": "c70",
      "destination": "Italy",
      "returnLocation": "Seattle"
    }
  ]
}
```
**Error Handling:**

All information will be passed through form inputs

400 (invalid request) errors (all plain text):
  - if any parameters are in the wrong format:
  `There was an error with the input information.`

- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message:
  `Something went wrong. Please try again later.`

## User Login
**Request Format:** /user_login

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Returns the id of the logged in user with a message stating whether
the login was successful. If the user does not exist, the returned ID is -1;

**Example Request:** /user_login with POST parameters of `username` and `password`

**Example Response:**
```json
{
  "id": 1,
  "message": "Success. You will be logged in shortly."
}
```

```json
{
  "id": -1,
  "message": "Those credentials do not match a user in the system."
}
```
**Error Handling:**

All information will be passed through form inputs

- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message:
  `Something went wrong. Please try again later.`

## Get the information of a user
**Request Format:** /user_info

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Gets the id, first name, last name, username, email, and password
of the user given the user ID

**Example Request:** /user_info with POST parameters of `id`

**Example Response:**
```json
{
  "id": 4,
  "first name": "Anthony",
  "last name": "Balfour",
  "email": "anthony@uw.edu",
  "username": "ab",
  "password": "earth"
}
```
**Error Handling:**

- Possible 400 (invalid request) errors (all plain text):
  - If the username is alrady in the database, returns an error with the message:
  `That user does not exist in the system`

- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message:
  `Something went wrong. Please try again later.`