let notifier = require('node-notifier')
let parseMessage = require('./parseMessage')

module.exports = function handleMessage(teamData, message, log) {
  let {userList, currentUser, channelList, currentChannel} = teamData
  if (message.text != undefined &&
      message.user != currentUser && (
      message.text.includes(currentUser) ||
      message.text.includes('!channel') ||
      message.text.includes('!here')) ||
      message.channel[0] == 'D' ||
      message.channel[0] == 'G') {
    notifier.notify({
      title: `#${channelList[message.channel].name}`,
      message: userList[message.user] + ": " + parseMessage(teamData, message.text, false)
    })
  }

  if (message.channel == currentChannel) {
    log.logMessage(message)
  } else {
    markChannelTreeUnread(teamData.channelTree, teamData.channelList, message.channel)
  }
}

function markChannelTreeUnread(channelTree, channelList, id) {
  let belongsTo = channelList[id].belongsTo
  for (let child in channelTree.children[belongsTo].children) {
    if (child == channelList[id].name) {
      channelTree.children[belongsTo].children[child].name = `${channelList[id].name} *`
      break
    }
  }
}
