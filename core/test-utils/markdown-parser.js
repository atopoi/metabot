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
 *================================
 * Markdown parser
 *================================
 */

const parseMarkdown = testSuitesMarkdown => {
  const fileLines = testSuitesMarkdown.split('\n')

  const testSuites = []
  let currentTestSuite
  let currentTest

  let text
  fileLines.forEach(line => {
    text = line.trim()

    if (text === '') {
      // do nothing
    } else if (text.startsWith('# ')) { // Test suite name
      currentTestSuite = {
        name: text.slice(2),
        tests: []
      }
      testSuites.push(currentTestSuite)
    } else if (text.startsWith('## ')) { // Test name
      currentTest = {
        name: text.slice(3),
        exchanges: []
      }
      currentTestSuite.tests.push(currentTest)
    } else if (text.startsWith('> ')) { // Fragment/test name
      const testName = text.slice(2)
      const importedTest = findTestByName(testName, currentTestSuite, testSuites)

      // Merge or concat exchanges
      if (currentTest.exchanges.length > 0 && importedTest.exchanges[0].input === null) {
        const currentExchange = currentTest.exchanges[currentTest.exchanges.length - 1]
        const matchingTestOutput = importedTest.exchanges[0].expectedOutput
        currentExchange.expectedOutput = currentExchange.expectedOutput.concat(matchingTestOutput)
        currentTest.exchanges = currentTest.exchanges.concat(importedTest.exchanges.slice(1))
      } else {
        currentTest.exchanges = currentTest.exchanges.concat(importedTest.exchanges)
      }
    } else if (['* *start*', '* *continue*'].includes(text)) {
      currentTest.exchanges.push({ input: null, expectedOutput: [] })
    } else if (text.startsWith('* ')) { // Input
      currentTest.exchanges.push({ input: text.slice(2), expectedOutput: [] })
    } else if (text.startsWith('- ')) { // Output
      const output = text.slice(2)
      const currentExchange = currentTest.exchanges[currentTest.exchanges.length - 1]
      currentExchange.expectedOutput.push(output)
    } else { // Multiline output
      const currentExchange = currentTest.exchanges[currentTest.exchanges.length - 1]
      const expectedOutput = currentExchange.expectedOutput
      expectedOutput[expectedOutput.length - 1] += `\n${text}`
    }
  })

  // Remove "Fragments" from test suites (fragments shouldn't be tested individually)
  if (testSuites[0].name === 'Fragments') return testSuites.slice(1)

  return testSuites
}

const findTestByName = (testName, currentTestSuite, testSuites) => {
  const testFilter = test => test.name === testName

  // Look for a matching test in the current test suite first
  let matchingTest = currentTestSuite.tests.find(testFilter)
  // If no test was found, look for a matching test in all test suites
  if (matchingTest === undefined) {
    // eslint-disable-next-line no-restricted-syntax
    for (const testSuite of testSuites) {
      matchingTest = testSuite.tests.find(testFilter)
      if (matchingTest) return matchingTest
    }
    throw Error(`Did not find test or fragment with name ${testName}`)
  }

  return matchingTest
}

module.exports = { parseMarkdown }
