let notifier = require('node-notifier')
let parseMessage = require('./parseMessage')

module.exports = function handleMessage(teamData, message, log) {
  let {userList, currentUser, channelList, currentChannel} = teamData
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
