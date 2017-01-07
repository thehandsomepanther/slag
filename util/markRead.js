let slack = require('slack')

module.exports = function markRead(token, channelId, timestamp) {
  var token = token

  slack.channels.mark({token: token, channel: channelId, ts: timestamp}, (err, data) => {
    if (err) {
      console.log("There's something wrong with your token. Get a new token and try again.")
      return process.exit(0)
    }
  })
}
