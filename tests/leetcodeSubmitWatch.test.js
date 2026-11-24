'use strict';

// scripts/leetcode/submitwatch.js 는 LeetCode 페이지 컨텍스트에서 fetch 를 감싸, 제출 응답의 submission_id 를 postMessage 로 알린다.
// 가짜 window 에 로드해: 제출 요청만 알리고, 사이트가 받는 응답은 그대로이며, 두 번 넣어도 한 번만 감싸는지 본다.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SOURCE = fs.readFileSync(path.join(__dirname, '..', 'scripts/leetcode/submitwatch.js'), 'utf8');
const ORIGIN = 'https://leetcode.com';

function setup(responder) {
  const posted = [];
  const calls = [];
  const sandbox = {
    URL,
    Request,
    Number,
    location: { href: `${ORIGIN}/problems/two-sum/description/`, origin: ORIGIN },
    postMessage: (message, origin) => posted.push({ message, origin }),
    fetch: async (input, init) => {
      calls.push([input, init]);
      return responder(input, init);
    },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(SOURCE, sandbox);
  return { sandbox, posted, calls };
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

test('제출(POST /problems/<문제>/submit/)의 응답에서 제출 번호를 알리고, 사이트는 같은 응답 본문을 읽는다', async () => {
  const { sandbox, posted } = setup(() => json({ submission_id: 1234567890 }));
  const response = await sandbox.fetch('/problems/two-sum/submit/', { method: 'POST', body: '{}' });
  assert.deepEqual(await response.json(), { submission_id: 1234567890 });
  await flush();
  assert.deepEqual(JSON.parse(JSON.stringify(posted)), [{ message: { type: 'BaekjoonHub:leetcode-submission', submissionId: 1234567890 }, origin: ORIGIN }]);
});

test('Request 객체로 보낸 제출도 알아챈다', async () => {
  const { sandbox, posted } = setup(() => json({ submission_id: 7 }));
  await sandbox.fetch(new Request(`${ORIGIN}/problems/two-sum/submit/`, { method: 'POST', body: '{}' }));
  await flush();
  assert.equal(posted[0]?.message.submissionId, 7);
});

test('제출이 아닌 요청, 실행(interpret_solution), 실패한 제출, 번호 없는 응답은 알리지 않는다', async () => {
  const { sandbox, posted } = setup((input) => (`${input}`.includes('fail') ? json({ error: 'x' }, 429) : json({ submission_id: 'abc', interpret_id: 'r1' })));
  await sandbox.fetch('/graphql/', { method: 'POST', body: '{}' });
  await sandbox.fetch('/problems/two-sum/interpret_solution/', { method: 'POST', body: '{}' });
  await sandbox.fetch('/problems/two-sum/submit/'); // GET
  await sandbox.fetch('/problems/fail/submit/', { method: 'POST' });
  await sandbox.fetch('/problems/two-sum/submit/', { method: 'POST' }); // submission_id 가 숫자가 아니다
  await sandbox.fetch('https://evil.example/problems/two-sum/submit/', { method: 'POST' });
  await flush();
  assert.deepEqual(posted, []);
});

test('두 번 넣어도 fetch 를 한 번만 감싼다', async () => {
  const { sandbox, posted, calls } = setup(() => json({ submission_id: 5 }));
  vm.runInContext(SOURCE, sandbox);
  await sandbox.fetch('/problems/two-sum/submit/', { method: 'POST' });
  await flush();
  assert.equal(calls.length, 1);
  assert.equal(posted.length, 1);
});
