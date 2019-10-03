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

    // Attributes on join table "giveBooksTrade":
    // bookId, tradeId
    Trade.belongsToMany(models.Book, {
      as: "giveBooksTrade",
      through: "give_books_trades",

      // source
      foreignKey: "tradeId",

      // target (on join table)
      otherKey: "bookId",

      timestamps: false
    });

    // Attributes on join table "takeBooksTrade":
    // bookId, tradeId
    Trade.belongsToMany(models.Book, {
      as: "takeBooksTrade",
      through: "take_books_trades",

      // source
      foreignKey: "tradeId",

      // target (on join table)
      otherKey: "bookId",

      timestamps: false
    });

    // Since the below is not a many-to-many,
    // there is no join table for them.

    // Users who traded.

    // requesterId
    Trade.belongsTo(models.User, {
      as: "requester",
      // source
      foreignKey: "requesterId",
      // target
      targetKey: "userId"
    });

    // requesteeId
    Trade.belongsTo(models.User, {
      as: "requestee",
      // source
      foreignKey: "requesteeId",
      // target
      targetKey: "userId"
    });
  };
  return Trade;
};
