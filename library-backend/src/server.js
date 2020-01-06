const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const { tokenExtractor } = require('./middleware')
const config = require('./utils/config')
const { typeDefs, resolvers } = require('./resolvers')
const User = require('./models/User')

async function boot() {
  const app = express()

  app.use(cors())
  app.use(express.static('build'))
  app.use(bodyParser.json())

  app.use(tokenExtractor)

  mongoose.set('useFindAndModify', false)
  await mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      if (!('token' in req)) {
        return null
      }
      const decodedToken = jwt.verify(req.token, config.SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  })
  server.applyMiddleware({ app })
  return app
}

module.exports = { boot }
