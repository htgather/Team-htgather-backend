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
                    'https://www.bodybuilding.com/images/2016/may/how-and-why-to-do-push-ups-tablet-960x540.jpg',

                '유산소 운동':
                    'https://betterme.world/articles/wp-content/uploads/2020/08/shutterstock_1125657476-scaled.jpg',

                스트레칭:
                    'https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/10/shutterstock_657588133_header-1024x575.jpg?w=1155&h=1528',

                '요가/필라테스':
                    'https://www.yogabasics.com/yogabasics2017/wp-content/uploads/2021/03/Ashtanga-Yoga.jpeg',

                기타: 'https://ae01.alicdn.com/kf/H3a8bfac042554ceb9512bcbcc6e7967dy/all-koa-acoustic-guitar-koa-acoustic-electric-guitar-handmade-all-real-abalone-classical-acoustic-guitar-free.jpg_Q90.jpg_.webp',
            }

            const mostExercised = countDictEntries.slice(0, 2).map((x) => {
                x.push(images[x[0]])
                return x
            })

            // 이번 달 총 운동 시간
            const monthStart = moment().startOf('month').toDate()
            const monthEnd = moment().endOf('month').toDate()

            const recordsPerMonth = await WorkOutTime.find({
                userId,
                createdAt: {
                    $gte: monthStart,
                    $lte: monthEnd,
                },
            })

            const totalTimePerMonth = recordsPerMonth
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
                totalTimePerMonth,
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
