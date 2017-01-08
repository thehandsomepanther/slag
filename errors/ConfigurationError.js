let ApplicationError = require('./ApplicationError')

class ConfigurationError extends ApplicationError {
  constructor(message) {
    super(message || 'Your Slag Client was configured incorrectly. Please refer to https://github.com/thehandsomepanther/slag/blob/master/README.md', 500)
    this.name = 'Configuration Error'
  }
}

module.exports = ConfigurationError