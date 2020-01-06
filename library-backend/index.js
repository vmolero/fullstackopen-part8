const http = require('http')
const server = require('./src/server')
const config = require('./src/utils/config')

async function main() {
  try {
    const { app, apolloServer } = await server.boot()
    const httpServer = http.createServer(app)
    apolloServer.installSubscriptionHandlers(httpServer)

    httpServer.listen({ port: config.PORT || 4000 })
    console.log(`Apollo Server on http://localhost:4000/graphql`)
    console.log(`Apollo Subscription Server on ws://localhost:4000/graphql`)
  } catch (err) {
    console.log(err)
  }
}

main()
