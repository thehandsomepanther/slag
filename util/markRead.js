let slack = require('slack')
let errors = require('../errors')

module.exports = function markRead(token, channelId, timestamp) {
  var token = token

  slack.channels.mark({token: token, channel: channelId, ts: timestamp}, (err, data) => {
    if (err) {
      throw new errors.ExternalResourceError("Unable to mark channel as read. Check if you have a valid Slack token")
      return process.exit(1)
    }
  })
}
