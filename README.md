# slack terminal client
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
