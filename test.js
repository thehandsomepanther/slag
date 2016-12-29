let getTeamData = require('./util/getTeamData')
let env = require('node-env-file')
env(__dirname + '/.env')

let tokens = process.env.SLACK_TOKENS.split(" ")
let t = 0
let token = tokens[t]

getTeamData(token, (teamData) => {
  console.log(teamData)
  // prepareScreen(teamData)
})
