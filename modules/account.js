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

async function login(email, password, ip) {
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
            phone: eazy.formatPhoneNumber(rows[0].phone),
            status: rows[0].status,
            last_login: eazy.addZero(date.getDate())+"/"+eazy.addZero((date.getMonth()+1))+"/"+date.getFullYear()+" "+eazy.addZero(date.getHours())+":"+eazy.addZero(date.getMinutes())+":"+eazy.addZero(date.getSeconds())
          },
          accessToken: accessToken
        }

        await db.query("UPDATE `account` SET `last_log` = ? WHERE `account`.`email` LIKE ?;", [Math.floor(new Date()/1000), email])
        await db.query("INSERT INTO `user_log`(`userLogId`,`accountId`,`log_ip_addr`,`log_date`) VALUES (?,?,?,?);", ['', rows[0].accountId, ip, eazy.getDate()])

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

async function register(email, password, phone, firstname, lastname) {
  let db
  try {
    db = await pool.getConnection();
    let getAccount = await db.query("SELECT email from account WHERE email LIKE ?", [email])
    if (getAccount.length > 0) {
      return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorEmailRegister)
    } else {
      let pwd = bcrypt.hashSync(password, saltRounds)
      let rows = await db.query("INSERT INTO `account`(`accountId`, `email`, `password`, `phone`, `firstname`, `lastname`, `status`, `created_date`) VALUES (?,?,?,?,?,?,?,?);", ['', email, pwd, phone, firstname, lastname, 0, eazy.getDate()])
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

async function getBalance(email) {
  let userBalance = {}
  let db

  if (await eazy.checkExpCache(email, 'balance', 0.05) === true) {

  }

  try {
    //let { data } = await axios.get(`${process.env.}`)

    db = await pool.getConnection();
    let account = await db.query("SELECT * FROM `account` WHERE email LIKE ?;", [ email ])
    if (account.length > 0) {
      let inv_data = await db.query("SELECT * from `account_wallet` WHERE accountId LIKE ?", [account[0].accountId])
      if (inv_data.length === 1) {
        userBalance.balance = eazy.numberFormat(inv_data[0].balance)
      }

      eazy.writeCache(email, "balance", JSON.stringify(userBalance))
      return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage, userBalance)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release()
  }
}

async function createServer(email, osType, osVersion, ssdType, packageId, hostName, userName, password) {
  let db
  try {
    db = await pool.getConnection();
    let rows = await db.query("SELECT * FROM `account` WHERE email LIKE ?;", [ email ])
    if (rows.length > 0) {
      let server = await db.query("INSERT INTO `account_server`(`serverId`,`accountId`,`packageId`,`os_type`,`os_version`,`ssd_type`,`hostname`,`username`,`password`,`ip_address`,`status`,`created_date`,`expired_date`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);", ['',rows[0].accountId, packageId, osType, osVersion, ssdType, hostName, userName, password, '11111', 1, eazy.getDate(), eazy.getFutureDate()])
      if (server) {
        return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage)
      }
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release()
  }
}

async function getServer(email) {
  let db
  try {
    db = await pool.getConnection();
    let account = await db.query("SELECT * FROM `account` WHERE email LIKE ?;", [ email ])
    if (account.length > 0) {
      let rows = await db.query("SELECT COUNT(`serverId`) AS server FROM account_server WHERE `accountId` LIKE ?;", [account[0].accountId])
      if (rows) {
        let acc_server = await db.query(`SELECT account_server.serverId, account_server.accountId, account_server.packageId as packageId, os_type, os_version, ssd_type, hostname, username, password, ip_address, account_server.status as server_status, account_server.created_date, account_server.expired_date, package.cpu_unit, package.memory_unit, package.ssd_unit, package.transfer_unit
                                         FROM account_server JOIN package ON account_server.packageId = package.packageId 
                                         WHERE accountId LIKE ?;`, [account[0].accountId])
        if (acc_server.length > 0) {
          let server = {
            serverUnit: rows[0].server,
            serverList: [],
          }

          for (let i = 0; i < acc_server.length; i++) {
            server.serverList.push({
              serverId: acc_server[i].serverId,
              accountId: acc_server[i].accountId,
              packageId: acc_server[i].packageId,
              os_type: acc_server[i].os_type,
              os_version: acc_server[i].os_version,
              ssd_type: acc_server[i].ssd_type,
              hostname: acc_server[i].hostname,
              username: acc_server[i].username,
              password: acc_server[i].password,
              ip_address: acc_server[i].ip_address,
              status: acc_server[i].server_status,
              created_date: acc_server[i].created_date,
              expired_date: acc_server[i].expired_date,
              cpu_unit: acc_server[i].cpu_unit,
              memory_unit: acc_server[i].memory_unit,
              ssd_unit: acc_server[i].ssd_unit,
              transfer_unit: acc_server[i].transfer_unit
            }) 
          }

          return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage, server)
        }
      }
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release()
  }
}

async function getServerDetail(serverId) {
  let db 
  
  try {
    db = await pool.getConnection()
    let rows = await db.query(`SELECT account_server.serverId, account_server.accountId, account_server.packageId as packageId, os_type, os_version, ssd_type, hostname, username, password, ip_address, account_server.status as server_status, account_server.created_date, account_server.expired_date, package.cpu_unit, package.memory_unit, package.ssd_unit, package.transfer_unit
                               FROM account_server JOIN package ON account_server.packageId = package.packageId 
                               WHERE serverId LIKE ?;`, [serverId])
    if (rows.length === 1) {
      let serverDetail = {
        server: {
          serverId: rows[0].serverId,
          accountId: rows[0].accountId,
          packageId: rows[0].packageId,
          os_type: rows[0].os_type,
          os_version: rows[0].os_version,
          ssd_type: rows[0].ssd_type,
          hostname: rows[0].hostname,
          username: rows[0].username,
          password: rows[0].password,
          ip_address: rows[0].ip_address,
          status: rows[0].server_status,
          created_date: rows[0].created_date,
          expired_date: rows[0].expired_date,
          cpu_unit: rows[0].cpu_unit,
          memory_unit: rows[0].memory_unit,
          ssd_unit: rows[0].ssd_unit,
          transfer_unit: rows[0].transfer_unit
        }
      }
      return eazy.response(resMsg.successCode, resMsg.successStatus, resMsg.successMessage, serverDetail)
    }
  } catch (error) {
    return eazy.response(resMsg.errorCode, resMsg.errorStatus, resMsg.errorConnection)
  } finally {
    if (db) db.release()
  }
}

async function getPackage() {
  let db
  try {
    db = await pool.getConnection();
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

module.exports = {
  login,
  register,
  verify,
  changePWD,
  getBalance,
  createServer,
  getServer,
  getServerDetail,
  getPackage
}