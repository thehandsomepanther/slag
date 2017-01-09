# slack terminal client
this is way to send and receive messages to your slack teams in the terminal. i started this project because i used to do all my work on a late 2008 macbook and being in five active slack teams at once meant using the slack desktop or web app was a no go. even on a computer that can handle slack, though, it's sometimes nice to be able to talk to people from the terminal.

## what this client supports right now
- chatting (public channels, private channels, DMs, etc)
- slash-commands from slack's hidden api!!
- @- and #-mentions
- emoji 🙌🏽

## what this client doesn't support/has trouble supporting (as of right now)
- images/gifs (for obvious reasons)
- files and links (they get printed out, but if they're too long they can go off the screen)

## how to run:
```
npm install
npm start
```

you'll also need a `tokens.json` file in the root directory of this project containing all your slack tokens (you can get yours [here](https://api.slack.com/docs/oauth-test-tokens)), like so:
```
[
	{
		"team": "ATEAM",
		"token": "xoxp-***"
	},
	{
		"team": "ANOTHER_TEAM",
		"token": "xoxp-***"
	}
]

```


|Key  |Action|
|---	|---	|
|Tab  |Switch between channel tree and message input|
|Ctrl+T|Cycle through teams|
|Ctrl+C|Quit|
|Esc  |Quit|

## notes:
this project uses a json file generated by [jollygoodcode's emoji-keywords](https://github.com/jollygoodcode/emoji-keywords) to translate slack's `:emoji-code:` into unicode under the MIT license

## license
idk i guess we use the [MIT license](/license)
