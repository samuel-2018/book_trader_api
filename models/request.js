"use strict";
module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define(
    "Request",
    {
      requestId: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true
      }
    },
    {}
  );
  Request.associate = function(models) {
    // Books being traded.

    // Attributes on join table "giveBooksRequest":
    // bookId, requestId
    Request.belongsToMany(models.Book, {
      as: "giveBooksRequest",
      through: "give_books_requests",

      // source
      foreignKey: "requestId",

      // target (on join table)
      otherKey: "bookId",

      timestamps: false
    });

    // Attributes on join table "takeBooksRequest":
    // bookId, requestId
    Request.belongsToMany(models.Book, {
      as: "takeBooksRequest",
      through: "take_books_requests",

      // source
      foreignKey: "requestId",
      // target (on join table)
      otherKey: "bookId",
      // otherKey: "requestId",

      timestamps: false
    });

    // Since the below is not a many-to-many,
    // there is no join table for them.

    // Users who are trading.

    // requesterId
    Request.belongsTo(models.User, {
      as: "requester",
      // source
      foreignKey: "requesterId",
      // target
      targetKey: "userId"
    });

    // requesteeId
    Request.belongsTo(models.User, {
      as: "requestee",
      // source
      foreignKey: "requesteeId",
      // target
      targetKey: "userId"
    });
  };
  return Request;
};
