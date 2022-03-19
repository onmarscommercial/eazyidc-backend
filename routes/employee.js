require('dotenv').config()
const express = require('express')
const router = express()
const employee = require('../modules/employee')
const auth = require('../middleware/auth')
const eazy = require('../modules/eazyidc')

router.get('/test', async (req, res) => {
  res.status(200).send({ message: "hi" })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  res.json(await employee.login(username, password))
})

router.get('/employee', auth, async (req, res) => {
  res.json(await employee.getEmployee())
})

router.post('/add-employee', auth, async (req, res) => {
  const { createdBy, username, password, firstname, lastname, roleId, status } = req.body

  res.json(await employee.addEmployee(createdBy, username, password, firstname, lastname, roleId, status))
})

router.post('/edit-employee', async (req, res) => {
  
})

router.post('/delete-employee', async (req, res) => {
  
})

router.get('/package', auth, async (req, res) => {
  res.json(await employee.getPackage())
})

router.post('/add-package', async (req, res) => {

})

router.post('/edit-package', async (req, res) => {

})

router.post('/check-verify-identity', async (req, res) => {

})

module.exports = router