"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Books", {
      bookId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      author: {
        allowNull: false,
        type: Sequelize.STRING
      },
      genre: {
        type: Sequelize.STRING
      },
      year: {
        type: Sequelize.INTEGER
      },
      condition: {
        type: Sequelize.STRING
      },
      comments: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      ownerId: {
        type: Sequelize.INTEGER,
        references: {
          // Migrations does not seem to follow
          // the attribute naming conventions used in models.
          // In models, "Users" would be "User".
          // In models, "ownerId" would be "owner".
          // Migrations seems to be using the final attribute names
          // that would show in the database.
          model: "Users",
          key: "userId",
          as: "ownerId"
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Books");
  }
};
