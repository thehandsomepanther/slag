let slack = require('slack')

module.exports = function getUsers(token, gen) {
  let userList = {}

  slack.users.list({token}, (err, data) => {
    for (var user in data.members) {
      user = data.members[user]
      if (user.real_name) {
        userList[user.id] = user.real_name
      } else {
        userList[user.id] = user.name
      }
    }

    gen.next({
      'getUsers': userList
    })
  })
}
