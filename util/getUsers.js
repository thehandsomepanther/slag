let slack = require('slack')
let errors = require('../errors')

module.exports = function getUsers(token, cb) {
  var token = token
  let userList = {}

  slack.users.list({token}, (err, data) => {
    if (err) {
      throw new errors.ExternalResourceError('Unable to retrieve users from Slack')
    }

    for (let user of data.members) {
      userList[user.id] = user.name
    }

    cb(userList)
  })
}
