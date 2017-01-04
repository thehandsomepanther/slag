let slack = require('slack')
let getIdentity = require('./getIdentity')
let getChannels = require('./getChannels')
let getTeamName = require('./getTeamName')
let getUsers = require('./getUsers')

let teamData = {}

module.exports = function getTeamData(token, cb) {
  getIdentity(token, (data) => {
    teamData.currentUser = data

    getUsers(token, (data) => {
      teamData.userList = data

      getChannels(token, teamData.userList, (data) => {
        [teamData.channelTree, teamData.channelList, teamData.currentChannel] = data

        getTeamName(token, (data) => {
          teamData.currentTeam = data
          cb(teamData)
        })
      })
    })
  })
}
