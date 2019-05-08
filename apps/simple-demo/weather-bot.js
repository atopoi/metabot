/*
 * Copyright 2019 Nu Echo Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 *====================================
 * WeatherBot
 *====================================
 */

const {
  say,
  filter,
  DO,
  ALT,
  ON,
  CALL_SERVICE
} = require('../../core/lang.js')
const { ask } = require('../../core/patterns/ask.js')

const { Agent } = require('../../core/agent.js')
const { getInPath } = require('../../core/context.js')


// utils

const YahooWeatherURI = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22montreal%22)&u=c&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'


const farentheitToCelsius = val => Math.round((val - 32) * 5 / 9)

const dateRelativeIndex = {
  today: 0,
  now: 0,
  tomorrow: 1,
  'in 2 days': 2,
  'in two days': 2
}


const extractForecast = (yahooAnswer, day) => {
  const index = dateRelativeIndex[day.val.toLowerCase()] || 0
  const forecast = getInPath(yahooAnswer, ['query', 'results', 'channel', 'item', 'forecast', index])
  if (!forecast) return null
  const { high, low } = forecast
  forecast.high = farentheitToCelsius(parseInt(high, 10))
  forecast.low = farentheitToCelsius(parseInt(low, 10))
  return forecast
}


const showForecast = forecast => say(
  `
  Weather forecast
--------------------
${forecast.date}
${forecast.text}
Hi: ${forecast.high}C, Lo: ${forecast.low}C`
)


/* the bot itself */

const WeatherBot = new Agent(
  'WeatherBot',
  { icon: '⛱️' }
)

WeatherBot.tasks.main = DO(
  ON('help', say('You can get the forecast from Yahoo Weather for 3 days:\ntoday, tomorrow, in 2 days')),
  say('This is the weather bot!'),

  ask('Enter the day'),
  day => ALT(
    DO(
      say('Let me check...'),
      CALL_SERVICE(YahooWeatherURI),
      answer => extractForecast(answer, day),
      filter(x => x),
      showForecast
    ),
    say('Sorry, looks like the wethear service is down!!')
  ),

  say('Bye!')
)


module.exports = WeatherBot
