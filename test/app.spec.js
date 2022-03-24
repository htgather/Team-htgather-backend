const app = require('../app')
const request = require('supertest')
const chai = require('chai')
const expect = chai.expect
const User = require('../models/user')
const WorkOutTime = require('../models/workOutTime')
const Room = require('../models/room')
const moment = require('moment')
let token
let userId

describe('유저 정보 테스트', async () => {
    afterEach(async () => {
        await User.deleteOne({ snsId: 123 })
        token = null
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

// 두 날짜 사이의 랜덤 날짜 생성 함수
function randomDate(start, end) {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    )
}

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
        await WorkOutTime.deleteMany({ userId })
        token = null
        userId = null
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
    })

    it('내가 일주일에 몇 일 운동했는지 알 수 있다.', async () => {
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

        expect(response.status).equal(200)
        expect(response.body.countPerWeek === countPerWeek).equal(true)
    })

    it('내가 가장 많이 한 2개 이하의 운동 카테고리 이름, 횟수, 이미지 url을 불러올 수 있다.', async () => {
        await WorkOutTime.create({ userId, category: '근력 운동' })
        await WorkOutTime.create({ userId, category: '근력 운동' })
        await WorkOutTime.create({ userId, category: '근력 운동' })
        await WorkOutTime.create({ userId, category: '유산소 운동' })
        await WorkOutTime.create({ userId, category: '유산소 운동' })
        await WorkOutTime.create({ userId, category: '요가/필라테스' })

        const response = await request(app)
            .get('/myinfo/statistics')
            .set('Authorization', 'Bearer ' + token)

        expect(response.status).equal(200)
        expect(response.body.mostExercised.map((x) => x[0])[0]).equal(
            '근력 운동'
        )
        expect(response.body.mostExercised.map((x) => x[0])[1]).equal(
            '유산소 운동'
        )
    })

    it('내가 이번 주에 한 총 운동 시간을 알 수 있다.', async () => {
        const weekStart = moment().startOf('isoWeek').toDate()

        for (let i = 0; i < 5; i++) {
            await WorkOutTime.create({
                userId,
                workOutTime: 30,
                createdAt: randomDate(weekStart, new Date()),
            })
        }

        const response = await request(app)
            .get('/myinfo/statistics')
            .set('Authorization', 'Bearer ' + token)

        expect(response.status).equal(200)
        expect(response.body.totalTimePerWeek).equal(150)
    })

    it('오늘 운동하지 않은 경우 내가 연속으로 몇 일 운동했는지 알 수 있다.', async () => {
        for (let day = 1; day <= 4; day++) {
            const pastStart = moment()
                .startOf('day')
                .subtract(day, 'days')
                .toDate()
            const pastEnd = moment().endOf('day').subtract(day, 'days').toDate()
            await WorkOutTime.create({
                userId,
                createdAt: randomDate(pastStart, pastEnd),
            })
        }

        const response = await request(app)
            .get('/myinfo/statistics')
            .set('Authorization', 'Bearer ' + token)

        expect(response.status).equal(200)
        expect(response.body.daysInARow).equal(4)
    })

    it('오늘 운동한 경우 내가 연속으로 몇 일 운동했는지 알 수 있다.', async () => {
        for (let day = 0; day <= 4; day++) {
            const pastStart = moment()
                .startOf('day')
                .subtract(day, 'days')
                .toDate()
            const pastEnd = moment().endOf('day').subtract(day, 'days').toDate()
            await WorkOutTime.create({
                userId,
                createdAt: randomDate(pastStart, pastEnd),
            })
        }

        const response = await request(app)
            .get('/myinfo/statistics')
            .set('Authorization', 'Bearer ' + token)

        expect(response.status).equal(200)
        expect(response.body.daysInARow).equal(5)
    })

    it('내 기록을 포함한 랭킹 목록을 불러올 수 있다.', async () => {
        const response = await request(app)
            .get('/myinfo/ranking')
            .set('Authorization', 'Bearer ' + token)

        expect(response.status).equal(200)
        expect(
            response.body.ranking.filter((x) => x.isMe === true).length > 0
        ).equal(true)
    })

    it('달력 API 요청 시 내가 운동한 날짜들로 이루어진 array를 받는다.', async () => {
        await WorkOutTime.create({ userId, createdAt: new Date('2022-02-22') })
        await WorkOutTime.create({ userId, createdAt: new Date('2022-01-19') })
        await WorkOutTime.create({ userId, createdAt: new Date('2022-03-05') })

        const response = await request(app)
            .get('/myinfo/calendar')
            .set('Authorization', 'Bearer ' + token)

        expect(response.status).equal(200)
        expect(response.body.dates).eql(['2022-2-22', '2022-1-19', '2022-3-5'])
    })
})

describe('운동 방 테스트', async () => {
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
        await Room.deleteMany({ creator: 'abc' })
        token = null
        userId = null
    })

    it('필수 데이터를 모두 입력하면 방이 생성된다.', async () => {
        const response = await request(app)
            .post('/rooms')
            .set('Authorization', 'Bearer ' + token)
            .send({
                roomTitle: '방 제목',
                videoThumbnail: '썸네일 url',
                videoLength: 30,
                videoUrl: '비디오 url',
                videoTitle: '비디오 제목',
                videoStartAfter: 1,
                category: '근력 운동',
                difficulty: '고급',
            })
        expect(response.status).equal(201)
    })

    it('필수 데이터를 모두 입력하지 않으면 방이 생성되지 않는다.', async () => {
        const response = await request(app)
            .post('/rooms')
            .set('Authorization', 'Bearer ' + token)
            .send({
                videoThumbnail: '썸네일 url',
                videoLength: 30,
                videoUrl: '비디오 url',
                videoTitle: '비디오 제목',
                videoStartAfter: 1,
                category: '근력 운동',
                difficulty: '고급',
            })
        expect(response.status).equal(400)
    })

    it('해당하는 방이 DB에 있으면 입장할 수 있다.', async () => {
        const newRoom = await Room.create({ creator: 'abc' })
        const roomId = newRoom.roomId

        const response = await request(app)
            .post(`/rooms/${roomId}`)
            .set('Authorization', 'Bearer ' + token)

        expect(response.status).equal(201)
    })

    it('이미 운동이 시작된 방에는 입장할 수 없다.', async () => {
        const newRoom = await Room.create({
            creator: 'abc',
            createdAt: moment().subtract(30, 'minutes').toDate(),
            videoStartAfter: 10,
        })
        const roomId = newRoom.roomId

        const response = await request(app)
            .post(`/rooms/${roomId}`)
            .set('Authorization', 'Bearer ' + token)

        expect(response.body.message).equal('이미 운동이 시작되었습니다.')
    })

    it('5명 이상이 있는 방에는 입장할 수 없다.', async () => {
        const newRoom = await Room.create({
            creator: 'abc',
            numberOfPeopleInRoom: 5,
        })
        const roomId = newRoom.roomId

        const response = await request(app)
            .post(`/rooms/${roomId}`)
            .set('Authorization', 'Bearer ' + token)

        expect(response.body.message).equal('입장불가, 5명 초과')
    })

    it('카테고리와 difficulty에 따라 방 목록을 불러온다.', async () => {
        await Room.create({
            creator: 'abc',
            category: '카테고리A',
            difficulty: '난이도A',
        })
        await Room.create({
            creator: 'abc',
            category: '카테고리B',
            difficulty: '난이도B',
        })
        await Room.create({
            creator: 'abc',
            category: '카테고리B',
            difficulty: '난이도A',
        })
        await Room.create({
            creator: 'abc',
            category: '카테고리A',
            difficulty: '난이도B',
        })
        const responseAll = await request(app).get('/rooms')
        const responseCategory = await request(app)
            .get('/rooms')
            .query({ category: '카테고리A' })
        const responseDifficulty = await request(app)
            .get('/rooms')
            .query({ difficulty: '난이도A' })

        expect(
            responseAll.body.rooms.filter((x) => x.creator === 'abc').length
        ).equal(4)
        expect(
            Array.from(
                new Set(responseCategory.body.rooms.map((x) => x.category))
            )[0]
        ).equal('카테고리A')
        expect(
            Array.from(
                new Set(responseDifficulty.body.rooms.map((x) => x.difficulty))
            )[0]
        ).equal('난이도A')
    })

    it('이미 운동이 시작된 방의 isStart는 true, 아직 시작하지 않은 방의 isStart는 false이다.', async () => {
        await Room.create({
            creator: 'abc',
            roomTitle: '이미 운동이 시작된 방',
            createdAt: moment().subtract(30, 'minutes').toDate(),
            videoStartAfter: 10,
        })
        await Room.create({
            creator: 'abc',
            roomTitle: '아직 시작하지 않은 방',
            createdAt: moment().subtract(30, 'minutes').toDate(),
            videoStartAfter: 40,
        })
        const response = await request(app).get('/rooms')
        expect(
            response.body.rooms.filter(
                (x) =>
                    x.creator === 'abc' &&
                    x.roomTitle === '이미 운동이 시작된 방'
            )[0].isStart
        ).equal(true)
        expect(
            response.body.rooms.filter(
                (x) =>
                    x.creator === 'abc' &&
                    x.roomTitle === '아직 시작하지 않은 방'
            )[0].isStart
        ).equal(false)
    })
})
