"use strict";
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    "Book",
    {
      bookId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Please provide a title." }
        }
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Please provide the author's name." }
        }
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: true
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "The year must be an integer." }
        }
      },
      condition: {
        type: DataTypes.STRING,
        allowNull: true
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {}
  );
  Book.associate = function(models) {
    // Attribute: ownerId
    Book.belongsTo(models.User, { as: "owner", foreignKey: "ownerId" });
    // Note: The above inclusion of the foreign
    // key is needed or Sequelize will become
    // confused as to what to use for the
    // column name.

    // REQUEST TABLE

    Book.belongsToMany(models.Request, {
      as: "giveBooksRequest",
      through: "give_books_requests",
      // source
      foreignKey: "bookId",
      // target (on join table)
      otherKey: "requestId",
      timestamps: false
    });

    Book.belongsToMany(models.Request, {
      as: "takeBooksRequest",
      through: "take_books_requests",

      // source
      foreignKey: "bookId",
      //>>>>>>>>
      // target (on join table)
      otherKey: "requestId",
      // otherKey: "bookId",

      timestamps: false
    });

    // TRADE TABLE

    Book.belongsToMany(models.Trade, {
      as: "giveBooksTrade",
      through: "give_books_trades",
      // source
      foreignKey: "bookId",

      // target (on join table)
      otherKey: "tradeId",
      timestamps: false
    });

    Book.belongsToMany(models.Trade, {
      as: "takeBooksTrade",
      through: "take_books_trades",
      // source
      foreignKey: "bookId",

      // target (on join table)
      otherKey: "tradeId",
      timestamps: false
    });
  };
  return Book;
};
