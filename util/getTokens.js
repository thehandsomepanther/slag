let fs = require('fs-extra')
let path = require('path')
let errors = require('../errors')

module.exports = function getTokens() {
  try {
    if (process.env['SLAG_TOKENS']) {
      fs.copySync(process.env['SLAG_TOKENS'], path.join(__dirname, '../tokens.json'))
    }

    const tokens = fs.readFileSync(path.join(__dirname, '../tokens.json'))
    return JSON.parse(tokens)

  } catch(exception) {
    if (exception.code === 'ENOENT') {
      console.log('Tokens.json file missing!\n', new errors.ConfigurationError('Use `slag --help` to learn how to set a tokens file.', null))
    } else {
      console.log('Tokens.json file incorrect!\n', new errors.ConfigurationError('There\'s something wrong with your tokens.json configuration file\nMake sure it\'s in the format specified here: https://github.com/thehandsomepanther/slag/blob/master/README.md', null))
    }
    process.exit(1)
  }
}
