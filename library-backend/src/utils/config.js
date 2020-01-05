require('dotenv').config()

let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI
const SECRET = process.env.SECRET
const NODE_ENV = process.env.NODE_ENV

if (NODE_ENV === 'test') {
  MONGODB_URI =
    process.env.MONGODB_TEST || 'mongodb://root:root@localhost:27017/test'
}

module.exports = {
  MONGODB_URI,
  PORT,
  SECRET,
  NODE_ENV
}
