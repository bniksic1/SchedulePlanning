const Sequelize = require("sequelize");
const sequelize = require("../DB.js");

module.exports = function (sequelize, DataTypes) {
    const Grupa = sequelize.define('grupa', {
        naziv: Sequelize.STRING
    })
    return Grupa;
}
