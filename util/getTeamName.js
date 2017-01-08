let slack = require('slack')
let errors = require('../errors')

module.exports = function getTeamName(token, cb) {
  var token = token
  let currentTeam = ''

  slack.team.info({token}, (err, data) => {
    if (err) {
      throw new errors.ExternalResourceError("Can't retrieve team name from Slack")
    }

    currentTeam = data.team.name
    cb(currentTeam)
  })
}
