let slack = require('slack')
let errors = require('../errors')

module.exports = function getUsers(token, cb) {
  var token = token
  let currentUser = ''

  slack.auth.test({token}, (err, data) => {
    if (err) {
      throw new errors.ExternalResourceError("Can't retrieve your identity from Slack")
    }

    cb(data.user_id)
  })
}
