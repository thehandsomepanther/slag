let slack = require('slack')
let _ = require('lodash')
let errors = require('../errors')

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
    if (err) {
      throw new errors.ExternalResourceError('Unable to retrieve your channels from Slack')
    }

    var channels = data.channels
    for (let channel of channels) {
      slack.channels.info({ token, channel: channel.id }, (err, data) => {
        channel = data.channel
        let belongsTo = channel.is_member ? 'Your Channels' : 'Other Channels'

        channelTree
          .children[belongsTo]
<<<<<<< HEAD
          .children[channel.unread_count > 0 ? `${channel.name} *` : channel.name] = { id: channel.id, unread_count: channel.unread_count, last_read: channel.last_read }
        
=======
          .children[channel.name] =
            {
              'name': channel.unread_count > 0 ? `${channel.name} *` : channel.name,
              'id': channel.id,
              'unread_count': channel.unread_count
            }

>>>>>>> d43ae31741a75dd6c9cfbf8265c19c16fff99590
        channelList[channel.id] = {name: channel.name, belongsTo: belongsTo}

        if (channel.is_general) {
          currentChannel = channel.id
        }
      })
    }

    slack.groups.list({token}, (err, data) => {
      var groups = data.groups
      for (let group of groups) {
        slack.groups.info({token, channel: group.id}, (err, data) => {
          group = data.group
          let belongsTo = 'Group Messages'
          if (group.name.substring(0, 4) == "mpdm") {
            let name = _.replace(group.name, 'mpdm', '')
            let groupReg = /(-([^-]*)-)/g
            let match
            while (match = groupReg.exec(name)) {
              name = _.replace(name, match[0], `${match[2]}, `)
            }

            group.name = name.substring(0, name.length-3)
          }

<<<<<<< HEAD
        channelTree
          .children['Group Messages'].children[group.name] = {id: group.id}
        channelList[group.id] = {name: group.name, belongsTo: 'Group Messages'}
=======
          channelTree
            .children[belongsTo]
            .children[group.name] = {
              'name': group.unread_count > 0 ? `${group.name} *` : group.name,
              'id': group.id
            }
          channelList[group.id] = {name: group.name, belongsTo: belongsTo}
        })
>>>>>>> d43ae31741a75dd6c9cfbf8265c19c16fff99590
      }

      slack.im.list({token}, (err, data) => {
        var ims = data.ims
        for (let im of ims) {
          channelTree
            .children['Direct Messages'].children[userList[im.user]] = {id: im.id}
          channelList[im.id] = {name: userList[im.user], belongsTo: 'Direct Messages'}
        }

        cb([channelTree, channelList, currentChannel])
      })
    })
  })
}
