let blessed = require('blessed')
let contrib = require('blessed-contrib')
let slack = require('slack')
let env = require('node-env-file')
env(__dirname + '/.env')

let bot = slack.rtm.client()
let token = process.env.SLACK_TOKEN

bot.listen({token})

let screen = blessed.screen()
let grid = new contrib.grid({
  rows: 12, cols: 12, screen: screen
})

let channelTree = {}
let channelList = {}
let userList = {}
let currentChannel = ''
let lastMessager = ''

let border = {type: "line", fg: "cyan"}
let focusBorder = {type: "line", fg: "green"}

function getChannels() {
  channelTree = {
    extended: true,
    children: {
      'Your Channels': {
        extended: true,
        children: {

        }
      },
      'Other Channels': {
        extended: false,
        children: {

        }
      }
    }
  }

  slack.channels.list({token}, (err, data) => {
    for (var channel in data.channels) {
      channel = data.channels[channel]
      channelTree
        .children[channel.is_member ? 'Your Channels' : 'Other Channels']
        .children[channel.name] = {'id': channel.id}
      channelList[channel.id] = channel.name

      if (channel.is_general) {
        currentChannel = channel.id
      }
    }

    getUsers()
  })
}

function getUsers() {
  slack.users.list({token}, (err, data) => {
    for (var user in data.members) {
      user = data.members[user]
      if (user.real_name) {
        userList[user.id] = user.real_name
      } else {
        userList[user.id] = user.name
      }
    }

    getMessages()
  })
}

function getMessages() {
  prepareScreen()
}

function prepareScreen() {
  var log = grid.set(0, 4, 11, 8, contrib.log, {
    border: border,
    fg: "green",
    label: `#${channelList[currentChannel]}`,
    tags: true,
    scrollable: true
  })

  bot.message((message) => {
    if (message.channel == currentChannel) {
      if (message.user != lastMessager) {
        log.log(userList[message.user])
        lastMessager = message.user
      }
      log.log(`{white-fg}${message.text}{/white-fg}`)
    }
  })

  var input = grid.set(11, 4, 1.5, 8, blessed.textbox, {
    keys: true,
    label: `Message #${channelList[currentChannel]}`,
    border: border
  })

  input.on('submit', (data) => {
    var message = input.getValue()
    input.clearValue()
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
    fg: 'green',
    label: 'Channels',
    tags: true,
    border: border
  })

  tree.on('select', (node) => {
    if (node.children == undefined && node.id != currentChannel) {
      currentChannel = node.id
      input.setLabel(`Message #${channelList[currentChannel]}`)
      log.setLabel(`#${channelList[currentChannel]}`)
      log.clearItems()
      lastMessager = ''
    }

    screen.render()
  })

  tree.setData(channelTree)

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
  });

  screen.render()
}

getChannels()
