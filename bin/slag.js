let run = require('../index')

process.on('uncaughtException', function (err) {
  console.error(`[${(new Date).toUTCString()}] Uncaught Exception: ${err.message}`)
  console.error(err.stack)
  process.exit(1)
})

process.on('exit', function (code) {
  console.log('Exiting your Slag client...\n')
  process.exit(code)
})

run()