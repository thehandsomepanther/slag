let slackLog = require('../../lib/widget/slackLog')
let _ = require('lodash')
let fs = require('fs')
let path = require('path')
let {border, focusBorder} = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json'), { encoding: 'utf-8' }))

const log = function (teamData) {
  this.grid = grid.set(0, 4, 11, 8, slackLog, {
    label: `#${teamData.channelList[teamData.currentChannel].name}`,
    tags: true,
    scrollable: true,
    teamData: teamData
  })
  this.grid.style.border = border
}

module.exports = log