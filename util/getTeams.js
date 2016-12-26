let slack = require('slack')

module.exports = function getTeams(token, gen) {
  let currentTeam = ''

  slack.team.info({token}, (err, data) => {
    currentTeam = {'getTeams': data.team.name}

    gen.next(currentTeam)
  })
}
