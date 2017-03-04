let fs = require('fs-extra')
let path = require('path')
let errors = require('../errors')

module.exports = function getTokens() {
  const TOKENSPATH = path.join(__dirname, '../tokens.json')

  if (process.env['SLAG_TOKENS_PATH']) {
    fs.copySync(process.env['SLAG_TOKENS_PATH'], TOKENSPATH)
    console.log("Slack tokens file set! Now type `slag` to launch the client.")
    process.exit(0)
  }

  let tokens = []
  try {
    tokens = JSON.parse(fs.readFileSync(TOKENSPATH))
  } catch(e) {
    if (!process.env['SLAG_TOKEN']) {
      if (e.code === 'ENOENT') {
        console.log('Tokens.json file missing!\n', new errors.ConfigurationError('Use `slag --help` to learn how to set a tokens file.', null))
      } else {
        console.log('Tokens.json file incorrect!\n', new errors.ConfigurationError('There\'s something wrong with your tokens.json configuration file\nMake sure it\'s in the format specified here: https://github.com/thehandsomepanther/slag/blob/master/README.md', null))
      }
      process.exit(1)
    }
  }

  if (process.env['SLAG_TOKEN']) {
    for (t of tokens) {
      if (t.token == process.env['SLAG_TOKEN']) {
        console.log(`This token has already been registered!`)
        process.exit(0)
      }
    }

    tokens.push({
      team: process.env['SLAG_TOKEN_TEAM'],
      token: process.env['SLAG_TOKEN']
    })
    fs.writeJsonSync(TOKENSPATH, tokens)
    console.log(`Added token to team ${process.env['SLAG_TOKEN_TEAM']}`)
    process.exit(0)
  }

  if (process.env['LIST_TOKENS']) {
    for (token of tokens) {
      console.log(`${token.team}: \t${token.token}`)
    }
    process.exit(0)
  }

  return tokens
}
