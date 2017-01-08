let fs = require('fs')
let path = require('path')
let errors = require('../errors')

module.exports = function () {
  try {
    const tokens = fs.readFileSync(path.join(__dirname, '../tokens.json'), { encoding: 'utf-8' })
    return Object.values(JSON.parse(tokens))

  } catch(exception) {

    if (exception.code === 'ENOENT') {
      console.log('Tokens.json file missing!\n', new errors.ConfigurationError('Please provide a tokens.json file in the root directory containing your Slack tokens', null))
    } else {
      console.log('Tokens.json file incorrect!\n', new errors.ConfigurationError('There\'s something wrong with your tokens.json configuration file\nMake sure it\'s in the format specified here: https://github.com/thehandsomepanther/slag/blob/master/README.md', null))
    }
    process.exit(1)
  }
}
