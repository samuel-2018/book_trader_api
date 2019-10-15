// Enables hashing of passwords
const bcryptjs = require("bcryptjs");

const express = require("express");

const router = express.Router();

// Sanitization middleware
const { body } = require("express-validator");

// Database access
const { db } = require("../models");
const { User } = db;

// Authentication
const authenticateUser = require("../helpers/authenticateUser");

// Sequelize operators
const Sequelize = require("sequelize");
const { Op } = Sequelize;

// ========================================
// ROUTES
// ========================================

// TODO convert username to lowercase
// NOTE: it is already case insensitive for getting user for auth. So, don't convert to lowercase.

// ALL ROUTES: MODIFY USER INPUT
router.use([
  // (".escape()" will mutate data: <, >, &, ', " and /.)
  // The client side must assume that all data is unsafe.

  body("email")
    // Removes leading and trailing whitespace
    .trim()
    // Sanitizes
    .escape()
    // Converts email to lowercase
    .normalizeEmail(),

  // Removes leading and trailing whitespace
  body(["firstName", "lastName", "password", "country", "state", "city"]).trim()
]);

// ROUTE - api/users/all
// GET - List of users
router.get("/all", async (req, res, next) => {
  try {
    const result = await User.findAll({
      // Excludes 'Archive' (userId 1)
      where: {
        userId: {
          [Op.ne]: 1
        }
      },
      attributes: { exclude: ["createdAt", "updatedAt", "password", "email"] }
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// ROUTE - api/users
router
  .route("/")

  // GET - Current authenticated user
  .get(authenticateUser, async (req, res, next) => {
    try {
      const user = await req.currentUser;
      res.json(user);
    } catch (error) {
      next(error);
    }
  })

  // POST - New user
  .post(async (req, res, next) => {
    try {
      // Builds user
      const newUser = await User.build(req.body);

      // Validation needs to be called manually,
      // because it is not automatically run on 'build.'
      // And the password field MUST be validated before
      // bcryptjs is run.
      await newUser.validate();

      // Hashes password
      newUser.password = await bcryptjs.hashSync(newUser.password);

      // Saves user
      await newUser.save(req.body);

      res.writeHead(201, {
        Location: "/"
      });
      res.end();
    } catch (error) {
      // Catches validation errors sent from Sequelize
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        // Bad Request
        // msg assigned by Sequelize
        error.status = 400;
      }
      next(error);
    }
  });

// ROUTE - api/users/:userId

router
  .route("/:userId")
  // GET - One user (profile)
  .get(async (req, res, next) => {
    try {
      const result = await User.findByPk(req.params.userId, {
        attributes: { exclude: ["createdAt", "updatedAt", "password", "email"] }
      });
      if (result) {
        // Returns user profile
        res.status(200).json(result);
      } else {
        // Error: User not found
        const userNotFound = new Error("User not found.");
        userNotFound.status = 404;
        next(userNotFound);
      }
    } catch (error) {
      next(error);
    }
  })

  // PUT - Updates user (profile)
  .put(authenticateUser, async (req, res, next) => {
    try {
      // Get current authenticated user
      const userId = await req.currentUser.dataValues.userId;

      // Do the authenticated user id and parm id match?
      // (This check could be skipped, but it seems more
      // thorough and consistent to also have the param id
      // in the url and then check it.)
      if (parseInt(req.params.userId) === userId) {
        // Gets user instance
        const userInstance = await User.findByPk(req.params.userId);

        // Note: Sequalize 'update' doesn't reliably validate.
        // User needs 'built' and then manually validated
        // before calling update.

        // Builds updated user with client sent data
        const updatedUser = await User.build(req.body);
        // Validates manually.
        await updatedUser.validate();

        // Hashes password
        req.body.password = await bcryptjs.hashSync(req.body.password);

        // Update
        await userInstance.update(req.body);
        // Success
        res.status(204).end();
      } else {
        // Error: Forbidden
        const forbidden = new Error("Forbidden.");
        forbidden.status = 403;
        next(forbidden);
      }
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
