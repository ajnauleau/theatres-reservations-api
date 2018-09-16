# Theater Reservations API - Persisting Reservations Waiting to be Called On
 ... written in JavaScript, Express, and MongoDB!


## Purpose

This API and its schema pattern were built around the concept of buying and selling tickets for any concert, theatres, or venue type of organisation.

It's a reservation-based schema where the user can pick their own seats and theater session, and the seats are reserved until the user either checks out the cart or the cart expires.

There is much resemblence for shopping cart for reservations e-commerce API, but with some unique differences which make it beneficial to understand and implement in your own project.

## How to Use This API

Any of the follow root level routes will return all of the items for that route call's subject:

`'/theatres': All of the theatres in the database`
`'/sessions': All of the sessions for theatres in the database`
`'/carts': All of the shopping carts stored in the database (current & reserved)`
`'/receipts': All the receipts from successful checkouts in the database`

## Routes

In order to find a certain theatres information, such as the receipt for a purchase made within the system, the call to this API must follow this route and its directory order:

`'/theatres/theatresId/sessions/sessionId/carts/cartId/receipts/receiptId': Where each 'subjectId' is an integer`

Here's an example of a call to purchase tickets and get a *receipt* at the the theatre `'The Royal'` which is the first document in the database:

```sh
$ nodemon
$[nodemon] restarting due to changes...
$[nodemon] starting `node server.js`

$ curl 'localhost:3000/theatres/1/sessions/3/carts/1/receipts/327/new'
$ ... 
$ {"stub":"[/theaters/1/sessions/1/carts/1/receipts/1/new] Endpoint works!"}%

```
[**TODO**] nested routes? html post form?

## What I Learned

- Buiding the theater-reservations-api was an exercise which had me break down each individual step of making, breaking, and calling an API made in Nodejs with Express. 

- This atypical use of MongoDB and NOT Mongoose showed me the true underlyings of this nosql database, and although I ran into headaches, I came out with a better global understanding of how to internact with MongoDB on a lower-level.

- I was able also to the the evolution in the languages query calls, as the instructions used outdated query calls, and therefore it was necessary to upgrade and port over to the new methods.

- To end things, I was finally about to download and run Postman for the first time and experiment with it. I had heard many times about this program/application but had never had the pleasure to use it before. Definitely a nice tool.
