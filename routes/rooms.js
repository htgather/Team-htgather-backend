const express = require('express')
const Room = require('../models/room')
const User = require('../models/user')
const router = express.Router()
const authorization = require('../middlewares/auth-middleware')

// 방 만들기
router.post('/rooms', authorization, async (req, res) => {
    try {
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
            return res
                .status(400)
                .json({ message: '글자 수 제한을 초과했습니다.' })
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
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
})

// 방 입장
router.post('/rooms/:roomId', authorization, async (req, res) => {
    const { roomId } = req.params
    const existroom = await Room.findById(roomId)
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
        return res.status(201).json({ message: '입장 완료' })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
})

//방 나가기
router.post('/rooms/exit/:roomId', authorization, async (req, res) => {
    const { roomId } = req.params
    try {
        await Room.findOneAndUpdate(
            { roomId: roomId },
            { $inc: { numberOfPeopleInRoom: -1 } }
        )
        const existRoom = await Room.findById(roomId)
        if (!existRoom.numberOfPeopleInRoom) {
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
router.get('/rooms', async (req, res) => {
    try {
        const category = req.query.category
        const difficulty = req.query.difficulty

        let rooms = await Room.find({})

        if (category) {
            rooms = rooms.filter((x) => x.category === category)
        }

        if (difficulty) {
            rooms = rooms.filter((x) => x.difficulty === difficulty)
        }
        res.json({ rooms })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
})

module.exports = router
