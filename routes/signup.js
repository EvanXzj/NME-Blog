'use strict'
const path = require('path'),
      fs   = require('fs'),
      sha1 = require('sha1'),
      util = require('util')

const express = require('express')
const router  = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /signup 注册页
router.get('/', checkNotLogin, (req, res, next)=> {
  res.render('signup')
})

// POST /signup 用户注册
router.post('/', checkNotLogin, (req, res, next)=> {
  let name    = req.fields.name,
      gender  = req.fields.gender,
      bio     = req.fields.bio,
      avatar  = req.files.avatar.path.split(path.sep).pop(),
      password = req.fields.password,
      repassword = req.fields.repassword
  
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('名字请限制在 1-10 个字符')
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('性别只能是 m、f 或 x')
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('个人简介请限制在 1-30 个字符')
    }
    if (!req.files.avatar.name) {
      throw new Error('缺少头像')
    }
    if (password.length < 6) {
      throw new Error('密码至少 6 个字符')
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致')
    }
  } catch (e) {
    // 注册失败，异步删除上传的头像
    fs.unlink(req.files.avatar.path)

    req.flash('error',e.message)
    return res.redirect('/signup')
  }
    //密码明文加密
    password = sha1(password)

    let user = {
      name:name,
      password:password,
      bio:bio,
      avatar:avatar,
      gender:gender 
    }

    // 用户信息写入数据库
    UserModel.create(user).then((result)=>{
        // 此 user 是插入 mongodb 后的值，包含 _id
        user = result.ops[0]
        delete user.password
        req.session.user = user

        req.flash('success','注册成功！')
        return res.redirect('/posts')
    }).catch((e)=>{
        // 注册失败，异步删除上传的头像
        fs.unlink(req.files.avatar.path)
        // 用户名被占用则跳回注册页，而不是错误页
        if (e.message.match('E11000 duplicate key')) {
            req.flash('error','用户名已存在！')
            return res.redirect('/signup')
        }
        next(e)
    })
})

module.exports = router