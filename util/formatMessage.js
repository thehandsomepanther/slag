let _ = require('lodash')

module.exports = function formatMessage(teamData, text) {
  let {userListInverted, channelListInverted} = teamData

  let userReg = /@([a-z0-9]*)/g
  let channelReg = /#([a-z0-9\-]*)/g

  let match
  while (match = userReg.exec(text)) {
    if (userListInverted[match[1]] != undefined) {
      text = _.replace(text, match[0], `<@${userListInverted[match[1]]}>`)
    }

    if (match[1] == 'channel' || match[1] == 'here') {
      text = _.replace(text, match[0], `<!${match[1]}>`)
    }
  }
  while (match = channelReg.exec(text)) {
    if (channelListInverted[match[1]] != undefined) {
      text = _.replace(text, match[0], `<#${channelListInverted[match[1]]}>`)
    }
  }

  return text
}
