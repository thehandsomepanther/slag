# slack terminal client
use slack in your terminal with an ncurses-style text-based gui.

## what this client supports right now
- chatting (public channels, private channels, DMs, etc)
- slash-commands from slack's hidden api!!
- @- and #-mentions
- emoji 🙌🏽

## what this client doesn't support/has trouble supporting (as of right now)
- images/gifs (for obvious reasons)
- files and links (they get printed out, but if they're too long they can go off the screen)

## how to run:
if you want to be able to run it from anywhere, make sure you have npm installed and run
```
npm install -g slag-cli
```
then type
```
slag
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


## how to contribute
clone this repo, then from inside the project directory run
```
npm install
```
and have at it. do the tokens thing too though.

## how to use
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
