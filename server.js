const { server } = require('./socket')
const port = process.env.PORT

server.listen(port, () => {
    console.log('http server on', port)
})
