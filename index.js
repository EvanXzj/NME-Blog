'use strict'

const express = require('express'),
      package_json = require('./package.json'),
      port    = process.env.PORT || 3000,
      path    = require('path'),
      app     = express()

const session = require('express-session'),
      MongoStore = require('connect-mongo')(session),
      flash   = require('connect-flash'),
      config  = require('config-lite')


const routes = require('./routes/index')
//const userRouter  = require('./routes/user')

//推荐使用上面的方法(express.Router),见routes/user.js
// app.get('/', function(req, res) {
//   res.send('hello, express');
// })

// app.get('/user/:name', function(req, res) {
//   res.send('hello, ' + req.params.name)
// })

app.set('views',path.join(__dirname,'views'))               //设置视图文件目录
app.set('view engine','ejs')                                //设置视图引擎

app.use(express.static(path.join(__dirname,'public')))      // 设置静态文件目录

// session 中间件
app.use(session({
  name: config.session.key,     // 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true,                 // 强制更新 session
  saveUninitialized: false,     // 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({       // 将 session 存储到 mongodb
    url: config.mongodb         // mongodb 地址
  })
}))

app.use(flash())                // flash 中间件，用来显示通知

/* 在调用 res.render 的时候，express 合并（merge）了 3 处的结果后传入要渲染的模板，
*  优先级：res.render 传入的对象> res.locals 对象 > app.locals 对象，
*  所以 app.locals 和 res.locals 几乎没有区别，都用来渲染模板，
*  使用上的区别在于：app.locals 上通常挂载常量信息（如博客名、描述、作者信息），
** res.locals 上通常挂载变量信息，即每次请求可能的值都不一样（如请求者信息，res.locals.user = req.session.user）。*/

// 设置模板全局常量
app.locals.blog ={
    title:package_json.name,
    description:package_json.description
}
// 添加模板必需的三个变量(通知信息)
//这样在router中调用 res.render 的时候就不用传入这四个变量了，express 为我们自动 merge 并传入了模板
app.use((req,res,next)=>{
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString()
    res.locals.error = req.flash('error').toString()
    next()
})

// 路由
routes(app)
//app.use('/user',userRouter)

app.listen(port,() => {
    console.log(`${package_json.description} running at http://127.0.0.1:${port}`)
})

