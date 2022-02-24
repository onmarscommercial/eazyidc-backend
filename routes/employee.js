require('dotenv').config()
const express = require('express')
const router = express()

router.get('/test', async (req, res) => {
  res.status(200).send({ message: "hi" })
})

router.post('/login', async (req, res) => {

})

router.post('/add-employee', async (req, res) => {

})

router.post('/edit-employee', async (req, res) => {
  
})

router.post('/delete-employee', async (req, res) => {
  
})

router.post('/add-package', async (req, res) => {

})

router.post('/edit-package', async (req, res) => {

})

router.post('/check-verify-identity', async (req, res) => {

})

module.exports = router