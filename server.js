const { server } = require('./socket')
const port = 4000

server.listen(port, () => {
    console.log('http server on', port)
})