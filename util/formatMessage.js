let _ = require('lodash')

module.exports = function formatMessage(text, userList, channelList) {
  let userReg = /@([^\s]*)/g
  let channelReg = /#([^\s]*)/g

  let match
  while (match = userReg.exec(text)) {
    if (userList[match[1]] != undefined) {
      text = _.replace(text, match[0], `<@${userList[match[1]]}>`)
    }
  }
  while (match = channelReg.exec(text)) {
    if (channelList[match[1]] != undefined) {
      text = _.replace(text, match[0], `<#${channelList[match[1]]}>`)
    }
  }

  return text
}
