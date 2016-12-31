var tiny = require('tiny-json-http');

function chatcommand(params, callback) {
  tiny.post({
    url: 'https://slack.com/api/chat.command',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    // data: {
    //   "command": "/poll",
    //   "text": '"Is this a poll" "yes" "no"',
    //   "channel": "C3JMN3PV0",
    //   "token": "xoxs-2760808644-4505629756-122486930502-d2d6fb9e07"
    // }
    data: params
  }, function _res(err, res) {
    if (err) console.log(err)
    console.log(res)
  });
}

module.exports = chatcommand
