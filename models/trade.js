"use strict";
module.exports = (sequelize, DataTypes) => {
  const Trade = sequelize.define(
    "Trade",
    {
      tradeId: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true
      }
    },
    {}
  );
  Trade.associate = function(models) {
    // Books traded.

    // Attribute: giveBooksId
    Trade.belongsToMany(models.Book, {
      as: "giveBooks",
      through: "giveBooks_trades"
    });

    // Attribute: takeBooksId
    Trade.belongsToMany(models.Book, {
      as: "takeBooks",
      through: "takeBooks_trades"
    });

    // Users who traded.

    // requesterId
    Trade.belongsTo(models.User, {
      as: "requester"
    });

    // requesteeId
    Trade.belongsTo(models.User, {
      as: "requestee"
    });
  };
  return Trade;
};
