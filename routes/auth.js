const express = require('express')
const router = express.Router()
const passport = require('passport')
const KakaoStrategy = require('passport-kakao').Strategy
const User = require('../models/users')
const jwt = require('jsonwebtoken')
const res = require('express/lib/response')

passport.use(
    'kakao-login',
    new KakaoStrategy(
        {
            clientID: 'aa8217c943973196abf8dfd06871ba5e',
            callbackURL: 'http://localhost:4000/auth/kakao/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            // console.log(accessToken)
            // console.log(profile)

            const existUser = await User.findOne({ snsId: profile.id })
            if (existUser) {
                done(null, existUser)
            } else {
                const nickName = profile.username
                const newUser = new User({ nickName, snsId: profile.id })
                await newUser.save()
                done(null, newUser)
            }
        }
    )
)

router.get('/kakao', passport.authenticate('kakao-login'))

router.get('/auth/kakao/callback', (req, res, next) => {
    passport.authenticate(
        'kakao-login',
        {
            failureRedirect: '/',
        },
        (err, user, info) => {
            if (err) return next(err)
            const { nickName } = user
            const token = jwt.sign({ nickName }, 'work-out-at-home-secret-key')
            res.json({ token })
        }
    )(req, res, next)
})

module.exports = router
