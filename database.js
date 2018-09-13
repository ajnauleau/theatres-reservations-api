/* Mongo Database Connection */

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "theatres";

let db;

const connectMongo = async () => {
  // Use connect method to connect to the server
  await MongoClient.connect(
    url,
    async function(err, client) {
      assert.equal(null, err);
      console.log("Connected successfully to database");
      let db = await client.db(dbName);
      client.close();
    }
  );
};

module.exports = connectMongo();

MongoClient.connect(
  url,
  { useNewUrlParser: true },
  async function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to database");
    db = await client.db(dbName);

    client.close();
  }
);

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
