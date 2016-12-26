# slack terminal client
to run:
```
npm install
node index.js
```

you'll also need a `.env` file in the root directory of this project containing a slack token (you can get one [here](https://api.slack.com/docs/oauth-test-tokens)), like so:
```
SLACK_TOKEN=XXXX
```

notes:
this client uses the [blessed](https://github.com/chjj/blessed) library to draw the screen as well as some components from [blessed-contrib](https://github.com/yaronn/blessed-contrib). there is a bug in the blessed-contrib tree widget that was fixed in [this pr](https://github.com/yaronn/blessed-contrib/pull/68) but reverted. 
