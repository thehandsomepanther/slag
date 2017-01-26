let slack = require('slack')

module.exports = function logHistory(teamData, log) {
  let {token, currentChannel} = teamData
  let gen = historyGen(log)
  gen.next()
  getHistory(token, currentChannel, gen)
}

function* historyGen(log) {
  log.log('Fetching messages...')
  let history = yield
  log.clearItems()
  log.logLines = []
  if (Array.isArray(history)) {
    for (let message of history) {
      log.logMessage(message)
    }
  } else {
    log.log(history)
  }
}

function getHistory(token, channel, gen) {
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
    channel: channel,
    count: 50
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
