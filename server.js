require("dotenv").config()
process.env.TZ = 'Asia/Bangkok'

const path = require("path")

const express = require("express")
const eazy = require('./modules/eazyidc')

let compression = require("compression")
let helmet = require("helmet")

const app = express()
const cors = require("cors")

app.use(cors())
app.use(express.json())
app.use(compression())
app.use(helmet())

app.use(express.urlencoded({ extended: true }))

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/account', require('./routes/account'))

app.listen(process.env.port, () => eazy.log(`backend running on port ${process.env.port}`))

eazy.createDirectory('./logs')
eazy.createDirectory('./cache')