let slack = require('slack')

module.exports = function getTeamName(token, cb) {
  var token = token
  let currentTeam = ''

  slack.team.info({token}, (err, data) => {
    currentTeam = data.team.name
    cb(currentTeam)
  })
}
