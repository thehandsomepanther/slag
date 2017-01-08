let ApplicationError = require('./ApplicationError')

class ExternalResourceError extends ApplicationError {
  constructor(message) {
    super(message || 'We were unable to fetch an external resource', 500)
  }
}

module.exports = ExternalResourceError