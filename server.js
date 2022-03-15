const { server } = require('./socket')
const port = process.env.PORT

server.listen(port, () => {
    console.log('http server on', port, 'CI/CD 적용 테스트!')
})
