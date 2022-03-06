const userRouter = require('./users')
const roomRouter = require('./rooms')
const detailRouter = require('./details')

const router = require('express').Router()

router.use(userRouter)
router.use(roomRouter)
router.use(detailRouter)

module.exports = router
