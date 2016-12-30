let parseMessage = require('./parseMessage')

module.exports = function logMessage(message, log, userList, channelList, wrap, lastMessager) {
  let chatmessage = message.text != undefined ?
    wrap(parseMessage(message.text, userList, channelList)).split('\n') : ['']

  if (message.subtype != undefined) {
    switch(message.subtype) {
      case 'bot_message':
        lastMessager = message.bot_id
        // need a better way to handle bot names
        log.log(`{green-fg}${message.username ? message.username : `A Bot (${message.bot_id})`}{/green-fg}`)
        if (message.attachments != undefined) {
          chatmessage = []
          for (let attachment of message.attachments) {
            if (attachment.text) {
              chatmessage = wrap(parseMessage(attachment.text, userList, channelList)).split('\n')
            }
          }
        }
        break
      default:
        break
    }
  } else {
    if (message.user != lastMessager) {
      log.log(`{green-fg}${userList[message.user]}{/green-fg}`)
      lastMessager = message.user
    }
  }

  for (let chat of chatmessage) {
    log.log(`{white-fg}${chat}{/white-fg}`)
  }
}
