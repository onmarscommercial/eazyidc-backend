require('dotenv').config()
const express = require('express')
const router = express()
const account = require('../modules/account')
const auth = require('../middleware/auth')
const eazy = require('../modules/eazyidc')
const requestIp = require("request-ip")
const multer = require("multer")

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  var clientIp = requestIp.getClientIp(req)

  if (email.length === 0 && password.length === 0) {
    return res.json(eazy.response(1, 'error', 'กรุณาระบุอีเมล์และรหัสผ่าน')) 
  } else if (email.length === 0 && password.length !== 0) {
    return res.json(eazy.response(1, 'error', 'กรุณาระบุอีเมล์')) 
  } else if (email.length !== 0 && password.length === 0) {
    return res.json(eazy.response(1, 'error', 'กรุณาระบุรหัสผ่าน')) 
  }
    
  res.json(await account.login(email, password, clientIp))
})

router.post('/register', async (req, res) => {
  const { email, password, phone, firstname, lastname, customerType, companyName, taxId } = req.body

  res.json(await account.register(email, password, phone, firstname, lastname, customerType, companyName, taxId))
})

router.post('/change_pwd', auth, async (req, res) => {
  const { newPassword, verifyNewPassword } = req.body

  res.json(await account.changePWD(req.client.email, newPassword, verifyNewPassword))
})

router.get('/balance', auth, async (req, res) => {
  res.json(await account.getBalance(req.client.email))
})

router.post('/create-server', auth, async (req, res) => {
  const { osType, osVersion, ssdType, packageId, hostName, userName, password } = req.body

  res.json(await account.createServer(req.client.email, osType, osVersion, ssdType, packageId, hostName, userName, password))
})

router.get('/server', auth, async (req, res) => {
  res.json(await account.getServer(req.client.email))
})

router.get('/server-detail/:serverId', auth, async (req, res) => {
  res.json(await account.getServerDetail(req.params.serverId))
})

router.get('/package', auth, async (req, res) => {
  res.json(await account.getPackage())
})

router.post('/package-type', auth, async (req, res) => {
  const { ssdType } = req.body
  res.json(await account.getPackage(ssdType))
})

router.get('/user-status', auth, async (req, res) => {
  res.json(await account.getUserStatus(req.client.email))
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/verifydoc/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const upload = multer({storage: storage})

router.post('/verify-identity', upload.single("file"), async (req, res) => {
  const { email } = req.body
  const { path } = req.file 

  res.json(await account.verifyIdentity(email, path))
})

router.post('/open-server', auth, async (req, res) => {
  const { serverId } = req.body

  res.json(await account.openServer(serverId))
})

router.post('/shutdown-server', auth, async (req, res) => {
  const { serverId } = req.body

  res.json(await account.shutdownServer(serverId))
})

router.post('/restart-server', auth, async (req, res) => {

})

router.post('/console-server', auth, async (req, res) => {

})

router.post('/delete-server', auth, async (req, res) => {
  const { serverId } = req.body

  res.json(await account.deleteServer(serverId))
})

router.post('/report-problem', auth, async (req, res) => {
  const { accountId, subject, detail } = req.body

  res.json(await account.reportProblem(accountId, subject, detail))
})

module.exports = router