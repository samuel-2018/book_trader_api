const express = require("express");

const router = express.Router();

// Sanitization middleware
const { body, param } = require("express-validator");

// Database access
const { db } = require("../models");
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

  body(["title", "author", "genre", "year", "condition", "comments"])
    // Removes leading and trailing whitespace
    .trim(),
  param(["bookId"])
    // Removes leading and trailing whitespace
    .trim()
    // Converts to number or NaN.
    .toInt()
]);

// ROUTE - api/books
router
  .route("/")

  // GET - List of books
  .get(async (req, res, next) => {
    try {
      const result = await Book.findAll({
        // Excludes books owned by 'Archive' (userId 1)
        where: {
          ownerId: {
            [Op.ne]: 1
          }
        },
        attributes: ["bookId", "title", "author", "ownerId"],
        include: [
          // Includes the book owner's username and location
          {
            model: User,
            as: "owner",
            attributes: ["username", "country", "state", "city"]
          },

          // Requests for book
          {
            model: Request,
            as: "takeBooksRequest",
            attributes: ["requestId", "requesterId"],

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
        ]
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  })

  // POST - Create a book
  .post(authenticateUser, async (req, res, next) => {
    try {
      // Get current authenticated user
      const userId = await req.currentUser.dataValues.userId;

      // IMPORTANT: This prevents a user from saving data to someone else's account.
      req.body.ownerId = userId;

      console.log("req.body: ", req.body);

      // Creates and saves new book
      const book = await Book.create(req.body);

      // Gets book ID
      const bookId = book.dataValues.bookId;

      res.writeHead(201, {
        // URI for the course
        Location: `/api/books/${bookId}`
      });
      // Return new bookId
      res.end(JSON.stringify({ bookId }));
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

// ROUTE - api/books/owner/:ownerId
// GET - List of books from one user
router.get("/owner/:ownerId", async (req, res, next) => {
  try {
    const result = await Book.findAll({
      //
      where: { ownerId: req.params.ownerId },

      attributes: ["bookId", "title", "author", "ownerId"],
      include: [
        // Includes the book owner's username and location
        {
          model: User,
          as: "owner",
          attributes: ["username", "country", "state", "city"]
        },

        // Requests for book
        {
          model: Request,
          as: "takeBooksRequest",
          attributes: ["requestId", "requesterId"],

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
      ]
    });

    if (result.length) {
      // Returns list
      res.status(200).json(result);
    } else {
      // Error: Books not found
      const booksNotFound = new Error("Books not found.");
      booksNotFound.status = 404;
      next(booksNotFound);
    }
  } catch (error) {
    next(error);
  }
});

// ROUTE - api/books/:bookId
router
  .route("/:bookId")

  // GET - One book (details)
  .get(async (req, res, next) => {
    try {
      const result = await Book.findByPk(req.params.bookId, {
        attributes: { exclude: ["updatedAt"] },
        // Includes the book owner's username and location
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["username", "country", "state", "city"]
          }
        ]
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  })

  // DELETE - One book
  .delete(authenticateUser, async (req, res, next) => {
    try {
      // Get book
      const book = await Book.findByPk(req.params.bookId);

      // Got book?
      if (book) {
        // Get book owner
        const ownerId = await book.dataValues.ownerId;

        // Get current authenticated user
        const userId = await req.currentUser.dataValues.userId;

        // AUTHORIZE
        // Is this the owner of the book?
        if (ownerId === userId) {
          // Note: Deleting a book requires some cleanup.
          // All Requests need deleted that mention the book.
          // (Otherwise, the book would simply disappear from the request.)
          // Also, if the book is mentioned in a trade record,
          // it can't be deleted. Instead, ownership needs to
          // be changed to 'Archive.'
          // (Otherwise, the book would simply disappear from the trade record.)

          // >> DESTROY REQUEST RECORDS

          // Delete all requests with matching books

          // Get array of requests to destroy
          const requestsToDestroy = await Request.findAll({
            where: {
              [Op.or]: [
                {
                  "$takeBooksRequest.bookId$": req.params.bookId
                },
                {
                  "$giveBooksRequest.bookId$": req.params.bookId
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

          // << END DESTROY REQUEST RECORDS

          // >> DELETE BOOK OR CHANGE OWNERSHIP TO ARCHIVE

          // Look for trade records that include this book
          const tradeRecordsWithBook = await Trade.findAll({
            where: {
              [Op.or]: [
                {
                  "$takeBooksTrade.bookId$": req.params.bookId
                },
                {
                  "$giveBooksTrade.bookId$": req.params.bookId
                }
              ]
            },
            // This 'include' scope is for the current
            // return request.
            include: [
              {
                model: Book,
                as: "takeBooksTrade"
              },
              {
                model: Book,
                as: "giveBooksTrade"
              }
            ]
          });

          // No trade records with matching bookId.
          // Safe to delete.
          if (tradeRecordsWithBook.length === 0) {
            console.log(" No trade records with matching bookId");
            // Delete
            await book.destroy();
          } else {
            console.log("There are trade records with matching bookId.");
            // There are trade records with matching bookId.
            // Don't delete.
            // Change ownership of book to Archive.
            await book.update({ ownerId: 1 });
          }
          // << END DELETE BOOK OR CHANGE OWNERSHIP TO ARCHIVE
        } else {
          // Not owner
          // Error: Forbidden
          const forbidden = new Error("Forbidden.");
          forbidden.status = 403;
          next(forbidden);
        }
      } else {
        // Error: Book not found
        const bookNotFound = new Error("Book not found.");
        bookNotFound.status = 404;
        next(bookNotFound);
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

// ROUTE - api/books/query/:queryArray
// GET - List of books
router.get("/query/:queryList", async (req, res, next) => {
  try {
    // Converts the text into an array
    const queryArray = req.params.queryList.split(",");
    const queryArryInt = queryArray.map(char => {
      return parseInt(char);
    });

    const result = await Book.findAll({
      where: { bookId: { [Op.in]: queryArryInt } },

      attributes: ["bookId", "title", "author", "ownerId"],
      include: [
        // Includes the book owner's username and location
        {
          model: User,
          as: "owner",
          attributes: ["username", "country", "state", "city"]
        },

        // Requests for book
        {
          model: Request,
          as: "takeBooksRequest",
          attributes: ["requestId", "requesterId"],

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
      ]
    });

    if (result) {
      // Returns list
      res.status(200).json(result);
    } else {
      // Error: Books not found
      const booksNotFound = new Error("Books not found.");
      booksNotFound.status = 404;
      next(booksNotFound);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
