const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { JWT_KEY } = process.env

module.exports = (req, res, next) => {
    const { authorization } = req.headers
    const [authType, authToken] = (authorization || '').split(' ')
    if (!authToken || authType !== 'Bearer') {
        return res.status(401).json({
            message: '로그인 후 이용 가능한 기능입니다.',
        })
    }
    try {
        const { userId } = jwt.verify(authToken, JWT_KEY)
        User.findOne({ userId }).then((user) => {
            res.locals.user = user
            next()
        })
    } catch (err) {
        res.status(401).json({
            message: '로그인 후 이용 가능한 기능입니다.',
        })
    }
}
