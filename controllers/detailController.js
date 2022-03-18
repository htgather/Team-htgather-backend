const WorkOutTime = require('../models/workOutTime')

module.exports = {
    TimeRecord: {
        post: async (req, res) => {
            const { userId } = res.locals.user
            const { workOutTime, category } = req.body
            await WorkOutTime.create({ userId, workOutTime, category })

            res.json({ message: '운동시간 기록 성공' })
        },
    },
    Calendar: {
        get: async (req, res) => {
            const { userId } = res.locals.user

            // const year = new Date().getFullYear
            // const month = new Date().getMonth
            // const lastDay = new Date()
            //해당 월의 마지막 일 넣기
            // const calendar = await WorkOutTimes.find({"date": {$gte: ISODate(year + month + "-01T00:00:00.000Z"), $lte: ISODate(year + month + "-31T00:00:00.000Z")}, {userId : user.userId}})

            let dates = await WorkOutTime.find({ userId })
            dates = Array.from(
                new Set(
                    dates.map(
                        (x) =>
                            `${x.createdAt.getFullYear()}-${
                                x.createdAt.getMonth() + 1
                            }-${x.createdAt.getDate()}`
                    )
                )
            )

            //프론트에서 원하느 방식으로 가공해서 보내줘야 함.
            res.json({ dates })
        },
    },
}
