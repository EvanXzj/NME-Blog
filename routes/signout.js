'use strict'

const express = require('express')
const router  = express.Router()

const checkLogin = require('../middlewares/check').checkLogin

// GET /signout 登出
router.get('/', checkLogin, (req, res, next) => {
  res.send(req.flash())
})

module.exports = router