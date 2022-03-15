const express = require('express')
const router = express.Router()
const authorization = require('../middlewares/auth-middleware.js')
// controllers
const DetailController = require('../controllers/detailController')

// 운동 시간 기록
router.post('/myinfo/records', authorization, DetailController.TimeRecord.post)

// 달력 내용 전달
router.get('/myinfo/calendar', authorization,DetailController.Calendar.get)

module.exports = router
