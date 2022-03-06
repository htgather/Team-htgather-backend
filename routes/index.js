const authRouter = require('./auth')

const router = require('express').Router()

router.use(authRouter)

module.exports = router
