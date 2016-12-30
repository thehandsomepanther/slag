let blessed = require('blessed')
let contrib = require('blessed-contrib')
let slackLog = require('./lib/widget/slackLog')
let env = require('node-env-file')
let slack = require('slack')
let _ = require('lodash')
let {border, focusBorder} = require('jsonFile').readFileSync('./config.json')

let getTeamData = require('./util/getTeamData')
let parseMessage = require('./util/parseMessage')
let formatMessage = require('./util/formatMessage')
let logHistory = require('./util/logHistory')

env(__dirname + '/.env')

let bot = slack.rtm.client()
let tokens = process.env.SLACK_TOKENS.split(" ")
let t = 0
let token = tokens[t]
bot.listen({token})

let screen = blessed.screen()
let grid = new contrib.grid({
  rows: 12, cols: 12, screen: screen
})

screen.key(['C-t'], (ch, key) => {
  if (tokens.length > 1) {
    token = tokens[(++t) % tokens.length]
    bot.listen({token})
    getTeamData(token, (teamData) => {
      prepareScreen(teamData)
    })
  }
})

getTeamData(token, (teamData) => {
  prepareScreen(teamData)
})

function prepareScreen(teamData) {
  let {
    channelTree,
    channelList,
    currentChannel,
    userList,
    currentTeam
  } = teamData

  let userListInverted = _.invert(userList)
  let channelListInverted = _.invert(channelList)

  let log = grid.set(0, 4, 11, 8, slackLog, {
    label: `#${channelList[currentChannel]}`,
    tags: true,
    scrollable: true,
    channelList,
    userList
  })
  log.style.border = border

  let input = grid.set(11, 4, 1.5, 8, blessed.textbox, {
    keys: true,
    label: `Message #${channelList[currentChannel]}`,
  })
  input.style.border = border

  input.on('submit', (data) => {
    var message = formatMessage(input.getValue(), userListInverted, channelListInverted, currentChannel)
    input.clearValue()
    screen.render()
    slack.chat.postMessage({
      token: token,
      channel: currentChannel,
      text: message,
      as_user: true
    }, (err, data) => {
      if (err) {
        console.log(err)
      }
    })
  })

  let tree = grid.set(0, 0, 12, 4, contrib.tree, {
    label: `${currentTeam}`,
    tags: true,
  })
  tree.style.border = border

  tree.on('select', (node) => {
    if (node.children == undefined && node.id != currentChannel) {
      currentChannel = node.id
      input.setLabel(`Message #${channelList[currentChannel]}`)
      log.setLabel(`#${channelList[currentChannel]}`)
      log.logLines = []
      log.clearItems()
      lastMessager = ''
      logHistory(token, log, currentChannel)
    }
  })

  tree.setData(channelTree)

  bot.message((message) => {
    if (message.channel == currentChannel) {
      log.logMessage(message)
    }
  })

  let foci = [tree, input]
  var currentFocus = 0

  foci[0].focus()
  foci[0].style.border = focusBorder

  screen.key(['tab'], (ch, key) => {
    foci[currentFocus].style.border = border
    currentFocus = (currentFocus + 1) % foci.length
    foci[currentFocus].focus()
    foci[currentFocus].style.border = focusBorder
    screen.render()
  })

  screen.key(['escape', 'C-c'], (ch, key) => {
    return process.exit(0);
  })

  screen.on('resize', () => {
    init(log, currentChannel)
  })

  init(token, log, currentChannel)
}

function init(token, log, currentChannel) {
  log.clearItems()
  logHistory(token, log, currentChannel)
}
