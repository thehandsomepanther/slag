var tiny = require('tiny-json-http');

function chatcommand(params, callback) {
  tiny.post({
    url: 'https://slack.com/api/chat.command',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: params
  }, function _res(err, res) {
    if (err) console.log(err)
  });
}

module.exports = chatcommand
