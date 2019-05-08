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

const {
  DO, fail, GET, LET, SET, succeed
} = require('../../../core/lang.js')

const { tt } = require('../../test-utils/action-tester.js')


describe('set', () => {
  tt('should succeed',
    SET('a.b', 12), false, 12)

  tt('should succeed and use the previous action result',
    DO(succeed(12), SET('a.b')), false, 12)
})


describe('get', () => {
  tt('should fail if key is not found in context',
    GET('a.b'), true)

  tt('should succeed and return object if key is found in context',
    DO(SET('a.b.c', 999), GET('a.b'), JSON.stringify),
    false,
    '{"c":999}')

  tt('should succeed and return value if key is found in context',
    DO(SET('a.b', 12), GET('a.b')), false, 12)

  tt('should succeed and use the previous action result',
    DO(succeed(12), SET('a.b'), GET('a.b')), false, 12)
})


describe('let', () => {
  tt('should succeed if the action succeeds',
    LET('a.b.c', succeed(12)), false, 12)

  tt('should succeed and use the previous action result',
    DO(succeed(12), LET('a.b.c')), false, 12)

  tt('should fail if the action fails',
    LET('a.b.c', fail()), true)

  tt('should succeed and return value if key is found in context',
    DO(succeed(12), LET('a.b'), GET('a.b')), false, 12)

  tt('should fail: try GET on a var outside the LET scope',
    DO(
      DO(
        LET('a.b.c', succeed(12)),
        GET('a.b.c'),
        fail()
      ),
      GET('a.b.c')
    ),
    true)

  // TODO: should be fixed in lang.js
  /*
     tt('should succeed: LET scoping',
      DO(
        LET('a.b', succeed(12)),
        DO(
          LET('a.b', succeed(99)),
          GET('a.b'),
          log,
          fail()
        ),
        GET('a.b')
      ),
      false,
      12
    )
     */
})
