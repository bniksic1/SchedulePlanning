const Sequelize = require("sequelize");
const sequelize = require("../DB.js");

module.exports = function (sequelize, DataTypes) {
    const Tip = sequelize.define('tip', {
        naziv: Sequelize.STRING
    })
    return Tip;
}
