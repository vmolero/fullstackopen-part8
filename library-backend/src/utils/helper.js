const jwt = require('jsonwebtoken')
const User = require('../models/User')
const config = require('./config')
const { UserInputError } = require('apollo-server-express')

const getToken = async credentials => {
  const user = await User.findOne({ username: credentials.username })
  const passwordCorrect =
    user === null ? false : credentials.password === '1234'

  if (!(user && passwordCorrect)) {
    throw new UserInputError('invalid user or password')
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  return jwt.sign(userForToken, config.SECRET)
}

module.exports = { getToken }
