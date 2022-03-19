const fs = require("fs")

let logValue = 0

function response(code, status, message, result) {
  return {
    code: code,
    status: status,
    message: message,
    result: result
  }
}

function log(Text) {
  let today = new Date()
  let d = addZero(today.getDate())
  let m = addZero((today.getMonth()+1))
  let y = today.getFullYear()
  let h = addZero(today.getHours())
  let i = addZero(today.getMinutes())
  let s = addZero(today.getSeconds())

  let message = `${d}/${m}/${y} ${h}:${i}:${s} | ${Text}`;
  fs.appendFileSync(`./logs/${y}-${m}-${d}.txt`, message+'\r\n');
  console.info(message)

  if (logValue >= 1000) {
    console.clear();
    logValue = 0;
  }
  logValue++;
}

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i
}

function createDirectory(directoryName) {
  fs.mkdir(directoryName, { recursive: true }, (err) => { if(err) console.log(err) })
}

function writeCache(file, folder, data, datefile = null) {
  let path = './cache'
  if (folder) 
    path = path+'/'+folder
  if (datefile)
    path = path+'/'+datefile
  fs.mkdir(path, { recursive: true }, (err) => {
    if(err) console.log(err)
  })

  path = path+'/'+file+'.json'

  try {
    fs.writeFileSync(path, data)
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

async function readCache(file, folder, datefile = null) {
  let path = './cache'
  if (folder)
    path = path+'/'+folder
  if (datefile)
    path = path+'/'+datefile
  
  try {
    const data = fs.readFileSync(path+'/'+file+'.json', 'utf8')
    return data
  } catch (err) {
    console.error(err)
    return false
  }
}

async function checkExpCache(file, folder, exp, datefile = null) {
  let path = './cache'
  if (folder)
    path = path+'/'+folder
  if (datefile)
    path = path+'/'+datefile

  try {
    const info = fs.statSync(path+'/'+file+'.json')
    let timeCache = (info.ctimeMs/1000)+(exp*60)

    if (timeCache > (Date.now()/1000)) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

function currencyFormat(num) {
  try {
    return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  } catch (error) {
    return num;
  }
}

function numberFormat(num) {
  return parseFloat(Number.parseFloat(num).toFixed(2))
}

function getDate() {
  let today = new Date()
  let d = addZero(today.getDate())
  let m = addZero((today.getMonth()+1))
  let y = today.getFullYear()
  let h = addZero(today.getHours())
  let i = addZero(today.getMinutes())
  let s = addZero(today.getSeconds())

  let message = `${y}-${m}-${d} ${h}:${i}:${s}`;

  return message
}

function getFutureDate() {
  let futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + 30)
  let d = addZero(futureDate.getDate())
  let m = addZero(futureDate.getMonth()+1)
  let y = addZero(futureDate.getFullYear())
  let h = addZero(futureDate.getHours())
  let i = addZero(futureDate.getMinutes())
  let s = addZero(futureDate.getSeconds())

  let future = `${y}-${m}-${d} ${h}:${i}:${s}`;

  return future
}

function formatPhoneNumber(phone) {
  var cleaned = ('' + phone).replace(/\D/g, '');
  var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return match[1] + '-' + match[2] + '-' + match[3]
  }
  return null
}

function formatDate(date) {
  var date = new Date(date)
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0')
  var yyyy = date.getFullYear()
  var h = date.getHours()
  var i = date.getMinutes()

  date = dd + '/' + mm + '/' + yyyy + ' ' + h + ':' + i

  return date
}

module.exports = {
  response,
  log,
  addZero,
  createDirectory,
  writeCache,
  readCache,
  checkExpCache,
  currencyFormat,
  numberFormat,
  getDate,
  getFutureDate,
  formatPhoneNumber,
  formatDate
}