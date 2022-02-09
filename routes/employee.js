require('dotenv').config()
const express = require('express')
const router = express()

router.get('/test', async (req, res) => {
  res.status(200).send({ message: "hi" })
})

module.exports = router