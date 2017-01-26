let slack = require('slack')
let errors = require('../errors')

<<<<<<< HEAD
module.exports = function markRead(token, channelId, timestamp, cb) {
  var token = token
=======
module.exports = function markRead(teamData, channelId, timestamp) {
  var token = teamData.token
  let api = ''
>>>>>>> d43ae31741a75dd6c9cfbf8265c19c16fff99590

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

<<<<<<< HEAD
  cb()
=======
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
>>>>>>> d43ae31741a75dd6c9cfbf8265c19c16fff99590
}
