require('dotenv').config()
const jwt = require('jsonwebtoken')
const eazy = require('../modules/eazyidc')

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.jwt_key, (err, user) => {
      if (err) {
        if (err.name = "TokenExpiredError") {
          return res.json(eazy.response(1, 'error', 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง'))
        }
        return res.json(eazy.response(1, 'error', err.message))
      }
      req.client = user
      next()
    })
  } else {
    res.sendStatus(401)
  }
}