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

    gen.next({
      'getChannels': [channelTree, channelList, currentChannel]
    })
  })
}
