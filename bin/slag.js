let run = require('../index')

process.on('uncaughtException', function (err) {
  console.error(`[${(new Date).toUTCString()}] ${err.name}: ${err.message}\n`)
  console.error(err.stack)
  process.exit(1)
})

process.on('exit', function (code) {
  console.log('Exiting your Slag client...\n')
  process.exit(code)
})

run()
