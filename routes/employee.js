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

})

router.get('/employee', async (req, res) => {

})

router.post('/add-employee', async (req, res) => {

})

router.post('/edit-employee', async (req, res) => {
  
})

router.post('/delete-employee', async (req, res) => {
  
})

router.get('/package', async (req, res) => {
  res.json(await employee.getPackage())
})

router.post('/add-package', async (req, res) => {

})

router.post('/edit-package', async (req, res) => {

})

router.post('/check-verify-identity', async (req, res) => {

})

module.exports = router