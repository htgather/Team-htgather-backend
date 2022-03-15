const express = require('express')
const router = express.Router()
const authorization = require('../middlewares/auth-middleware.js')
// controllers
const StatisticsController = require('../controllers/statisticsController')

// 운동 통계 자료
router.get('/myinfo/statistics', authorization, StatisticsController.Statistics.get)

// 랭킹
router.get('/myinfo/ranking', authorization, StatisticsController.Ranking.get)

module.exports = router
