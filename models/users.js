'use strict'

const User = require('./lib/mongo.js').User

module.exports =   {
    //新建一个用户
    create:(user) => {
        return User.create(user).exec()
    }
}