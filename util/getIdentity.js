let slack = require('slack')

module.exports = function getUsers(token, cb) {
  var token = token
  let currentUser = ''

  slack.auth.test({token}, (err, data) => {
    if (err) {
      console.log("There's something wrong with your token. Get a new token and try again.")
      return process.exit(1)
    }

    cb(data.user_id)
  })
}
