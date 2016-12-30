let slack = require('slack')
let logMessage = require('./logMessage')

module.exports = function logHistory(log, userList, channelList, channel, wrap) {
  let gen = historyGen(log, userList, channelList)
  gen.next()
  getHistory(channel, log, gen)
}

function* historyGen(log, userList, channelList, wrap) {
  log.log('Fetching messages...')
  let history = yield
  log.clearItems()
  log.logLines = []
  if (Array.isArray(history)) {
    for (let message of history) {
      logMessage(message, log, userList, channelList, wrap)
    }
  } else {
    log.log(history)
  }
}

function getHistory(channel, log, gen) {
  let api = ''
  switch(channel[0]) {
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

  slack[api].history({
    token: token,
    channel: channel
  }, (err, data) => {
    if (err) {
      gen.next("Oops! We weren't able to get messages right now. Try again later.")
    } else {
      if (data.messages.length > 0) {
        gen.next(data.messages.reverse())
      } else {
        gen.next('This channel has no messages!')
      }
    }
  })
}
