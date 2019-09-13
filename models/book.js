"use strict";
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    "Book",
    {
      bookId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
    Book.belongsTo(models.User, { as: "owner" });
  };
  return Book;
};
