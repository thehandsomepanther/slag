let notifier = require('node-notifier')
let parseMessage = require('./parseMessage')

module.exports = function handleMessage(message, log, userList, currentUser, channelList, currentChannel) {
  if (message.text != undefined && (
      message.text.includes(currentUser) ||
      message.text.includes('!channel') ||
      message.text.includes('!here'))) {
    notifier.notify({
      title: `#${channelList[message.channel]}`,
      message: userList[message.user] + ": " + parseMessage(message.text, userList, channelList, false)
    })
  }

  if (message.channel == currentChannel) {
    log.logMessage(message)
  }
}
