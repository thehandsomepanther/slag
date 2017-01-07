let _ = require('lodash')
let fs = require('fs')
let path = require('path')
const emoji = JSON.parse(fs.readFileSync(path.join(__dirname, '../emoji/emoji.json'), { encoding: 'utf-8' }))

module.exports = function parseMessage(teamData, text, format=true) {
  let {userList, channelList} = teamData
  let userReg = /<@([^>\|]*)\|?([^>]*)>/g
  let channelReg = /<#([^>\|]*)\|?@?([^>]*)>/g
  let groupReg = /<!([^>\|]*)\|?@?([^>]*)>/g
  let emojiReg = /:[^\s]*:/g
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
  while (match = emojiReg.exec(text)) {
    if (emoji[match[0]] != undefined) {
      if (emoji[match[0]].length > 4) {
        let pair = findSurrogatePair(parseInt("0x"+emoji[match[0]]))
        text = _.replace(text, match[0], String.fromCharCode(parseInt(pair[0]), parseInt(pair[1])))
      } else {
        text = _.replace(text, match[0], String.fromCharCode(parseInt(emoji[match[0]], 16)))
      }
    }
  }
  return text
}

function makeMessage(message, color) {
  if (color.length) {
    return `{${color}}${message}{/${color}}`
  }
  return message
}

// from http://crocodillon.com/blog/parsing-emoji-unicode-in-javascript
function findSurrogatePair(point) {
  // assumes point > 0xffff
  var offset = point - 0x10000,
      lead = 0xd800 + (offset >> 10),
      trail = 0xdc00 + (offset & 0x3ff);
  return ["0x"+lead.toString(16), "0x"+trail.toString(16)];
}
