const express = require('express')
const connect = require('./models')
const cors = require('cors')
const routers = require('./routes')
require('dotenv').config()
// 개발 환경에서는 사용할 필요가 없으므로 배포 환경일 때만 적용하면 됨
// hpp:HTTP 매개변수 오염 공격으로부터 보호하는 Express 미들웨어
// const helmet = require('helmet');
// const hpp = require('hpp');

const app = express()
connect()

// app.use(helmet())
// app.use(hpp())
app.use(cors()) // origin 추가
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Request log
app.use((req, res, next) => {
    if (req.originalUrl === '/') return next()
    console.log(
        'Request URL:',
        `[${req.method}]`,
        req.originalUrl,
        ' - ',
        new Date().toLocaleString(),
        req.ip
    )
    next()
})

app.use(routers)

// 클라이언트에 error 내용 전송
app.use((err, req, res, next) => {
    res.status(400).send({ errorMessage: err })
})

module.exports = app
