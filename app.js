const express = require('express')
// const connect = require('./models')
const cors = require('cors')

const app = express()
// const routers = require('./routes')
// connect()

app.use(cors()) // origin 추가
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// app.use('/api', routers)

// Request log
app.use((req, res, next) => {
    console.log(
        'Request URL:',
        `[${req.method}]`,
        req.originalUrl,
        ' - ',
        new Date().toLocaleString()
    )
    next()
})

// 클라이언트에 error 내용 전송
app.use((err, req, res, next) => {
    res.status(400).send({ errorMessage: err })
})

module.exports = app