const express = require('express')
const router = express.Router()
const authorization = require('../middlewares/auth-middleware.js')
const WorkOutTime = require('../models/workOutTime')
const User = require('../models/user')
const moment = require('moment')

// 운동 통계 자료
router.get('/myinfo/statistics', authorization, async (req, res) => {
    const { userId } = res.locals.user

    // 이번 주 운동 횟수 & 주간 목표
    const weekStart = moment().startOf('isoweek').toDate()
    const weekEnd = moment().endOf('isoweek').toDate()

    const recordsPerWeek = await WorkOutTime.find({
        userId,
        createdAt: {
            $gte: weekStart,
            $lte: weekEnd,
        },
    })

    const countPerWeek = recordsPerWeek.length

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

    const countDictEntries = Object.entries(dict).sort((a, b) => b[1] - a[1])
    const maxCount = countDictEntries[0][1]
    const mostExercised = countDictEntries
        .filter((x) => x[1] === maxCount)
        .map((x) => x[0])

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
        const pastStart = moment().startOf('day').subtract(day, 'days').toDate()
        const pastEnd = moment().endOf('day').subtract(day, 'days').toDate()
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
})

module.exports = router
