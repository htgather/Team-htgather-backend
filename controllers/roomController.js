const Room = require('../models/room')
const User = require('../models/user')
const moment = require('moment')
moment.locale('ko')

module.exports = {
    CreateRoom: {
        post: async (req, res) => {
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
                    return res
                        .status(400)
                        .json({ message: '정확히 입력해주세요!' })
                }

                if (roomTitle.length > 50) {
                    return res
                        .status(400)
                        .json({ message: '글자 수 제한을 초과했습니다.' })
                }
                const numberOfPeopleInRoom = 1

                const videoStartAt = moment()
                    .add(videoStartAfter, 'm')
                    .calendar()
                    .substring(3)

                const roomInfo = await Room.create({
                    creator,
                    roomTitle,
                    videoThumbnail,
                    videoLength,
                    videoUrl,
                    videoTitle,
                    videoStartAfter,
                    videoStartAt,
                    category,
                    difficulty,
                    numberOfPeopleInRoom,
                })

                res.status(201).json({ roomInfo })
            } catch (err) {
                console.log(err)
                return res.status(400).json({ message: err.message })
            }
        },
    },
    EnterRoom: {
        post: async (req, res) => {
            const { roomId } = req.params
            const existroom = await Room.findById(roomId)

            // 시간에 따른 방 입장 가능 여부 조사
            const createdAt = existroom.createdAt
            const videoStartAfter = existroom.videoStartAfter
            const now = Date.now()
            const videoStart = createdAt.getTime() + videoStartAfter * 60000

            try {
                if (!existroom)
                    return res.status(400).json({
                        message: '존재하지 않는 방입니다.',
                    })

                if (now > videoStart) {
                    return res.status(400).json({
                        message: '이미 운동이 시작되었습니다.',
                    })
                }

                if (existroom.numberOfPeopleInRoom >= 5) {
                    return res.status(400).json({
                        message: '입장불가, 5명 초과',
                    })
                }
                await Room.findByIdAndUpdate(roomId, {
                    $inc: { numberOfPeopleInRoom: 1 },
                })
                return res.status(201).json({ message: '입장 완료' })
            } catch (err) {
                console.log(err)
                return res.status(400).json({ message: err.message })
            }
        },
    },
    ExitRoom: {
        post: async (req, res) => {
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
        },
    },
    confirmRoom: {
        get: async (req, res) => {
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

                const now = Date.now()
                rooms = rooms.map((room) => {
                    const createdAt = room.createdAt
                    const videoStartAfter = room.videoStartAfter
                    const videoStart =
                        createdAt.getTime() + videoStartAfter * 60000
                    const isStart = now > videoStart
                    room.isStart = isStart
                    return room
                })
                res.json({ rooms })
            } catch (err) {
                console.log(err)
                return res.status(400).json({ message: err.message })
            }
        },
    },
}
