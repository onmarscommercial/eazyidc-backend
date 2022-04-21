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
  const { packageCode, cpu_unit, memory_unit, ssd_unit, transfer_unit, price, ssd_type, amount, status, createdBy } = req.body

  res.json(await employee.addPackage(packageCode, cpu_unit, memory_unit, ssd_unit, transfer_unit, price, ssd_type, amount, status, createdBy))
})

router.post('/get-edit-package', auth, async (req, res) => {
  const { packageId } = req.body

  res.json(await employee.getEditPackage(packageId))
})

router.post('/edit-package', auth, async (req, res) => {
  const { packageId, cpu_unit, memory_unit, ssd_unit, transfer_unit, price, ssd_type, amount, status, updatedBy } = req.body

  res.json(await employee.editPackage(packageId, cpu_unit, memory_unit, ssd_unit, transfer_unit, price, ssd_type, amount, status, updatedBy))
})

router.get('/customer', auth, async (req, res) => {
  res.json(await employee.getCustomer())
})

router.post('/search-customer', auth, async (req, res) => {
  const { searchData } = req.body

  res.json(await employee.searchCustomer(searchData))
})

router.post('/add-customer', auth, async (req, res) => {
  const { customerType, firstname, lastname, companyName, taxId, email, password, phone } = req.body

  res.json(await employee.addCustomer(customerType, firstname, lastname, companyName, taxId, email, password, phone))
})

router.post('/edit-customer', auth, async (req, res) => {
  const { accountId, email, phone, customerType, firstname, lastname, companyName, taxId, address, province, postcode } = req.body

  res.json(await employee.editCustomer(accountId, email, phone, customerType, firstname, lastname, companyName, taxId, address, province, postcode))
})

router.post('/change-pwd-customer', auth, async (req, res) => {
  const { accountId, password, confirmPassword } = req.body

  res.json(await employee.changePWDCustomer(accountId, password, confirmPassword))
})

router.post('/banned-user', auth, async (req, res) => {
  const { accountId } = req.body

  res.json(await employee.bannedUser(accountId))
})

router.get('/count-wait-approve', auth, async (req, res) => {
  res.json(await employee.getCountWaitApprove())
})

router.post('/check-verify-identity', auth, async (req, res) => {
  const { accountId } = req.body

  res.json(await employee.checkVerifyIdentity(accountId))
})

router.post('/add-address-customer', auth,  async (req, res) => {
  const { accountId, address, province, postcode } = req.body

  res.json(await employee.addAddressCustomer(accountId, address, province, postcode))
})

router.post('/download', async (req, res) => {
  const { accountId } = req.body

  res.download(await employee.downloadFile(accountId))
})

router.post('/preview-file', auth, async (req, res) => {
  const { accountId } = req.body

  res.json(await employee.previewFile(accountId))
})

module.exports = router