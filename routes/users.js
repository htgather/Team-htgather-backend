const express = require('express')
const router = express.Router()
const authorization = require('../middlewares/auth-middleware')
// controllers
const UserController = require('../controllers/userController')

// 소셜로그인 - 로그인 또는 회원가입
router.post('/users/auth', UserController.CreateUser.post)

// 회원 정보 수정
router.patch('/users', authorization, UserController.Usermodification.patch)

module.exports = router
