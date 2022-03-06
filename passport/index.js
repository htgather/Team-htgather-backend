const express = require('express')
const router = express.Router()
const passport = require('passport')
const KakaoStrategy = require('passport-kakao').Strategy

passport.use(
    'kakao-login',
    new KakaoStrategy(
        {
            clientID: 'aa8217c943973196abf8dfd06871ba5e',
            callbackURL: 'http://localhost:4000',
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log(accessToken)
            console.log(profile)
        }
    )
)

router.get('/kakao', passport.authenticate('kakao'))

router.get(
    '/kakao/callback',
    passport.authenticate('kakao', {
        failureRedirect: '/',
    }),
    (req, res) => {
        res.redirect('/')
    }
)

module.exports = router
