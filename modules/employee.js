require('dotenv').config()
const mariadb = require('mariadb')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const saltRounds = 10

const pool = mariadb.createPool({
  host: process.env.db_host,
  user: process.env.db_username,
  password: process.env.db_password,
  database: process.env.db_database,
  connectionLimit: 10
})

async function login() {

}

async function addEmployee() {

}

async function editEmployee() {

}

async function deleteEmployee() {

}

async function addPackage() {

}

async function editPackage() {

}

async function checkVerifyIdentity() {

}

module.exports = {
  login,
  addEmployee,
  editEmployee,
  deleteEmployee,
  addPackage,
  editPackage,
  checkVerifyIdentity
}