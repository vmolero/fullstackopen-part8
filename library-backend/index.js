const server = require('./src/server')

async function main() {
  try {
    const instance = await server.boot()
    const runningInstance = await instance.listen()
    console.log(`Server ready at ${runningInstance.url}`)
  } catch (err) {
    console.log(err)
  }
}

main()
