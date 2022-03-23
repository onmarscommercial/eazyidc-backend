require('dotenv').config()
const express = require('express')
const router = express()
const employee = require('../modules/employee')
const auth = require('../middleware/auth')
const eazy = require('../modules/eazyidc')

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  res.json(await employee.login(username, password))
})

router.get('/employee', auth, async (req, res) => {
  res.json(await employee.getEmployee())
})

router.post('/add-employee', auth, async (req, res) => {
  const { createdBy, username, password, firstname, lastname, roleId, status } = req.body

  res.json(await employee.addEmployee(createdBy, username, password, firstname, lastname, roleId, status))
})

router.post('/edit-employee', async (req, res) => {
  
})

router.post('/delete-employee', async (req, res) => {
  
})

router.get('/package', auth, async (req, res) => {
  res.json(await employee.getPackage())
})

router.post('/add-package', auth, async (req, res) => {
  const { cpu_unit, memory_unit, ssd_unit, transfer_unit, price, ssd_type, status, createdBy } = req.body

  res.json(await employee.addPackage(cpu_unit, memory_unit, ssd_unit, transfer_unit, price, ssd_type, status, createdBy))
})

router.post('/edit-package', async (req, res) => {

})

router.get('/customer', auth, async (req, res) => {
  res.json(await employee.getCustomer())
})

router.post('/add-customer', auth, async (req, res) => {
  const { customerType, firstname, lastname, companyName, taxId, email, password, phone } = req.body

  res.json(await employee.addCustomer(customerType, firstname, lastname, companyName, taxId, email, password, phone))
})

router.post('/check-verify-identity', async (req, res) => {

})

router.post('/download', async (req, res) => {
  const { accountId } = req.body

  res.download(await employee.downloadFile(accountId))
})

module.exports = router