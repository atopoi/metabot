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
  DO, DO_FOR, ALT, ALT_FOR, call, equals, exec, fail, filter, IF, map, succeed, succeedIf, guard,
  SET, GET, SWITCH, CASE, DEFAULT
} = require('../../../core/lang.js')

const { success, failure } = require('../../../core/outcome.js')

const { tt } = require('../../test-utils/action-tester.js')


const act = x => succeed(9 * x)

describe('then', () => {
  tt('should fail',
    succeed(12).then(fail()), true)

  tt('should succeed with second action',
    succeed(11).then(succeed(12)), false, 12)

  tt('should pass first action\'s results to action builder and succeed',
    succeed(11).then(act), false, 99)
})


const sx = succeed('x')
const sy = succeed('y')
const sz = succeed('z')

describe('do', () => {
  tt('should succeed if the only action succeeds',
    DO(sx), false, 'x')

  tt('should succeed if both actions succeed',
    DO(sx, sy), false, 'y')

  tt('should succeed if all actions succeed',
    DO(sx, sx, sy), false, 'y')

  tt('should succeed if all nested actions succeed',
    DO(DO(sx, sx), sy), false, 'y')

  tt('should apply the function in the second arg on first action\'s result',
    DO(succeed(1), x => x + 1), false, 2)

  tt('should bind the result of first action to the parameter of the second arg and apply the resulting action (monadic bind)',
    DO(succeed(1), act), false, 9)

  tt('should fail if one of the actions fails (then)',
    DO(sx, fail(), sy), true)

  tt('should fail if one of the actions fails (map)',
    DO(succeed(1), fail(), x => x + 1), true)

  tt('should fail if one of the actions fails (bind)',
    DO(succeed(1), fail(), act), true)

  tt('should fail if one of the actions fails after receiving the previous action result',
    DO(succeed('No!'), fail), true)
})


describe('guard', () => {
  /* eslint no-unused-vars: 0 */
  tt('should succeed: guard condition verified',
    guard(ctx => true), false, true)

  tt('should succeed: guard condition verified (predicate with non args)',
    guard(() => true), false, true)

  tt('should fail: guard condition fails',
    guard(() => false), true)

  tt('should fail: guard condition fails in a DO chain',
    DO(succeed(2), x => guard(() => x > 10), succeed(10)), true)

  tt('should succeed: guard condition verified in DO chain',
    DO(succeed(2), x => guard(() => x > 0), succeed(10)), false, 10)
})


describe('do_for', () => {
  tt('should succeed: all iterations succeed and return last iteration\'s result',
    DO_FOR([1, 2], act), false, 18)

  const list = [10, 20, 30]
  tt('should succeed: all iterations succeed, return last iteration\'s result',
    DO_FOR(list, succeedIf(x => x > 0)), false, 30)

  tt('should fail: second iteration fails',
    DO_FOR(list, succeedIf(x => x > 20)), true)

  tt('should succeed and return true no iterations',
    DO_FOR([], succeedIf(x => x > 20)), false, true)
})


describe('alt', () => {
  tt('should succeed if the 1st action succeeds',
    ALT(sx, sy), false, 'x')

  tt('should succeed if the 1st action fails but the 2nd action succeeds',
    ALT(fail(), sy), false, 'y')

  tt('should succeed with second action',
    ALT(fail(), sx, sy), false, 'x')

  tt('should succeed with second action',
    ALT(fail(), sx, fail()), false, 'x')

  tt('should fail as both actions fail',
    ALT(fail(), fail()), true)

  tt('should fail: unique failing clause',
    ALT(fail()), true)

  tt('should succeed: unique success clause',
    ALT(succeed(1)), false, 1)

  tt('should fail: no clause',
    ALT(), true)

  tt('should succeed on fifth clause',
    ALT(fail(), fail(), fail(), fail(), succeed(12)), false, 12)

  tt('should fail: all clauses fail',
    ALT(fail(), fail(), fail(), fail(), fail()), true)

  tt('should succeed if the context is passed from clause 1 to clause 2 even if clause 1 fails',
    DO(
      SET('a', 1),
      ALT(DO(SET('a', 2), fail()), succeed(true)),
      GET('a')
    ),
    false, 2)
})


describe('alt_for', () => {
  const list = [10, 20, 30]

  tt('should succeed on first element',
    ALT_FOR(list, succeedIf(x => x > 0)),
    false,
    10)

  tt('should succeed on second element',
    ALT_FOR(list, succeedIf(x => x > 15)),
    false,
    20)

  tt('should fail: failed for each element',
    ALT_FOR(list, succeedIf(x => x > 100)),
    true)

  tt('should fail: empty arg list',
    ALT_FOR([], succeedIf(x => x > 100)),
    true)
})


describe('switch', () => {
  tt('should be applicable on values',
    SWITCH('x', CASE('x', sx), CASE('y', sy)), false, 'x')

  tt('should apply the first matching case',
    SWITCH(SET('var', 'x'), CASE('x', sx), CASE('y', sy)), false, 'x')

  tt('should apply the second matching case',
    SWITCH(SET('var', 'y'), CASE('x', sx), CASE('y', sy)), false, 'y')

  tt('should apply the default case if there is no matching case',
    SWITCH(SET('var', 'z'), CASE('x', sx), CASE('y', sy), DEFAULT(sz)), false, 'z')

  tt('case should support multiple actions',
    SWITCH(SET('var', 'x'), CASE('x', sx, sy)), false, 'y')

  tt('should throw if there is no matching case and no default case',
    SWITCH(SET('var', 'z'), CASE('x', sx), CASE('y', sy)), true)
})


describe('if', () => {
  tt('should succeed if the predicate and on success action succeed',
    IF(sx, sx, sy), false, 'x')

  tt('should succeed if the predicate fails but the on failure action succeeds',
    IF(fail(), sx, sy), false, 'y')

  tt('should succeed if the predicate fails and the on success action fails',
    IF(fail(), fail(), sy), false, 'y')

  tt('should fail if the predicate succeeds but the on success action fails',
    IF(sx, fail(), sy), true)

  tt('should fail if the predicate fails and the on failure action fails',
    IF(fail(), sy, fail()), true)

  tt('should succeed if the predicate fails and the on failure action is not defined',
    IF(fail(), sy), false)

  tt('condition is true return first - result lifted to action',
    IF(true, sx, sy), false, 'x')

  tt('condition is false return second- result lifted to action',
    IF(false, sx, sy), false, 'x')
})


describe('map', () => {
  tt('should succeed and apply the function on the action result',
    map(x => `${x}y`, sx), false, 'xy')

  tt('should fail if the action fails',
    map(x => `${x}y`, fail()), true)
})


describe('filter', () => {
  tt('should succeed if the predicate applied to the action result returns true',
    filter(x => x > 10, succeed(12)), false, 12)

  tt('should fail if the predicate applied to the action result returns false',
    filter(x => x > 10, succeed(5)), true)

  tt('should fail if the action fails',
    filter(x => x > 10, fail()), true)

  tt('should succeed if the predicate applied to the previous action result returns true',
    DO(succeed(25), filter(x => x > 10)), false, 25)

  tt('should fail if the predicate applied to the previous action result returns false',
    DO(succeed(2), filter(x => x > 10)), true)
})


describe('equals', () => {
  tt('should succeed if the action result is equal to the specified value',
    equals(12, 12), false, 12)

  tt('should succeed if the action result is equal to the specified action result',
    equals(12, succeed(12)), false, 12)

  tt('should fail if the action result is not equal to the specified value',
    equals(10, 12), true)

  tt('should fail if the action result is not equal to the specified action result',
    equals(10, succeed(12)), true)
})


describe('exec', () => {
  tt('should succeed and return the function result',
    exec(() => 1 + 1), false, 2)
})


describe('call', () => {
  tt('should succeed if the context function succeeds',
    call(ctx => success(2, ctx)), false, 2)

  tt('should fail if the context function fails',
    call(ctx => failure('error', ctx)), true)
})
