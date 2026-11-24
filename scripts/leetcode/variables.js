/* LeetCode 번들의 전역 변수 선언 파일입니다. */

/* submissionDetails 의 statusCode 가 이 값이면 정답(Accepted)이다 */
const LEETCODE_ACCEPTED = 10;

/* 채점 중인 제출의 statusCode. 코드는 이미 채워져 있고, 1초 남짓 뒤 결과 코드로 바뀐다 (2026-11-24 에 확인) */
const LEETCODE_JUDGING = 16;

/* 이 시간 안에 낸 제출만 올린다(ms). 예전 제출 페이지를 다시 열었을 때 옛 풀이를 올리지 않기 위해서다. */
const LEETCODE_FRESH_MS = 60 * 60 * 1000;

/* 제출 번호를 알았는데 채점이 아직 끝나지 않았을 때 다시 보기까지 기다리는 시간(ms). 제출 직후부터 약 30초까지 본다. */
const LEETCODE_RETRY_DELAYS = [2000, 3000, 5000, 8000, 13000];

/* LeetCode 언어 코드(submissionDetails 의 lang.name) → [언어 폴더 이름, 확장자] */
const leetcodeLanguages = {
  cpp: ['C++', 'cpp'],
  java: ['Java', 'java'],
  python: ['Python', 'py'],
  python3: ['Python', 'py'],
  pythondata: ['Pandas', 'py'],
  c: ['C', 'c'],
  csharp: ['C#', 'cs'],
  javascript: ['JavaScript', 'js'],
  typescript: ['TypeScript', 'ts'],
  php: ['PHP', 'php'],
  swift: ['Swift', 'swift'],
  kotlin: ['Kotlin', 'kt'],
  dart: ['Dart', 'dart'],
  golang: ['Go', 'go'],
  ruby: ['Ruby', 'rb'],
  scala: ['Scala', 'scala'],
  rust: ['Rust', 'rs'],
  racket: ['Racket', 'rkt'],
  erlang: ['Erlang', 'erl'],
  elixir: ['Elixir', 'ex'],
  bash: ['Bash', 'sh'],
  mysql: ['MySQL', 'sql'],
  mssql: ['MS SQL Server', 'sql'],
  oraclesql: ['Oracle', 'sql'],
  postgresql: ['PostgreSQL', 'sql'],
};

/**
 * @param {{name?: string, verboseName?: string}} lang - submissionDetails 의 lang
 * @returns {[string, string]} [언어 폴더 이름, 확장자]. 표에 없는 언어는 화면 표기를 이름으로 하고 .txt 로 올린다
 */
function leetcodeLanguage(lang) {
  const name = lang?.name;
  if (Object.prototype.hasOwnProperty.call(leetcodeLanguages, name)) return leetcodeLanguages[name];
  return [`${lang?.verboseName ?? name ?? 'Unknown'}`, 'txt'];
}
