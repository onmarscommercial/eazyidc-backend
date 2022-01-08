require('dotenv').config()
const express = require('express')
const router = express()
const account = require('../modules/account')
const auth = require('../middleware/auth')
const eazy = require('../modules/eazyidc')

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (email.length === 0 && password.length === 0) {
    return res.json(eazy.response(1, 'error', 'กรุณาระบุอีเมล์และรหัสผ่าน')) 
  } else if (email.length === 0 && password.length !== 0) {
    return res.json(eazy.response(1, 'error', 'กรุณาระบุอีเมล์')) 
  } else if (email.length !== 0 && password.length === 0) {
    return res.json(eazy.response(1, 'error', 'กรุณาระบุรหัสผ่าน')) 
  }
    
  res.json(await account.login(email, password))
})

router.post('/register', async (req, res) => {
  const { email, password, phone } = req.body

  res.json(await account.register(email, password, phone))
})

router.post('/change_pwd', auth, async (req, res) => {
  const { newPassword, verifyNewPassword } = req.body

  res.json(await account.changePWD(req.client.email, newPassword, verifyNewPassword))
})

module.exports = router