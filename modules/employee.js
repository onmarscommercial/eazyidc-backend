require('dotenv').config()
const mariadb = require('mariadb')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const eazy = require('./eazyidc')
const resMsg = require('./responseMessage')
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

async function addEmployee(username) {
  let db;
  try {
    db = await pool.getConnection()
    let getEmployee = await db.query("SELECT username from employee WHERE username LIKE?", [username])
  } catch (error) {
    
  } finally {
    if (db) db.release()
  }
}

async function editEmployee() {

}

async function deleteEmployee() {

}

async function getPackage() {
  let db;
  try {
    db = await pool.getConnection()
    let rows = await db.query("SELECT * from `package`")

    if (rows.length > 0) {
      let packageList = {
        package: []
      }

      for (let i = 0; i < rows.length; i++) {
        if (rows[i].status == 1) {
          packageList.package.push({
            packageId: rows[i].packageId,
            cpu_unit: rows[i].cpu_unit,
            memory_unit: rows[i].memory_unit,
            ssd_unit: rows[i].ssd_unit,
            transfer_unit: rows[i].transfer_unit,
            price: rows[i].price,
            status: rows[i].status,
          })
        }
      }

      return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage, packageList)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release()
  }
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
  getPackage,
  addPackage,
  editPackage,
  checkVerifyIdentity
}