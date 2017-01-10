let slack = require('slack')
let errors = require('../errors')

module.exports = function markRead(token, channelId, timestamp, cb) {
  var token = token

  switch(channelId[0]) {
    case 'C':
      slack.channels.mark({token: token, channel: channelId, ts: timestamp}, (err, data) => {
        if (err) {
          throw new errors.ExternalResourceError("Unable to mark channel as read. Check if you have a valid Slack token")
          return process.exit(1)
        }
      })
      break
    case 'G':
      slack.groups.mark({token: token, channel: channelId, ts: timestamp}, (err, data) => {
        if (err) {
          throw new errors.ExternalResourceError("Unable to mark group message as read. Check if you have a valid Slack token")
          return process.exit(1)
        }
      })
      break
    case 'D':
      slack.im.mark({token: token, channel: channelId, ts: timestamp}, (err, data) => {
        if (err) {
          throw new errors.ExternalResourceError("Unable to mark direct message as read. Check if you have a valid Slack token")
          return process.exit(1)
        }
      })
      break
    default:
      break
  }

  cb()
}
