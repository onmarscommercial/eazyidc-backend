require('dotenv').config()
const mariadb = require('mariadb')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const eazy = require('./eazyidc')
const resMsg = require('./responseMessage');
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

async function addEmployee(createdBy, username, password, firstname, lastname, roleId, status) {
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
          let update = await db.query("UPDATE `employee` SET createdBy = ?, createdAt = ? WHERE `username` LIKE ?;", [createdBy, eazy.getDate(), username])
          if (update.affectedRows === 1) {
            return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.SubmitDataSuccess)
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
        packageList.package.push({
          packageId: rows[i].packageId,
          packageCode: rows[i].packageCode,
          cpu_unit: rows[i].cpu_unit,
          memory_unit: rows[i].memory_unit,
          ssd_unit: rows[i].ssd_unit,
          transfer_unit: rows[i].transfer_unit,
          price: rows[i].price,
          ssd_type: rows[i].ssd_type,
          amount: rows[i].amount,
          status: rows[i].status,
        })
      }

      return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage, packageList)
    } else {
      let packageList = {
        package: []
      }

      return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage, packageList)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release()
  }
}

async function addPackage(packageCode, cpu_unit, memory_unit, ssd_unit, transfer_unit, price, ssd_type, amount, status, createdBy) {
  let db;
  try {
    db = await pool.getConnection()
    let rows = await db.query("INSERT INTO `package`(`packageId`, `packageCode`, `cpu_unit`, `memory_unit`, `ssd_unit`, `transfer_unit`, `price`, `ssd_type`, `amount`, `status`, `createdBy`, `createdAt`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);", ['', packageCode, cpu_unit, memory_unit, ssd_unit, transfer_unit, price, ssd_type, amount, status, createdBy, eazy.getDate()])
    if (rows) {
      return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.SubmitDataSuccess)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorMessage)
  } finally {
    if (db) db.release()
  }
}

async function getEditPackage(packageId) {
  let db;
  try {
    db = await pool.getConnection()
    let rows = await db.query("SELECT * FROM `package` WHERE packageId LIKE ?;", [packageId])
    if (rows.length === 1) {
      let result = {
        package: {
          packageId: rows[0].packageId,
          packageCode: rows[0].packageCode,
          cpu_unit: rows[0].cpu_unit,
          memory_unit: rows[0].memory_unit,
          ssd_unit: rows[0].ssd_unit,
          transfer_unit: rows[0].transfer_unit,
          price: rows[0].price,
          ssd_type: rows[0].ssd_type,
          amount: rows[0].amount,
          status: rows[0].status,
        }
      }

      return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage, result)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release()
  }
}

async function editPackage(packageId, cpu_unit, memory_unit, ssd_unit, transfer_unit, price, ssd_type, amount, status, updatedBy) {
  let db;
  try {
    db = await pool.getConnection()
    let edit = await db.query("UPDATE `package` SET cpu_unit = ?, memory_unit = ?, ssd_unit = ?, transfer_unit = ?, price = ?, ssd_type = ?, amount = ?, status = ?, updatedBy = ?, updatedAt = ? WHERE `packageId` LIKE ?;", [cpu_unit, memory_unit, ssd_unit, transfer_unit, price, ssd_type, amount, status, updatedBy, eazy.getDate(), packageId])
    if (edit.affectedRows === 1) {
      return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.EditDataSuccess)
    } else {
      return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorMessage)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release()
  }
}

async function getCustomer() {
  let db;
  try {
    db = await pool.getConnection()
    //let rows = await db.query("SELECT * FROM `account` a JOIN `file_identity` f ON a.accountId = f.accountId;")
    let rows = await db.query(`SELECT a.accountId AS accountId, 
                                      a.email AS email, 
                                      a.password AS password, 
                                      a.phone AS phone, 
                                      a.customerType AS customerType, 
                                      a.firstname AS firstname, 
                                      a.lastname AS lastname, 
                                      a.companyName AS companyName, 
                                      a.taxId AS taxId,
                                      a.status AS status,
                                      f.filepath AS filepath
                              FROM account a 
                              LEFT JOIN file_identity f ON a.accountId = f.accountId;`)

    if (rows.length > 0) {
      let customerList = {
        customer: []
      }

      for (let i = 0; i < rows.length; i++) {
        customerList.customer.push({
          accountId: rows[i].accountId,
          email: rows[i].email,
          phone: eazy.formatPhoneNumber(rows[0].phone),
          customerType: rows[i].customerType,
          firstname: rows[i].firstname,
          lastname: rows[i].lastname,
          companyName: rows[i].companyName,
          taxId: rows[i].taxId,
          status: rows[i].status,
          filepath: rows[i].filepath
        })
      }

      return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage, customerList)
    } else {
      let customerList = {
        customer: []
      }

      return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage, customerList)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release()
  }
}

async function addCustomer(customerType, firstname, lastname, companyName, taxId, email, password, phone) {
  let db;
  try {
    db = await pool.getConnection()
    let getAccount = await db.query("SELECT email from account WHERE email LIKE ?", [email])
    if (getAccount.length > 0) {
      return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorEmailRegister)
    } else {
      let pwd = bcrypt.hashSync(password, saltRounds)
      let rows = await db.query("INSERT INTO `account`(`accountId`,`email`,`password`,`phone`,`customerType`,`firstname`,`lastname`,`companyName`,`taxId`,`status`,`created_date`) VALUES (?,?,?,?,?,?,?,?,?,?,?);", ['', email, pwd, phone, customerType, firstname, lastname, companyName, taxId, "WV", eazy.getDate()])
      if (rows) {
        let account = await db.query("SELECT * FROM `account` WHERE email LIKE ?;", [ email ])
        if (account.length === 1) {
          let wallet = await db.query("INSERT INTO `account_wallet`(`walletId`,`accountId`,`balance`) VALUES (?,?,?);", ['', account[0].accountId, '0'])
          if (wallet) {
            return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.SubmitDataSuccess)
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

async function editCustomer() {

}

async function checkVerifyIdentity() {

}

async function downloadFile(accountId) {
  let db;
  try {
    db = await pool.getConnection();
    let getIdentity = await db.query("SELECT * FROM `file_identity` WHERE accountId LIKE ?;", [accountId])
    if (getIdentity.length > 0) {
      return "./public/" + getIdentity[0].filepath
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release()
  }
}

async function previewImage() {

}

module.exports = {
  login,
  getEmployee,
  addEmployee,
  editEmployee,
  deleteEmployee,
  getPackage,
  addPackage,
  getEditPackage,
  editPackage,
  getCustomer,
  addCustomer, 
  editCustomer,
  checkVerifyIdentity,
  downloadFile
}