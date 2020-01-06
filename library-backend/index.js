const server = require('./src/server')
const config = require('./src/utils/config')

async function main() {
  try {
    const instance = await server.boot()
    const runningInstance = await instance.listen({ port: config.PORT || 4000 })
    console.log(`Server ready at port ${config.PORT || 4000}`)
  } catch (err) {
    console.log(err)
  }
}

main()
