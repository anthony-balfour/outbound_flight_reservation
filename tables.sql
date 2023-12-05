/* A few CREATE statements from the database */

CREATE TABLE flights (
  flight_id INTEGER PRIMARY KEY autoincrement,
  customer_id INTEGER,
  price INTEGER,
  airline TEXT,
  dates_id INTEGER,
  locations_id INTEGER,
  FOREIGN KEY(customer_id) REFERENCES customers(id),
  FOREIGN KEY(dates_id) REFERENCES dates(id),
  FOREIGN KEY(locations_id) REFERENCES locations(id)
)

CREATE TABLE "customers" (
	"id"	INTEGER,
	"first name"	TEXT,
	"last name"	TEXT,
	"email"	TEXT,
  "username" TEXT,
  "password" TEXT,
  "account_number" TEXT
	PRIMARY KEY("id" AUTOINCREMENT)
);

/*Need to add time*/
CREATE TABLE dates (
  id INTEGER PRIMARY KEY autoincrement,
  start_date DATE,
  end_date DATE
)

CREATE TABLE "locations" (
	"id"	INTEGER,
	"departure_location"	TEXT,
	"returning_location"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
