const app = require('../app')
const request = require('supertest')
const chai = require('chai')
const expect = chai.expect
const User = require('../models/user')
const WorkOutTime = require('../models/workOutTime')
const moment = require('moment')
let token
let userId

describe('유저 정보 테스트', async () => {
    afterEach(async () => {
        await User.deleteOne({ snsId: 123 })
        token = undefined
    })

    it('snsId와 nickName을 입력하고, DB에 snsId에 해당하는 회원이 없으면 회원가입한다.', async () => {
        await User.deleteOne({ snsId: 123 })
        const response = await request(app).post('/users/auth').send({
            snsId: 123,
            nickName: 'abc',
        })
        const existUser = await User.findOne({ snsId: 123 })
        expect(existUser).to.exist
        expect(response.status).equal(200)
    })

    it('snsId와 nickName을 입력하고, DB에 snsId에 해당하는 회원이 있으면 로그인한다.', async () => {
        await User.create({ snsId: 123, nickName: 'abc' })
        const response = await request(app).post('/users/auth').send({
            snsId: 123,
            nickName: 'abc',
        })
        expect(response.status).equal(200)
    })

    it('nickName과 weeklyGoal을 입력하면 회원 정보가 수정된다.', async () => {
        token = (
            await request(app).post('/users/auth').send({
                snsId: 123,
                nickName: 'abc',
            })
        ).body.token

        const response = await request(app)
            .patch('/users')
            .set('Authorization', 'Bearer ' + token)
            .send({
                nickName: 'modified',
                weeklyGoal: 5,
            })
        expect(response.status).equal(200)
        const existUser = await User.findOne({ snsId: 123 })
        expect(existUser.nickName).equal('modified')
        expect(existUser.weeklyGoal).equal(5)
    })
})

describe('운동 기록 테스트', () => {
    beforeEach(async () => {
        const response = await request(app).post('/users/auth').send({
            snsId: 123,
            nickName: 'abc',
        })
        token = response.body.token
        const existUser = await User.findOne({ snsId: 123 })
        userId = existUser.userId
    })

    afterEach(async () => {
        await User.deleteOne({ snsId: 123 })
        token = undefined
        userId = undefined
    })

    it('운동 기록에는 userId, workOutTime, category가 기록된다.', async () => {
        const response = await request(app)
            .post('/myinfo/records')
            .set('Authorization', 'Bearer ' + token)
            .send({
                workOutTime: 30,
                category: '요가',
            })
        expect(response.status).equal(200)
        const oneRecord = await WorkOutTime.findOne({ userId })
        expect(oneRecord.workOutTime).equal(30)
        expect(oneRecord.category).equal('요가')
        await WorkOutTime.deleteOne({ userId })
    })

    it('내가 일주일에 몇 일 운동했는지 알 수 있다.', async () => {
        // 두 날짜 사이의 랜덤 날짜 생성 함수
        function randomDate(start, end) {
            return new Date(
                start.getTime() +
                    Math.random() * (end.getTime() - start.getTime())
            )
        }

        const weekStart = moment().startOf('isoWeek').toDate()

        // 5개의 랜덤 데이터
        const recordsDays = []
        for (let i = 0; i < 5; i++) {
            const record = await WorkOutTime.create({
                userId,
                createdAt: randomDate(weekStart, new Date()),
            })
            recordsDays.push(record.createdAt.getDay())
        }

        const countPerWeek = new Set(recordsDays).size

        const response = await request(app)
            .get('/myinfo/statistics')
            .set('Authorization', 'Bearer ' + token)

        await WorkOutTime.deleteMany({ userId })
        
        expect(response.body.countPerWeek === countPerWeek).equal(true)
    })
})
