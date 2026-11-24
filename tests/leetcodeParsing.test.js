'use strict';

// LeetCode 풀이는 GraphQL 의 submissionDetails·question 으로 만든다.
// 실제 parsing.js 를 vm 에 로드해, 제출 번호를 읽는 주소, 올릴 제출을 고르는 기준, 업로드 데이터(README·경로·커밋 메시지)를 확인한다.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ console: { warn() {} }, buildDirectory: async (platform, variables) => variables._defaultDir });
for (const file of ['scripts/util.js', 'scripts/leetcode/variables.js', 'scripts/leetcode/parsing.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
}
context.getDateString = (date) => `DATE ${date.getTime()}`; // util.js 가 선언한 뒤에 바꾼다

const U = String.fromCodePoint(0x2005); // 제목의 공백은 폴더·파일 이름에서 FOUR-PER-EM SPACE 가 된다
const NOW = Date.parse('2026-11-24T12:00:00.000Z');
const DETAILS = {
  runtimeDisplay: '3 ms',
  runtimePercentile: 98.5,
  memoryDisplay: '18.1 MB',
  memoryPercentile: 42,
  code: 'class Solution:\n    def twoSum(self, nums, target):\n        pass\n',
  timestamp: Math.floor(NOW / 1000) - 60,
  statusCode: 10,
  notes: '',
  lang: { name: 'python3', verboseName: 'Python3' },
  question: { titleSlug: 'two-sum' },
};
const QUESTION = { questionFrontendId: '1', title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', topicTags: [{ name: 'Array' }, { name: 'Hash Table' }] };

test('제출 번호는 새 화면과 예전 화면의 제출 주소에서만 읽는다', () => {
  assert.equal(context.leetcodeSubmissionId('/problems/two-sum/submissions/1234567890/'), 1234567890);
  assert.equal(context.leetcodeSubmissionId('/submissions/detail/42/'), 42);
  assert.equal(context.leetcodeSubmissionId('/problems/two-sum/submissions/'), null);
  assert.equal(context.leetcodeSubmissionId('/problems/two-sum/description/'), null);
});

test('채점 결과를 묻는 요청의 주소에서 제출 번호를 읽는다', () => {
  assert.equal(context.leetcodeCheckSubmissionId('/submissions/detail/2202544612/v2/check/'), 2202544612);
  assert.equal(context.leetcodeCheckSubmissionId('/submissions/detail/42/check/'), 42);
  assert.equal(context.leetcodeCheckSubmissionId('/submissions/detail/42/'), null);
  assert.equal(context.leetcodeCheckSubmissionId('/problems/two-sum/submit/'), null);
});

test('정답이고 최근에 낸 제출만 올린다', () => {
  assert.equal(context.isLeetcodeUploadable(DETAILS, NOW), true);
  assert.equal(context.isLeetcodeUploadable({ ...DETAILS, statusCode: 11 }, NOW), false); // Wrong Answer
  assert.equal(context.isLeetcodeUploadable({ ...DETAILS, timestamp: Math.floor(NOW / 1000) - 2 * 3600 }, NOW), false);
  assert.equal(context.isLeetcodeUploadable({ ...DETAILS, code: '' }, NOW), false);
  assert.equal(context.isLeetcodeUploadable(null, NOW), false);
  assert.equal(context.isLeetcodeUploadable({ ...DETAILS, statusCode: 16 }, NOW), false); // 채점 중
});

test('채점 중(16)이거나 결과가 비었으면 채점이 끝나지 않은 것으로 본다', () => {
  assert.equal(context.isLeetcodeJudging({ ...DETAILS, statusCode: 16, runtimeDisplay: 'N/A' }), true);
  assert.equal(context.isLeetcodeJudging({ ...DETAILS, code: null }), true);
  assert.equal(context.isLeetcodeJudging(null), true);
  assert.equal(context.isLeetcodeJudging(DETAILS), false);
  assert.equal(context.isLeetcodeJudging({ ...DETAILS, statusCode: 11 }), false); // Wrong Answer 는 끝난 결과
});

test('업로드 데이터: 난이도 폴더, 제목 파일, 성능·분류가 담긴 README (문제 본문은 싣지 않는다)', async () => {
  const data = await context.makeLeetcodeData({ ...DETAILS, notes: '  해시맵으로 한 번에  ' }, QUESTION);
  assert.equal(data.problemId, '1');
  assert.equal(data.directory, `LeetCode/Easy/1. Two${U}Sum`);
  assert.equal(data.fileName, `Two${U}Sum.py`);
  assert.equal(data.code, DETAILS.code);
  assert.equal(data.message, '[Easy] Title: Two Sum, Time: 3 ms, Memory: 18.1 MB -BaekjoonHub');
  assert.match(data.readme, /^# \[Easy\] Two Sum - 1 /);
  assert.ok(data.readme.includes('(https://leetcode.com/problems/two-sum/)'));
  assert.ok(data.readme.includes('메모리: 18.1 MB (Beats 42.00%), 시간: 3 ms (Beats 98.50%)'));
  assert.ok(data.readme.includes('### 분류\n\nArray, Hash Table'));
  assert.ok(data.readme.includes(`DATE ${DETAILS.timestamp * 1000}`));
  assert.ok(data.readme.includes('### 메모\n\n해시맵으로 한 번에\n\n'));
});

test('메모·분류가 없으면 그 절을 빼고, 제목의 특수문자는 전각으로 바꾼다', async () => {
  const data = await context.makeLeetcodeData({ ...DETAILS, notes: null, lang: { name: 'cpp', verboseName: 'C++' } }, { ...QUESTION, title: 'Pow(x, n)', topicTags: [] });
  assert.equal(data.fileName, `Pow（x，${U}n）.cpp`);
  assert.ok(!data.readme.includes('### 메모'));
  assert.ok(!data.readme.includes('### 분류'));
});

test('언어: 표에 있는 코드는 폴더·확장자로, 모르는 언어는 화면 표기와 .txt 로', () => {
  assert.deepEqual([...context.leetcodeLanguage({ name: 'golang', verboseName: 'Go' })], ['Go', 'go']);
  assert.deepEqual([...context.leetcodeLanguage({ name: 'mysql', verboseName: 'MySQL' })], ['MySQL', 'sql']);
  assert.deepEqual([...context.leetcodeLanguage({ name: 'cangjie', verboseName: 'Cangjie' })], ['Cangjie', 'txt']);
  assert.deepEqual([...context.leetcodeLanguage({ name: 'constructor' })], ['constructor', 'txt']);
});
