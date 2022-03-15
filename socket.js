const app = require('./app')
const http = require('http')

const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        credentials: true,
    },
})

// 방 목록
let roomObjArr = [
    // {
    // 	roomName,
    // 	currentNum,
    // 	users: [
    // 		{
    // 			socketId,
    // 			nickname,
    // 		},
    // 	],
    // },
]
const MAXIMUM = 5

io.on('connection', (socket) => {
    let myRoomName = null
    let myNickname = null

    socket.on('join_room', (roomName, nickname) => {
        myRoomName = roomName
        myNickname = nickname

        let isRoomExist = false
        let targetRoomObj = null

        for (let i = 0; i < roomObjArr.length; i++) {
            // 같은 이름의 방 만들 수 없음
            if (roomObjArr[i].roomName === roomName) {
                // 정원 초과
                if (roomObjArr[i].currentNum >= MAXIMUM) {
                    console.log(
                        `${nickname}이 방 ${roomName}에 입장 실패 (정원 초과)`
                    )
                    socket.to(myRoomName).emit('exception')
                    socket.emit('reject_join')
                    return
                }
                // 방이 존재하면 그 방으로 들어감
                isRoomExist = true
                targetRoomObj = roomObjArr[i]
                break
            }
        }

        // 방이 존재하지 않는다면 방을 생성
        if (!isRoomExist) {
            targetRoomObj = {
                roomName,
                currentNum: 0,
                users: [],
            }
            roomObjArr.push(targetRoomObj)
        }

        // 어떠한 경우든 방에 참여
        targetRoomObj.users.push({
            socketId: socket.id,
            nickname,
        })
        targetRoomObj.currentNum++

        console.log(
            `${nickname}이 방 ${roomName}에 입장 (${targetRoomObj.currentNum}/${MAXIMUM})`
        )
        socket.join(roomName)
        socket.emit('accept_join', targetRoomObj.users, socket.id)
    })

    socket.on('ice', (ice, remoteSocketId) => {
        socket.to(remoteSocketId).emit('ice', ice, socket.id)
    })

    socket.on('offer', (offer, remoteSocketId, localNickname) => {
        socket.to(remoteSocketId).emit('offer', offer, socket.id, localNickname)
    })

    socket.on('answer', (answer, remoteSocketId) => {
        socket.to(remoteSocketId).emit('answer', answer, socket.id)
    })

    socket.on('disconnecting', () => {
        if (myNickname && myRoomName) {
            console.log(`${myNickname}이 방 ${myRoomName}에서 퇴장`)
        }
        socket.to(myRoomName).emit('leave_room', socket.id)

        let isRoomEmpty = false
        // 나가면서 방의 정보를 업데이트 해주고 나가기
        for (let i = 0; i < roomObjArr.length; i++) {
            if (roomObjArr[i].roomName === myRoomName) {
                const newUsers = roomObjArr[i].users.filter(
                    (user) => user.socketId !== socket.id
                )
                roomObjArr[i].users = newUsers
                roomObjArr[i].currentNum--
                console.log(
                    `방 ${myRoomName} (${roomObjArr[i].currentNum}/${MAXIMUM})`
                )
                if (roomObjArr[i].currentNum === 0) {
                    isRoomEmpty = true
                    console.log(`방 ${myRoomName} 삭제됨`)
                }
            }
        }
        if (isRoomEmpty) {
            const newRoomObjArr = roomObjArr.filter(
                (roomObj) => roomObj.currentNum !== 0
            )
            roomObjArr = newRoomObjArr
        }
    })

    socket.on('emoji', (roomNameFromClient, socketIdFromClient) => {
        socket.to(roomNameFromClient).emit('emoji', socketIdFromClient)
    })
})

module.exports = { server }
