let slack = require('slack')
slack.chat.command = require('../lib/chat.command')
let _ = require('lodash')

module.exports = function sendMessage(token, channel, message) {
  if (!message.length) return

  if (message[0] == "/") {
    let commandReg = /^\/([^\s]*)/
    let match = commandReg.exec(message)
    let text = (_.replace(message, match[0], '')).trim()

    slack.chat.command({
      token: token,
      channel: channel,
      text: text,
      command: match[0]
    }, (err, data) => {
      if (err) console.log(err)
    })
  } else {
    slack.chat.postMessage({
      token: token,
      channel: channel,
      text: message,
      as_user: true
    }, (err, data) => {
      if (err) console.log(err)
    })
  }

}
