let blessed = require('blessed')
let Node = blessed.Node
let List = blessed.List
let wordwrap = require('wordwrap')
let parseMessage = require('./../../util/parseMessage')

function SlackLog(options) {
  if (!(this instanceof Node)) {
    return new SlackLog(options)
  }

  options = options || {}
  options.bufferLength = options.bufferLength || 30
  this.options = options
  List.call(this, options)

  this.channelList = options.channelList
  this.userList = options.userList
  this.lastMessager = ''
  this.previousWidth = null

  this.logLines = []
  this.interactive = false
}

SlackLog.prototype.log = function(str) {
  this.logLines.push(str)
  if (this.logLines.length>this.options.bufferLength) {
    this.logLines.shift()
  }
  this.setItems(this.logLines)
  this.scrollTo(this.logLines.length)
}

SlackLog.prototype.logMessage = function(message) {
  if (this.previousWidth != this.width) {
    this.wrap = wordwrap(this.width-2)
    this.previousWidth = this.width
  }

  let chatmessage = message.text != undefined ?
    this.wrap(parseMessage(message.text, this.userList, this.channelList)).split('\n') : ['']
  if (message.subtype != undefined) {
    switch(message.subtype) {
      case 'bot_message':
        this.lastMessager = message.bot_id
        // need a better way to handle bot names
        this.log(`{green-fg}${message.username ? message.username : `A Bot (${message.bot_id})`}{/green-fg}`)
        if (message.attachments != undefined) {
          chatmessage = []
          for (let attachment of message.attachments) {
            if (attachment.text) {
              chatmessage = this.wrap(parseMessage(attachment.text, this.userList, this.channelList)).split('\n')
            }
          }
        }
        break
      default:
        break
    }
  } else {
    if (message.user != this.lastMessager) {
      this.log(`{green-fg}${this.userList[message.user]}{/green-fg}`)
      this.lastMessager = message.user
    }
  }

  for (let chat of chatmessage) {
    this.log(`{white-fg}${chat}{/white-fg}`)
  }
}

SlackLog.prototype.__proto__ = List.prototype;

SlackLog.prototype.type = 'log'

module.exports = SlackLog
