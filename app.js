const express = require('express')
// const connect = require('./models')
const cors = require('cors')

const app = express()
const port = 4000
// connect()

// routers

app.use(cors()) // origin 추가
app.use(express.urlencoded())
app.use(express.json())

// routers 입력
// app.use('/api', [])

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

app.use((err, req, res, next) => {
    res.status(401).send({ errorMessage: err })
})

app.listen(port, () => {
    console.log(port, '포트로 서버가 요청 받을 준비가 됐습니다!')
})