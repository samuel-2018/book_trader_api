// 'Authorization' header field parser
const auth = require("basic-auth");

// Hashed password checker
const bcryptjs = require("bcryptjs");

// Database access
const { db } = require("../models");

const { User } = db;

// Error: Authentication Failed
const error401 = new Error("Authentication Failed.");
error401.status = 401;

// Note: Must use async/await.

const authenticateUser = async (req, res, next) => {
  // console.log("req: ", req);

  // username and password
  const credentials = auth(req);

  // Got credentials?
  if (credentials) {
    try {
      // Get user
      const user = await User.findOne({
        where: { username: credentials.name },
        attributes: { exclude: ["createdAt", "updatedAt"] }
      });

      // Got password from database?
      if (user && user.password) {
        // Check password
        const authenticated = bcryptjs.compareSync(
          credentials.pass,
          user.password
        );

        // Got authenticated?
        if (authenticated) {
          // Remove password from user data.
          delete user.dataValues.password;

          // Stores the authenticated user on req.
          // All middleware will have access to it.
          req.currentUser = user;
          next();
        } else {
          return next(error401);
        }
      } else {
        return next(error401);
      }
    } catch (error) {
      return next(error);
    }
  } else {
    return next(error401);
  }
};

module.exports = authenticateUser;
