const Sequelize = require("sequelize");
const sequelize = require("../DB.js");

module.exports = function (sequelize, DataTypes) {
    const Dan = sequelize.define('dan', {
        naziv: Sequelize.STRING
    })
    return Dan;
}
