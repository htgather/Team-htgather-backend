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
router.post('/rooms/exit/:roomId', authorization, async (req, res) => {
    const { roomId } = req.params
    try {
        await Room.findByIdAndUpdate(roomId, {
            $inc: { numberOfPeopleInRoom: -1 },
        })
        const existRoom = await Room.findById(roomId)
        if (existRoom.numberOfPeopleInRoom <= 0) {
            await Room.findByIdAndRemove(roomId)
            return res.status(200).json({ message: '방 삭제 됨' })
        }
        return res.status(200).json({ message: '운동 끝' })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
})

//방 목록 불러오기 (카테고리, 난이도별로 구분해서 보내주기)
router.get('/rooms', RoomController.confirmRoom.get)

module.exports = router
