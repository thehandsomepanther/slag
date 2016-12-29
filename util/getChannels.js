let slack = require('slack')
let _ = require('lodash')

module.exports = function getChannels(token, userList, cb) {
  var token = token
  let currentChannel = ''
  let channelList = {}
  let channelTree = {
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
      },
      'Group Messages': {
        extended: false,
        children: {

        }
      },
      'Direct Messages': {
        extended: false,
        children: {

        }
      }
    }
  }

  slack.channels.list({token}, (err, data) => {
    var channels = data.channels
    for (let channel of channels) {
      channelTree
        .children[channel.is_member ? 'Your Channels' : 'Other Channels']
        .children[channel.name] = {'id': channel.id}
      channelList[channel.id] = channel.name

      if (channel.is_general) {
        currentChannel = channel.id
      }
    }

    slack.groups.list({token}, (err, data) => {
      var groups = data.groups
      for (let group of groups) {
        if (group.name.substring(0, 4) == "mpdm") {
          let name = _.replace(group.name, 'mpdm', '')
          let groupReg = /(-([^-]*)-)/g
          let match
          while (match = groupReg.exec(name)) {
            name = _.replace(name, match[0], `${match[2]}, `)
          }

          group.name = name.substring(0, name.length-3)
        }

        channelTree
          .children['Group Messages'].children[group.name] = {'id': group.id}
        channelList[group.id] = group.name
      }

      slack.im.list({token}, (err, data) => {
        var ims = data.ims
        for (let im of ims) {
          channelTree
            .children['Direct Messages'].children[userList[im.user]] = {'id': im.id}
          channelList[im.id] = userList[im.user]
        }

        cb([channelTree, channelList, currentChannel])
      })
    })
  })
}
