const User = require('../models/user')
const WorkOutTime = require('../models/workOutTime')
const moment = require('moment')

module.exports = {
    Statistics: {
        get: async (req, res) => {
            const { userId } = res.locals.user

            // 이번 주 운동 횟수 & 주간 목표
            const weekStart = moment().startOf('isoWeek').toDate()
            const weekEnd = moment().endOf('isoWeek').toDate()

            const recordsPerWeek = await WorkOutTime.find({
                userId,
                createdAt: {
                    $gte: weekStart,
                    $lte: weekEnd,
                },
            })

            const countPerWeek = new Set(
                recordsPerWeek.map((x) => x.createdAt.getDay())
            ).size

            const user = await User.findById(userId)
            const weeklyGoal = user.weeklyGoal

            // 가장 많이 한 운동 카테고리
            const records = await WorkOutTime.find({ userId })
            const categories = records.map((x) => x.category)

            const dict = {}
            for (const category of categories) {
                if (dict[category]) {
                    dict[category]++
                } else {
                    dict[category] = 1
                }
            }

            const countDictEntries = Object.entries(dict).sort(
                (a, b) => b[1] - a[1]
            )

            const images = {
                '근력 운동':
                    'https://user-images.githubusercontent.com/43710866/159020324-a0552667-1ef6-4715-8488-873846f26839.png',

                '유산소 운동':
                    'https://user-images.githubusercontent.com/43710866/159020345-157c24de-c788-49fe-974f-15b4cb65079c.png',

                스트레칭:
                    'https://user-images.githubusercontent.com/43710866/159020340-adb41759-5195-4f0b-982c-3131cb1626b4.png',

                '요가/필라테스':
                    'https://user-images.githubusercontent.com/43710866/159020109-1de7e36d-68bf-4aeb-a098-107983eebca6.png',

                기타: 'https://user-images.githubusercontent.com/43710866/159020335-0ab82fc9-99bd-44f9-95d6-df327ee5f530.png',
            }

            const mostExercised = countDictEntries.slice(0, 2).map((x) => {
                x.push(images[x[0]])
                return x
            })

            // 이번 주 총 운동 시간
            // const monthStart = moment().startOf('month').toDate()
            // const monthEnd = moment().endOf('month').toDate()

            // const recordsPerMonth = await WorkOutTime.find({
            //     userId,
            //     createdAt: {
            //         $gte: monthStart,
            //         $lte: monthEnd,
            //     },
            // })

            const totalTimePerWeek = recordsPerWeek
                .map((x) => x.workOutTime)
                .reduce((a, b) => a + b, 0)

            // 몇일 연속 운동 중
            // 오늘 운동 했으면 일단 카운트 +1
            // 하루씩 빼주면서 기록을 체크
            const dayStart = moment().startOf('day').toDate()
            const dayEnd = moment().endOf('day').toDate()
            let daysInARow = 0
            const recordsToday = await WorkOutTime.findOne({
                userId,
                createdAt: {
                    $gte: dayStart,
                    $lte: dayEnd,
                },
            })
            if (recordsToday) daysInARow++

            let day = 1
            while (true) {
                const pastStart = moment()
                    .startOf('day')
                    .subtract(day, 'days')
                    .toDate()
                const pastEnd = moment()
                    .endOf('day')
                    .subtract(day, 'days')
                    .toDate()
                const recordsPast = await WorkOutTime.findOne({
                    userId,
                    createdAt: {
                        $gte: pastStart,
                        $lte: pastEnd,
                    },
                })
                if (recordsPast) daysInARow++
                else break
                day++
            }

            res.json({
                countPerWeek,
                weeklyGoal,
                mostExercised,
                totalTimePerWeek,
                daysInARow,
            })
        },
    },
    Ranking: {
        get: async (req, res) => {
            try {
                // console.time('start Time') // 평균 30ms
                const { userId } = res.locals.user
                const weekStart = moment().startOf('isoweek').toDate()
                const weekEnd = moment().endOf('isoweek').toDate()
                let isMe = false
                const users = await User.find({})
                const zeroCount = await User.findById(userId)
                const zeroUser = ['-', `${zeroCount.nickName}`, 0, true]
                const recordsPerWeek = await WorkOutTime.find({
                    createdAt: {
                        $gte: weekStart,
                        $lte: weekEnd,
                    },
                })
                const countUsers = recordsPerWeek.map((x) => x.userId)
                const usersNickname = users.map((x) => [x.userId, x.nickName])
                const result = {}
                countUsers.forEach((x) => {
                    result[x] = (result[x] || 0) + 1
                })

                let objcnt = Object.entries(result).sort((a, b) => b[1] - a[1])

                // 본인 랭킹 찾기
                let arrRank = []
                for (let i = 0; i < objcnt.length; i++) {
                    arrRank.push([i + 1, objcnt[i][0], objcnt[i][1], isMe])
                    if (arrRank[i][1] === userId) arrRank[i][3] = true
                }

                let myRank
                for (let i = 0; i < arrRank.length; i++) {
                    if (arrRank[i][3] === true) myRank = arrRank[i]
                }

                // 닉네임 추가
                for (let i = 0; i < usersNickname.length; i++) {
                    for (let j = 0; j < arrRank.length; j++) {
                        if (usersNickname[i][0] === arrRank[j][1])
                            arrRank[j][1] = usersNickname[i][1]
                    }
                }

                let userRankArr = []
                for (let i = 0; i < arrRank.length; i++) {
                    if (arrRank[i][0] <= 5) userRankArr.push(arrRank[i])
                }

                if (userRankArr.length > 4) {
                    if (
                        userRankArr[0][3] === false &&
                        userRankArr[1][3] === false &&
                        userRankArr[2][3] === false &&
                        userRankArr[3][3] === false &&
                        userRankArr[4][3] === false &&
                        myRank !== undefined
                    ) {
                        userRankArr.pop()
                        userRankArr.push(myRank)
                    } else if (myRank === undefined) {
                        userRankArr.pop()
                        userRankArr.push(zeroUser)
                    }
                } else {
                    userRankArr.push(zeroUser)
                }

                let trueCnt = 0
                for (let i = 0; i < userRankArr.length; i++) {
                    if (userRankArr[i][3] === true) trueCnt++
                }

                if (trueCnt > 1) userRankArr.pop()

                const ranking = []
                for (let i = 0; i < userRankArr.length; i++) {
                    ranking.push({
                        rank: userRankArr[i][0],
                        nickName: userRankArr[i][1],
                        countPerWeek: userRankArr[i][2],
                        isMe: userRankArr[i][3],
                    })
                }

                res.status(200).json({ ranking })
                // console.timeEnd('start Time')
            } catch (err) {
                console.log(err)
                return res.status(400).json({ message: err.message })
            }
        },
    },
}
