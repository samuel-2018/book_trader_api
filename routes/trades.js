const express = require("express");

const router = express.Router();

// Database access
const { db } = require("../models");
const { Book, Request, User, Trade } = db;

// Sequelize operators
const Sequelize = require("sequelize");
const { Op } = Sequelize;

// ========================================
// ROUTES
// ========================================

// ROUTE - api/trades
// GET - List of trades
router.get("/", async (req, res, next) => {
  try {
    const result = await Trade.findAll({
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
          as: "giveBooksTrade",
          through: "give_books_tradess",
          attributes: ["bookId", "title", "author", "createdAt"],
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
          as: "takeBooksTrade",
          through: "take_books_trades",
          attributes: ["bookId", "title", "author", "createdAt"],
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

module.exports = router;
