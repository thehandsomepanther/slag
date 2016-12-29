let _ = require('lodash')

module.exports = function parseMessage(text, userList, channelList) {
  let userReg = /<@([^>\|]*)\|?([^>]*)>/g
  let channelReg = /<#([^>\|]*)\|?@?([^>]*)>/g
  let groupReg = /<!([^>\|]*)\|?@?([^>]*)>/g

  let match
  while (match = userReg.exec(text)) {
    text = _.replace(text, match[0], `{red-fg}@${userList[match[1]]}{/red-fg}`)
  }
  while (match = groupReg.exec(text)) {
    text = _.replace(text, match[0], `{red-fg}@${match[2].length?match[2]:match[1]}{/red-fg}`)
  }
  while (match = channelReg.exec(text)) {
    text = _.replace(text, match[0], `{red-fg}#${channelList[match[1]]}{/red-fg}`)
  }
  return text
}
