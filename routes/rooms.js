const express = require('express')
const Room = require('../models/room')
const User = require('../models/user')
const router = express.Router()
const authorization = require('../middlewares/auth-middleware')

// 방 만들기
router.post('/rooms', authorization, async (req, res) => {
    const { nickName } = res.locals.user
    const creator = nickName

    const {
        roomTitle,
        videoThumbnail,
        videoLength,
        videoUrl,
        videoTitle,
        videoStartAfter,
        category,
        difficulty,
    } = req.body

    if (
        !(
            roomTitle &&
            videoThumbnail &&
            videoLength &&
            videoUrl &&
            videoTitle &&
            videoStartAfter &&
            category &&
            difficulty
        )
    ) {
        return res.status(400).json({ message: '정확히 입력해주세요!' })
    }

    if (roomTitle.length > 50) {
        return res.status(400).json({ message: '글자 수 제한을 초과했습니다.' })
    }
    const numberOfPeopleInRoom = 1
    await Room.create({
        creator,
        roomTitle,
        videoThumbnail,
        videoLength,
        videoUrl,
        videoTitle,
        videoStartAfter,
        category,
        difficulty,
        numberOfPeopleInRoom,
    })

    res.status(201).json({ message: '방 만들기 성공' })
})

// 방 입장
router.post('/rooms/:roomId', authorization, async (req, res) => {
    const { roomId } = req.params
    const { userId } = res.locals.user
    const existroom = await Room.findOne({ roomId })
    const user = await User.findOne({ userId })
    try {
        if (!existroom)
            return res.status(400).json({
                message: '존재하지 않는 방입니다.',
            })

        if (existroom.numberOfPeopleInRoom >= 5) {
            return res.status(400).json({
                message: '입장불가, 5명 초과',
            })
        }
        await Room.findOneAndUpdate(
            { roomId: roomId },
            { $inc: { numberOfPeopleInRoom: 1 } }
        )
        // await PersonInRoom.create({ userId, roomId, nick }); ---> 새로운 스키마가 생길때
        return res.status(201).json({ message: '입장 완료' })
    } catch (err) {
        res.status(400).json({
            message: '방 입장에 실패하였습니다.',
        })
    }
})

//방 나가기
router.post('/rooms/exit/:roomId', authorization, async (req, res) => {
    const { roomId } = req.params
    const existRoom = await Room.findOne({ roomId })
    try {
        await Room.findOneAndUpdate(
            { roomId: roomId },
            { $inc: { numberOfPeopleInRoom: -1 } }
        )
        if (!existRoom.numberOfPeopleInRoom) {
            return await Room.deleteOne({ roomId })
        }
        // await PersonInRoom.create({ userId, roomId, nick }); ---> 새로운 스키마가 생길때
        return res.status(201).json({ message: '운동 끝' })
    } catch (err) {
        res.status(400).json({
            message:
                '방 나가기에 실패하였습니다.' /* ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ */,
        })
    }
})

//방 목록 불러오기 (카테고리, 난이도별로 구분해서 보내주기)
router.get('/rooms', async (req, res) => {
    const category = req.query.category
    const difficulty = req.query.difficulty

    let rooms = await Room.find({})

    if (category) {
        rooms = rooms.filter((x) => x.category === category)
    }

    if (difficulty) {
        rooms = rooms.filter((x) => x.difficulty === difficulty)
    }

    //프론트에서 원하는 방식으로 가공해서 보내줘야 함 (날짜부분??).
    res.json({ rooms })
})

module.exports = router
