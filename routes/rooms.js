const express = require('express')
const router = express.Router()
const authorization = require('../middlewares/auth-middleware')
// controllers
const RoomController = require('../controllers/roomController')

// 방 만들기
router.post('/rooms', authorization, RoomController.CreateRoom.post)

// 방 입장
router.post('/rooms/:roomId', authorization, RoomController.EnterRoom.post)

//방 나가기
// router.post('/rooms/exit/:roomId', authorization, RoomController.ExitRoom.post)

//방 목록 불러오기 (카테고리, 난이도별로 구분해서 보내주기)
router.get('/rooms', RoomController.confirmRoom.get)

module.exports = router
