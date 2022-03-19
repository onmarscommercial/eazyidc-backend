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

async function login(username, password) {
  let db;
  try {
    db = await pool.getConnection()
    let rows = await db.query("SELECT * FROM `employee` WHERE username LIKE ?;", [ username ])
    if (rows.length === 1) {
      let verify = bcrypt.compareSync(password, rows[0].password.replace(/^\$2y(.+)$/i, '\$2b$1'))
      if (verify === true) {
        const accessToken = jwt.sign({ username: rows[0].username }, process.env.jwt_key, { expiresIn: "30m" })

        //const date = new Date()

        let result = {
          profile: {
            employeeId: rows[0].employeeId,
            username: rows[0].username,
            firstname: rows[0].firstname, 
            lastname: rows[0].lastname,
            roleId: rows[0].roleId,
            login: true
          },
          accessToken: accessToken
        }

        return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.loginSuccess, result)
      } else {
        return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorEmpLogin)
      }
    } else {
      return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorEmpLogin)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorEmpLogin)
  } finally {
    if (db) db.release()
  }
}

async function getEmployee() {
  let db;
  try {
    db = await pool.getConnection();
    let rows = await db.query("SELECT * FROM `employee`")
    if (rows.length > 0) {
      let empList = {
        emp: []
      }

      for (let i = 0; i < rows.length; i++) {
        if (rows[i].roleId != 1) {
          empList.emp.push({
            employeeId: rows[i].employeeId,
            roleId: rows[i].roleId,
            username: rows[i].username,
            password: rows[i].password,
            firstname: rows[i].firstname,
            lastname: rows[i].lastname,
            status: rows[i].status,
            createdBy: rows[i].createdBy,
            createdAt: eazy.formatDate(rows[i].createdAt) 
          })
        }
      }

      return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage, empList)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release();
  }
}

async function addEmployee(employeeId, username, password, firstname, lastname, roleId, status) {
  let db;
  try {
    db = await pool.getConnection()
    let getEmp = await db.query("SELECT username from employee WHERE username LIKE ?", [username])
    if (getEmp.length > 0) {
      return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorUsernameRegister)
    } else {
      let pwd = bcrypt.hashSync(password, saltRounds)
      let rows = await db.query("INSERT INTO `employee`(`employeeId`, `roleId`, `username`, `password`, `firstname`, `lastname`, `status`) VALUES (?,?,?,?,?,?,?);", ['', roleId, username, pwd, firstname, lastname, status])
      if (rows) {
        let employee = await db.query("SELECT * FROM `employee` WHERE username LIKE ?;", [username])
        if (employee.length === 1) {
          let update = await db.query("UPDATE `employee` SET createdBy = ?, createdAt = ? WHERE `username` LIKE ?;", [employeeId, eazy.getDate(), username])
          if (update.affectedRows === 1) {
            return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage)
          } else {
            return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorMessage)
          }
        }
      }
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorMessage)
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
            ssd_type: rows[i].ssd_type,
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
  getEmployee,
  addEmployee,
  editEmployee,
  deleteEmployee,
  getPackage,
  addPackage,
  editPackage,
  checkVerifyIdentity
}