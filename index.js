'use strict'

const express = require('express'),
      package_json = require('./package.json'),
      port    = process.env.PORT || 3000,
      app     = express()

const indexRouter = require('./routes/index')
const userRouter  = require('./routes/user')

//推荐使用上面的方法(express.Router),见routes/user.js
// app.get('/', function(req, res) {
//   res.send('hello, express');
// })

// app.get('/user/:name', function(req, res) {
//   res.send('hello, ' + req.params.name)
// })

app.use('/',indexRouter)
app.use('/user',userRouter)

app.listen(port,() => {
    console.log(`${package_json.description} running at http://127.0.0.1:${port}`)
})

