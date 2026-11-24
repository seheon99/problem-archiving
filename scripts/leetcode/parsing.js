/*
  LeetCode 의 제출을 읽어 업로드할 데이터로 만드는 함수의 모음입니다.
  코드·언어·성능은 submissionDetails, 번호·제목·난이도·태그는 question 을 GraphQL(/graphql) 로 받습니다.
  (필드 이름은 LeetCode 웹이 쓰는 것과 같다. 2026-11-24 에 LeetHub-3.0 의 질의와 맞춰 보았다)
*/

const LEETCODE_SUBMISSION_QUERY = `query submissionDetails($submissionId: Int!) {
  submissionDetails(submissionId: $submissionId) {
    runtimeDisplay runtimePercentile memoryDisplay memoryPercentile
    code timestamp statusCode notes
    lang { name verboseName }
    question { titleSlug }
  }
}`;

const LEETCODE_QUESTION_QUERY = `query questionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId title titleSlug difficulty
    topicTags { name }
  }
}`;

/**
 * 주소에서 제출 번호를 읽습니다. 새 화면은 제출하면 /problems/<문제>/submissions/<번호>/ 로 옮겨 가고,
 * 예전 화면의 제출 상세는 /submissions/detail/<번호>/ 다.
 * @param {string} pathname
 * @returns {(number|null)}
 */
function leetcodeSubmissionId(pathname) {
  const match = /^\/(?:problems\/[^/]+\/submissions|submissions\/detail)\/(\d+)\/?$/.exec(pathname);
  return match ? Number(match[1]) : null;
}

/**
 * 올릴 제출인지 봅니다: 정답이고, 코드가 있고, 최근에 낸 것.
 * @param {object} details - submissionDetails
 * @param {number} now - 지금 시각 (ms)
 * @returns {boolean}
 */
function isLeetcodeUploadable(details, now) {
  return details?.statusCode === LEETCODE_ACCEPTED && isNotEmpty(details.code) && now - Number(details.timestamp) * 1000 < LEETCODE_FRESH_MS;
}

/**
 * 제출 하나를 업로드할 데이터로 만듭니다.
 * README 에 문제 본문은 싣지 않는다. 지문의 권리는 LeetCode 에 있고, 프리미엄 문제도 있기 때문이다.
 * @param {object} details - submissionDetails
 * @param {object} question - question(titleSlug)
 * @returns {Promise<{problemId, directory, message, fileName, readme, code}>}
 */
async function makeLeetcodeData(details, question) {
  const problemId = `${question.questionFrontendId}`;
  const { title, titleSlug } = question;
  const safeTitle = convertSingleCharToDoubleChar(title);
  const level = question.difficulty || 'Unrated';
  const [language, extension] = leetcodeLanguage(details.lang);
  /* percentile 은 '이 풀이보다 느린(무거운) 제출의 비율' 이다 (화면의 Beats …%) */
  const percent = (value) => (typeof value === 'number' ? ` (Beats ${value.toFixed(2)}%)` : '');
  const time = `${details.runtimeDisplay}${percent(details.runtimePercentile)}`;
  const memory = `${details.memoryDisplay}${percent(details.memoryPercentile)}`;
  const tags = (question.topicTags || []).map((tag) => tag.name).join(', ');
  const directory = await buildDirectory('leetcode', {
    platform: 'LeetCode',
    level,
    id: problemId,
    title: safeTitle,
    language,
    _defaultDir: `LeetCode/${level}/${problemId}. ${safeTitle}`,
  });
  const message = `[${level}] Title: ${title}, Time: ${details.runtimeDisplay}, Memory: ${details.memoryDisplay} -BaekjoonHub`;
  const fileName = `${safeTitle}.${extension}`;
  // prettier-ignore
  const readme =
    `# [${level}] ${title} - ${problemId} \n\n`
    + `[문제 링크](https://leetcode.com/problems/${titleSlug}/) \n\n`
    + `### 성능 요약\n\n메모리: ${memory}, 시간: ${time}\n\n`
    + (tags ? `### 분류\n\n${tags}\n\n` : '')
    + `### 제출 일자\n\n${getDateString(new Date(Number(details.timestamp) * 1000))}\n\n`
    + (isNotEmpty(details.notes?.trim()) ? `### 메모\n\n${details.notes.trim()}\n\n` : '')
    + `> 출처: LeetCode, https://leetcode.com/`;
  return { problemId, directory, message, fileName, readme, code: details.code };
}
