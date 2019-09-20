"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      userId: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Please provide your first name." }
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Please provide your last name." }
        }
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Please provide a username." }
        },
        unique: {
          msg:
            "That username is already associated with an account. Please choose another username."
        }
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Please provide your country" }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Please provide a password." }
        }
      },
      email: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING
    },
    {}
  );
  User.associate = function(models) {
    // Note: Defining the assocation on both models
    // is required to add or retrieve data.

    User.hasMany(models.Book, {
      foreignKey: "ownerId"
    });

    // Note on defining assocations:

    // The 'has' side has its key as
    // the target key.

    // The 'belongs' side has its key as
    // the foreign key.

    // 'source' and 'target' are different
    // for each side of the assocation.

    // The model the function is being
    // invoked on is the 'source.'

    // The model that is passed as the
    // argument is the 'target.'

    User.hasMany(models.Request, {
      as: "requester",
      // source
      targetKey: "userId",
      // target
      foreignKey: "requesterId"
    });

    User.hasMany(models.Request, {
      as: "requestee",
      // source
      targetKey: "userId",
      // target
      foreignKey: "requesteeId"
    });
  };
  return User;
};
