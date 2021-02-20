const Sequelize = require("sequelize");
const sequelize = require("../DB.js");

module.exports = function (sequelize, DataTypes) {
    const Student = sequelize.define('student', {
        ime: Sequelize.STRING,
        index: Sequelize.STRING
    })
    return Student;
}
