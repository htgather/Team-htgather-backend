const userRouter = require('./users')
const roomRouter = require('./rooms')
const detailRouter = require('./details')
const statisticsRouter = require('./statistics')

const router = require('express').Router()

router.use(userRouter)
router.use(roomRouter)
router.use(detailRouter)
router.use(statisticsRouter)

module.exports = router
