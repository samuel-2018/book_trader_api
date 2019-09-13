"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Requests", {
      requestId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      giveBooksId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Books",
          key: "bookId",
          as: "giveBooksId",
          through: "giveBooks_requests"
        }
      },
      takeBooksId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Books",
          key: "bookId",
          as: "takeBooksId",
          through: "takeBooks_requests"
        }
      },
      requesterId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "userId",
          key: "userId",
          as: "requesterId"
        }
      },
      requesteeId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "userId",
          as: "requesteeId"
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Requests");
  }
};
