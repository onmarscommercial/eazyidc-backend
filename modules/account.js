require('dotenv').config()
const mariadb = require('mariadb')
const eazy = require('./eazyidc')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const resMsg = require('./responseMessage')
const saltRounds = 10

const pool = mariadb.createPool({
  host: process.env.db_host,
  user: process.env.db_username,
  password: process.env.db_password,
  database: process.env.db_database,
  connectionLimit: 10
})

async function login(email, password) {
  let db
  try {
    db = await pool.getConnection()
    let rows = await db.query("SELECT * FROM `account` WHERE email LIKE ?;", [ email ])
    if (rows.length === 1) {
      let verify = bcrypt.compareSync(password, rows[0].password.replace(/^\$2y(.+)$/i, '\$2b$1'))
      if (verify === true) {
        const accessToken = jwt.sign({ email: rows[0].email }, process.env.jwt_key, { expiresIn: "30m" })

        const date = new Date(rows[0].last_log * 1000)

        let result = {
          profile: {
            email: rows[0].email,
            password: rows[0].password,
            phone: eazy.formatPhoneNumber(rows[0].phone),
            last_login: eazy.addZero(date.getDate())+"/"+eazy.addZero((date.getMonth()+1))+"/"+date.getFullYear()+" "+eazy.addZero(date.getHours())+":"+eazy.addZero(date.getMinutes())+":"+eazy.addZero(date.getSeconds())
          },
          accessToken: accessToken
        }

        await db.query("UPDATE `account` SET `last_log` = ? WHERE `account`.`email` LIKE ?;", [Math.floor(new Date()/1000), email])

        return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.loginSuccess, result)
      } else {
        return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorLogin)
      }
    } else {
      return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorLogin)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorLogin)
  } finally {
    if (db) db.release()
  }
}

async function register(email, password, phone) {
  let db
  try {
    db = await pool.getConnection();
    let getAccount = await db.query("SELECT email from account WHERE email LIKE ?", [email])
    if (getAccount.length > 0) {
      return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorEmailRegister)
    } else {
      let pwd = bcrypt.hashSync(password, saltRounds)
      let rows = await db.query("INSERT INTO `account`(`accountId`, `email`, `password`, `phone`, `status`, `created_date`) VALUES (?,?,?,?,?,?);", ['', email, pwd, phone, 0, eazy.getDate()])
      if (rows) {
        let account = await db.query("SELECT * FROM `account` WHERE email LIKE ?;", [ email ])
        if (account.length === 1) {
          let wallet = await db.query("INSERT INTO `account_wallet`(`walletId`,`accountId`,`balance`) VALUES (?,?,?);", ['', account[0].accountId, '0'])
          if (wallet) {
            return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.registerSuccess)
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

async function verify() {

}

async function changePWD(email, newPassword, verifyNewPassword) {
  if (!newPassword || !verifyNewPassword) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorInput)
  }

  if (newPassword !== verifyNewPassword) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorChangePassword)
  }

  let db
  try {
    db = await pool.getConnection()
    let rows = await db.query("SELECT email, password FROM `account` WHERE `email` LIKE ? LIMIT 1;", [ email ])
    if (rows.length > 0) {
      const salt = bcrypt.genSaltSync(saltRounds)
      const newPwd = bcrypt.hashSync(newPassword, salt)

      let pwdChanged = await db.query("UPDATE `account` SET password = ? WHERE `email` LIKE ?;", [ newPwd, email ])
      if (pwdChanged.affectedRows === 1) {
        return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage)
      } else {
        return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorMessage)
      }
    } else {
      return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.userNotfound)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release()
  }
}

module.exports = {
  login,
  register,
  verify,
  changePWD
}