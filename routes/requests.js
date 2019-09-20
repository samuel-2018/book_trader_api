const express = require("express");

const router = express.Router();

// Sanitization middleware
const { body, param } = require("express-validator");

// Database access
const { db, sequelize } = require("../models");
const { Book, Request, User, Trade } = db;

// Sequelize operators
const Sequelize = require("sequelize");
const { Op } = Sequelize;

// Authentication
const authenticateUser = require("../helpers/authenticateUser");

// ========================================
// ROUTES
// ========================================

// ALL ROUTES: MODIFY USER INPUT
router.use([
  // (".escape()" will mutate data: <, >, &, ', " and /.)
  // The client side must assume that all data is unsafe.

  body(["requesteeId"])
    // Removes leading and trailing whitespace
    .trim(),
  param(["bookId", "requestId"])
    // Removes leading and trailing whitespace
    .trim()
    // Converts to number or NaN.
    .toInt()
]);

// ROUTE - api/requests
router
  .route("/")

  // GET - List of requests
  .get(async (req, res, next) => {
    try {
      const result = await Request.findAll({
        attributes: { exclude: ["updatedAt"] },

        include: [
          // Requester
          {
            model: User,
            as: "requester",
            attributes: ["username"]
          },

          // Requestee
          {
            model: User,
            as: "requestee",
            attributes: ["username"]
          },

          // Give books
          {
            model: Book,
            as: "giveBooksRequest",
            through: "give_books_requests",
            attributes: ["title", "author", "createdAt"],
            include: [
              // Includes the book owner's username and location
              {
                model: User,
                as: "owner",
                attributes: ["username", "country", "state", "city"]
              },
              // List of those wanting this book
              {
                model: Request,
                as: "takeBooksRequest",
                attributes: ["requesterId"],

                // Removes extra join table info
                through: { attributes: [] },

                include: [
                  // Usernames of requesters
                  {
                    model: User,
                    as: "requester",
                    attributes: ["username"]
                  }
                ]
              }
            ],
            // Removes extra join table info
            through: { attributes: [] }
          },

          // Take books
          {
            model: Book,
            as: "takeBooksRequest",
            through: "take_books_requests",
            attributes: ["title", "author", "createdAt"],
            include: [
              // Includes the book owner's username and location
              {
                model: User,
                as: "owner",
                attributes: ["username", "country", "state", "city"]
              },
              // List of those wanting this book
              {
                model: Request,
                as: "takeBooksRequest",
                attributes: ["requesterId"],

                // Removes extra join table info
                through: { attributes: [] },

                include: [
                  // Usernames of requesters
                  {
                    model: User,
                    as: "requester",
                    attributes: ["username"]
                  }
                ]
              }
            ],
            // Removes extra join table info
            through: { attributes: [] }
          }
        ]
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  })

  // POST - Create a request
  .post(authenticateUser, async (req, res, next) => {
    try {
      // Get current authenticated user
      const userId = await req.currentUser.dataValues.userId;

      // IMPORTANT: This prevents a user from saving data to someone else's account.
      req.body.requesterId = userId;

      const requesterId = req.body.requesterId;
      const requesteeId = req.body.requesteeId;

      // Are requester and requestee different users?
      if (requesterId !== requesteeId) {
        console.log(req.body);

        // Authorized to give?
        const booksToGive = await Book.findAll({
          // "giveBooksId" is an array of book ids.
          where: { bookId: req.body.giveBooksId }
        }).then(books => {
          // Is the current user the owner of every 'give' book?
          const isAuthorized = books.every(
            book => book.dataValues.ownerId == requesterId
          );

          if (isAuthorized) {
            // Authorized, returns array of books
            return books;
          } else {
            // Not authorized
            return false;
          }
        });

        // Authorized to take?
        const booksToTake = await Book.findAll({
          // "takeBooksId" is an array of book ids.
          where: { bookId: req.body.takeBooksId }
        }).then(books => {
          // Does every book belong to the requestee?
          const isAuthorized = books.every(
            book => book.dataValues.ownerId == req.body.requesteeId
          );

          if (isAuthorized) {
            // Authorized, returns array of books
            return books;
          } else {
            // Not authorized
            return false;
          }
        });

        // AUTHORIZE
        if (booksToGive && booksToTake) {
          // Creates and saves new request
          const request = await Request.create(req.body);

          // Adds books (goes to join tables)
          request.addGiveBooksRequest(booksToGive);
          request.addTakeBooksRequest(booksToTake);

          // Gets request ID
          const requestId = request.dataValues.requestId;

          res.writeHead(201, {
            // URI for the course
            Location: `/api/requests/${requestId}`
          });
          res.end();
        } else {
          // Error: Forbidden
          const forbidden = new Error("Forbidden.");
          forbidden.status = 403;
          next(forbidden);
        }
      } else {
        // Error: Forbidden
        const forbidden = new Error("Forbidden.");
        forbidden.status = 403;
        next(forbidden);
      }
    } catch (error) {
      // Catches validation errors sent from Sequelize
      if (error.name === "SequelizeValidationError") {
        // Bad Request
        // Message assigned by Sequelize
        error.status = 400;
      }
      next(error);
    }
  });

// ROUTE - api/requests/book/:bookId
// GET - List of requests involving a particular book
router.get("/book/:bookId", async (req, res, next) => {
  try {
    const result = await Request.findAll({
      attributes: { exclude: ["updatedAt"] },

      where: {
        [Op.or]: [
          {
            "$takeBooksRequest.bookId$": req.params.bookId
            // The '$' gets field from included model.
            // For reference, below is the model:
            // model: Book,
            // as: "takeBooksRequest",
            // through: "take_books_requests",
          },
          {
            "$giveBooksRequest.bookId$": req.params.bookId
          }
        ]
      },
      include: [
        // Requester
        {
          model: User,
          as: "requester",
          attributes: ["username"]
        },

        // Requestee
        {
          model: User,
          as: "requestee",
          attributes: ["username"]
        },

        // Give books
        {
          model: Book,
          as: "giveBooksRequest",
          through: "give_books_requests",
          attributes: ["title", "author", "createdAt"],
          include: [
            // Includes the book owner's username and location
            {
              model: User,
              as: "owner",
              attributes: ["username", "country", "state", "city"]
            },
            // List of those wanting this book
            {
              model: Request,
              as: "takeBooksRequest",
              attributes: ["requesterId"],

              // Removes extra join table info
              through: { attributes: [] },

              include: [
                // Usernames of requesters
                {
                  model: User,
                  as: "requester",
                  attributes: ["username"]
                }
              ]
            }
          ],
          // Removes extra join table info
          through: { attributes: [] }
        },

        // Take books
        {
          model: Book,
          as: "takeBooksRequest",
          through: "take_books_requests",
          attributes: ["title", "author", "createdAt"],
          include: [
            // Includes the book owner's username and location
            {
              model: User,
              as: "owner",
              attributes: ["username", "country", "state", "city"]
            },
            // List of those wanting this book
            {
              model: Request,
              as: "takeBooksRequest",
              attributes: ["requesterId"],

              // Removes extra join table info
              through: { attributes: [] },

              include: [
                // Usernames of requesters
                {
                  model: User,
                  as: "requester",
                  attributes: ["username"]
                }
              ]
            }
          ],
          // Removes extra join table info
          through: { attributes: [] }
        }
      ]
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// ROUTE - api/requests/:requestId
router
  .route("/:requestId")

  // GET - One request
  .get(async (req, res, next) => {
    try {
      const result = await Request.findByPk(req.params.requestId, {
        attributes: { exclude: ["updatedAt"] },

        include: [
          // Requester
          {
            model: User,
            as: "requester",
            attributes: ["username"]
          },

          // Requestee
          {
            model: User,
            as: "requestee",
            attributes: ["username"]
          },

          // Give books
          {
            model: Book,
            as: "giveBooksRequest",
            through: "give_books_requests",
            attributes: ["title", "author", "createdAt"],
            include: [
              // Includes the book owner's username and location
              {
                model: User,
                as: "owner",
                attributes: ["username", "country", "state", "city"]
              },
              // List of those wanting this book
              {
                model: Request,
                as: "takeBooksRequest",
                attributes: ["requesterId"],

                // Removes extra join table info
                through: { attributes: [] },

                include: [
                  // Usernames of requesters
                  {
                    model: User,
                    as: "requester",
                    attributes: ["username"]
                  }
                ]
              }
            ],
            // Removes extra join table info
            through: { attributes: [] }
          },

          // Take books
          {
            model: Book,
            as: "takeBooksRequest",
            through: "take_books_requests",
            attributes: ["title", "author", "createdAt"],
            include: [
              // Includes the book owner's username and location
              {
                model: User,
                as: "owner",
                attributes: ["username", "country", "state", "city"]
              },
              // List of those wanting this book
              {
                model: Request,
                as: "takeBooksRequest",
                attributes: ["requesterId"],

                // Removes extra join table info
                through: { attributes: [] },

                include: [
                  // Usernames of requesters
                  {
                    model: User,
                    as: "requester",
                    attributes: ["username"]
                  }
                ]
              }
            ],
            // Removes extra join table info
            through: { attributes: [] }
          }
        ]
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  })

  // DELETE - One request
  .delete(authenticateUser, async (req, res, next) => {
    try {
      // Get request
      const request = await Request.findByPk(req.params.requestId);

      // Got request?
      if (request) {
        const requesterId = request.dataValues.requesterId;
        const requesteeId = request.dataValues.requesteeId;

        // Get current authenticated user
        const userId = await req.currentUser.dataValues.userId;

        // AUTHORIZE
        // Is the user the requester or requestee?
        if (userId === requesterId || userId === requesteeId) {
          // Delete
          await request.destroy();
        } else {
          // Not authorized
          // Error: Forbidden
          const forbidden = new Error("Forbidden.");
          forbidden.status = 403;
          next(forbidden);
        }
      } else {
        // Error: Request not found
        const requestNotFound = new Error("Request not found.");
        requestNotFound.status = 404;
        next(requestNotFound);
      }
      // Success
      res.writeHead(204, {
        Location: "/"
      });
      res.end();
    } catch (error) {
      next(error);
    }
  });

// ROUTE - api/requests/accept/:requestId
// DELETE - Accept a request
router.delete(
  "/accept/:requestId",
  authenticateUser,
  async (req, res, next) => {
    try {
      // Get request
      const request = await Request.findByPk(req.params.requestId);

      // Got request?
      if (request) {
        const requesterId = request.dataValues.requesterId;
        const requesteeId = request.dataValues.requesteeId;

        // Get current authenticated user
        const userId = await req.currentUser.dataValues.userId;

        // AUTHORIZE
        // Is the user the requestee?
        if (userId === requesteeId) {
          // (Second query to request... could it be handled with one?)

          // TODO Is there a built-in method for
          // the below functions?

          // Object with bookIds
          const booksObject = await Request.findByPk(
            req.params.requestId,

            {
              // Removes extra info
              attributes: [],
              include: [
                // Give books
                {
                  model: Book,
                  as: "giveBooksRequest",
                  through: "give_books_requests",
                  attributes: ["bookId"],
                  // Removes extra join table info
                  through: { attributes: [] }
                },
                // Take books
                {
                  model: Book,
                  as: "takeBooksRequest",
                  through: "take_books_requests",
                  attributes: ["bookId"],
                  // Removes extra join table info
                  through: { attributes: [] }
                }
              ]
            }
          );

          // >> TRADE RECORD
          // Creates and saves new trade
          const trade = await Trade.create(request.dataValues);

          // Adds books (goes to join tables)
          trade.addGiveBooksTrade(booksObject.giveBooksRequest);
          trade.addTakeBooksTrade(booksObject.takeBooksRequest);

          // Gets trade ID
          const tradeId = trade.dataValues.tradeId;
          // << END TRADE RECORD

          // JSON with bookIds
          const booksJSON = booksObject.toJSON();

          // Array of Give bookId #s
          const booksGive = booksJSON.giveBooksRequest.map(book => {
            return book.bookId;
          });

          // Array of Take bookId #s
          const booksTake = booksJSON.takeBooksRequest.map(book => {
            return book.bookId;
          });

          // Array of combined bookId #s
          const booksArray = (() => {
            return [...booksGive, ...booksTake];
          })();

          // >> TRADE BOOKS
          // Requestee will now own 'give' books.
          Book.findAll({
            where: {
              bookId: {
                [Op.in]: booksGive
              }
            }
          }).then(books => {
            // 'books' is an array of books.
            books.forEach(book => {
              // Change ownership
              book.update({ ownerId: requesteeId });
            });
          });

          // Requesteer will now own 'take' books.
          Book.findAll({
            where: {
              bookId: {
                [Op.in]: booksTake
              }
            }
          }).then(books => {
            // 'books' is an array of books.
            books.forEach(book => {
              // Change ownership
              book.update({ ownerId: requesterId });
            });
          });
          // << END TRADE BOOKS

          // >> DESTROY RECORDS

          // Delete all requests with matching books

          // Note: Using "Request.destroy({...})" did
          // not work. There seemed to be some issue
          // with the join table:  "Unknown column
          // 'takeBooksRequest.bookId' in 'where clause'"

          // Get array of requests to destroy
          const requestsToDestroy = await Request.findAll({
            where: {
              [Op.or]: [
                {
                  "$takeBooksRequest.bookId$": {
                    [Op.in]: booksArray
                  }
                },
                {
                  "$giveBooksRequest.bookId$": {
                    [Op.in]: booksArray
                  }
                }
              ]
            },
            // This 'include' scope is for the current
            // return request.
            include: [
              {
                model: Book,
                as: "takeBooksRequest"
              },
              {
                model: Book,
                as: "giveBooksRequest"
              }
            ]
          });

          // Destroy requests
          requestsToDestroy.forEach(request => {
            request.destroy();
          });

          // << END DESTROY RECORDS
        } else {
          // Not authorized
          // Error: Forbidden
          const forbidden = new Error("Forbidden.");
          forbidden.status = 403;
          next(forbidden);
        }
      } else {
        // Error: Request not found
        const requestNotFound = new Error("Request not found.");
        requestNotFound.status = 404;
        next(requestNotFound);
      }
      // Success
      res.writeHead(204, {
        Location: "/"
      });
      res.end();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
