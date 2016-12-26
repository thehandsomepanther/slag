let slack = require('slack')

env(__dirname + '/.env')
let bot = slack.rtm.client()

bot.listen({token})
