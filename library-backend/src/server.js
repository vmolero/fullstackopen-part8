const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')
const config = require('./utils/config')
const { typeDefs, resolvers } = require('./resolvers')

async function boot() {
  mongoose.set('useFindAndModify', false)
  await mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
  return new ApolloServer({
    typeDefs,
    resolvers
  })
}

module.exports = { boot }
