let fs = require('fs')
let path = require('path')

module.exports = function () {
  try {
    const tokens = fs.readFileSync(path.join(__dirname, '../tokens.json'), { encoding: 'utf-8' })
    return Object.values(JSON.parse(tokens))

  } catch(exception) {

    if (exception.code === 'ENOENT') {
      console.error('Please provide a tokens.json file in the root directory containing your Slack tokens')
    } else {
      console.error('There\'s something wrong with your tokens.json configuration file\nMake sure it\'s in the format specified here: https://github.com/thehandsomepanther/slag/blob/master/README.md')
    }
    process.exit()

  }
}