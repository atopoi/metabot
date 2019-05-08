# Running

To start a bot, make sure your environment is properly setup.

In the project root folder, run the following command:

    yarn launch -Dlauncher.bot=_botName_ -Dlauncher.transports=_transports_

Here, _botModule_ is the bot name. A folder of that name must exist in the `apps` folder of the project.
_transports_ is a comma-separated list of transport mechanism for interacting with your bot. It defaults to `ws`.

Examples are:

  - `ws` for starting a web server for the debugging interface
  - `slack` for exposing your bot as the `metabot` slack user (Nu Echo team)
  - `slackgw` for connecting your bot to the Slack gateway
  - `web` for exposing your bot as webhooks (experimental)

For example:

    yarn launch -Dlauncher.bot=simple-demo -Dlauncher.transports=ws,slack

will start the web server. You just have to open your browser at `http://localhost:8001/index.html`.

## Configuration

The global configuration is set in  `core/config/global.js`. To override some configuration elements for a specific environment, define a file `_env_.js` in the `core/config` directory. There are already some configuration files for `dev`, `test`, `staging`, and `prod` environments. To use the configuration file, just define the `ENV` environment variable:

    ENV=prod node launcher.js

Configuration elements can also overriden on the command-line using the `-D` option:

    ENV=prod yarn launch -D_configElement_=_value_ ...

## Logging

Transports use the logging service defined in `core/logging.js`. It is currently using the `bunyan` npm library. As all log entries are in JSON format, use the `bunyan` tool to format it in human-readable way. This tool is located in `node_modules/.bin/bunyan`. It is best to add it to your path. On Unix/Linux:

    cd metabot
    export PATH=$PATH:`pwd`/node_modules/.bin

    yarn launch -Dlauncher.bot=simple-demo -Dlauncher.transport=slackgw | bunyan

## Unit Tests

To run Jest unit tests, execute the following command:

    ENV=test yarn test