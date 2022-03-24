let mediaStatus = {
    // roomname: {
    //     abc123: {
    //         screensaver: null,
    //         muted: null,
    //     },
    // },
}

const roomNameFromClient = 'roomname'
const socketIdFromClient1 = 'abc123'
const socketIdFromClient2 = 'cde456'
const check1 = true
const check2 = true

// mediaStatus[roomNameFromClient][socketIdFromClient]['screensaver'] = check

if (!mediaStatus[roomNameFromClient]) {
    mediaStatus[roomNameFromClient] = {}
}

mediaStatus[roomNameFromClient][socketIdFromClient1] = {
    screensaver: false,
    muted: false,
}

mediaStatus[roomNameFromClient][socketIdFromClient2] = {
    screensaver: false,
    muted: false,
}

mediaStatus[roomNameFromClient][socketIdFromClient1].muted = check1

// delete mediaStatus[roomNameFromClient]

console.log(mediaStatus)

// build TEST