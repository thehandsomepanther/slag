let slack = require('slack')

module.exports = function getChannels(token, gen) {
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
        channelTree
          .children['Group Messages'].children[group.name] = {'id': group.id}
        channelList[group.id] = group.name
      }

      slack.im.list({token}, (err, data) => {
        var ims = data.ims
        for (let im of ims) {
          channelTree
            .children['Direct Messages'].children[im.user] = {'id': im.id}
          channelList[im.id] = im.user
        }

        gen.next({
          'getChannels': [channelTree, channelList, currentChannel]
        })
      })
    })
  })
}
