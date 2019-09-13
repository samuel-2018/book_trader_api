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

    // Attribute: giveBooksId
    Request.belongsToMany(models.Book, {
      as: "giveBooks",
      through: "giveBooks_requests"
    });

    // Attribute: takeBooksId
    Request.belongsToMany(models.Book, {
      as: "takeBooks",
      through: "takeBooks_requests"
    });

    // Users who are trading.

    // requesterId
    Request.belongsTo(models.User, {
      as: "requester"
    });

    // requesteeId
    Request.belongsTo(models.User, {
      as: "requestee"
    });
  };
  return Request;
};
