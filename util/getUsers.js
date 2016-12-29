let slack = require('slack')

module.exports = function getUsers(token, cb) {
  var token = token
  let userList = {}

  slack.users.list({token}, (err, data) => {
    for (let user of data.members) {
      if (user.real_name) {
        userList[user.id] = user.real_name
      } else {
        userList[user.id] = user.name
      }
    }

    cb(userList)
  })
}
