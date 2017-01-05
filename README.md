# slack terminal client
this is way to send and receive messages to your slack teams in the terminal. i started this project because i used to do all my work on a late 2008 macbook and being in five active slack teams at once meant using the slack desktop or web app was a no go. even on a computer that can handle slack, though, it's sometimes nice to be able to talk to people from the terminal.

## what this client supports right now
- chatting (public channels, private channels, DMs, etc)
- slash-commands from slack's hidden api!!
- @- and #-mentions

## what this client doesn't support/has trouble supporting (as of right now)
- images/gifs (for obvious reasons)
- files and links (they get printed out, but if they're too long they can go off the screen)
- emoji 😥

to run:
```
npm install
node index.js
```

you'll also need a `.env` file in the root directory of this project containing a slack token (you can get one [here](https://api.slack.com/docs/oauth-test-tokens)), like so:
```
SLACK_TOKENS="XXXX"
```

you switch between multiple slack teams, too. all you need to do is include all your tokens in that `SLACK_TOKENS` variable, separated by spaces (e.g. `SLACK_TOKENS="XXXX XXXX"`).

|Key  |Action|
|---	|---	|
|Tab  |Switch between channel tree and message input|
|Ctrl+T|Cycle through teams|
|Ctrl+C|Quit|
|Esc  |Quit|

notes:
this client uses the [blessed](https://github.com/chjj/blessed) library to draw the screen as well as some components from [blessed-contrib](https://github.com/yaronn/blessed-contrib). there is a bug in the blessed-contrib tree widget that was fixed in [this pr](https://github.com/yaronn/blessed-contrib/pull/68) but reverted.
