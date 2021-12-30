require("dotenv").config()
process.env.TZ = 'Asia/Bangkok'

const path = require("path")

const express = require("express")

let compression = require("compression")
let helmet = require("helmet")

const app = express()
const cors = require("cors")

app.use(cors())
app.use(express.json())
app.use(compression())
app.use(helmet())

app.use(express.urlencoded({ extended: false }))

