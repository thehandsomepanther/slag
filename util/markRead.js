let slack = require('slack')
let errors = require('../errors')


module.exports = function markRead(teamData, channelId, timestamp) {
  var token = teamData.token
  let api = ''

  switch(channelId[0]) {
    case 'C':
      api = 'channels'
      break
    case 'G':
      api = 'groups'
      break
    case 'D':
      api = 'im'
      break
    default:
      break
  }

  if (api != '') {
    slack[api].mark({
      token: token,
      channel: channelId,
      ts: timestamp
    }, (err, data) => {
      if (err) {
        throw new errors.ExternalResourceError("Unable to mark direct message as read. Check if you have a valid Slack token")
        return process.exit(1)
      }
    })
  }

  return markChannelTreeRead(teamData.channelTree, teamData.channelList, channelId)
}

function markChannelTreeRead(channelTree, channelList, id) {
  let belongsTo = channelList[id].belongsTo
  for (let child in channelTree.children[belongsTo].children) {
    if (child == channelList[id].name) {
      channelTree.children[belongsTo].children[child].name = channelList[id].name
      break
    }
  }
}
