/* Mongo Database Connection */

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "theatres";

// Use connect method to connect to the server
MongoClient.connect(
  url,
  function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    client.close();
  }
);

module.exports = MongoClient.connection;

/* Mongoose */

/*

const mongoose = require("mongoose");
assert = require("assert");

const url = "mongodb://localhost/theatres/";
mongoose.Promise = global.Promise;
mongoose.connect(
  url,
  { useNewUrlParser: true },
  function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to database");

    // db.close(); turn on for testing
  }
);
mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB connection Error:")
);
mongoose.set("debug", true);

module.exports = mongoose.connection;

*/
