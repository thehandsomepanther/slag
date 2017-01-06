let _ = require('lodash')

module.exports = function parseMessage(text, userList, channelList, format=true) {
  let userReg = /<@([^>\|]*)\|?([^>]*)>/g
  let channelReg = /<#([^>\|]*)\|?@?([^>]*)>/g
  let groupReg = /<!([^>\|]*)\|?@?([^>]*)>/g
  let color = ''
  if (format) {
    color = 'red-fg'
  }

  let match

  while (match = userReg.exec(text)) {
    text = _.replace(text, match[0], makeMessage(`@${userList[match[1]]}`, color))
  }
  while (match = groupReg.exec(text)) {
    text = _.replace(text, match[0], makeMessage(`@${match[2].length?match[2]:match[1]}`, color))
  }
  while (match = channelReg.exec(text)) {
    text = _.replace(text, match[0], makeMessage(`#${channelList[match[1]]}`, color))
  }
  return text
}

function makeMessage(message, color) {
  if (color.length) {
    return `{${color}}${message}{/${color}}`
  }
  return message
}
