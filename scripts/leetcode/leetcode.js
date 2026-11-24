// Set to true to enable console log
const debug = false;

/*
  LeetCode 에서 제출하면 그 제출 번호를 받아, 채점이 끝나면 GraphQL 로 그 제출을 받아 맞은 풀이를 GitHub 에 올린다.
  제출 번호는 두 곳에서 알아챈다. 어느 쪽이 먼저 와도 한 제출은 한 번만 본다.
  - 제출 요청의 응답: 페이지에 넣은 submitwatch.js 가 fetch 를 지켜보고 postMessage 로 알린다 (LeetHub-3.0 의 interceptor.js 와 같은 방식).
  - 주소: 새 화면은 채점 결과와 함께 주소가 /problems/<문제>/submissions/<번호>/ 로 바뀐다.
    사이트의 페이지 이동은 새로 고침 없이 일어나 콘텐츠 스크립트가 다시 실행되지 않으므로, 주소가 바뀌는 것을 MutationObserver 로 알아챈다.
  채점이 끝나기 전이면 LEETCODE_RETRY_DELAYS 만큼 기다렸다가 다시 본다. 스스로 주기적으로 받지는 않는다.
  ponytail: leetcode.com 만 지원한다. leetcode.cn 은 GraphQL 스키마가 달라(submissionDetail, statusDisplay) 따로 만들어야 한다.
*/
const LEETCODE_SUBMISSION_MESSAGE = 'BaekjoonHub:leetcode-submission'; // submitwatch.js 의 MESSAGE_TYPE 과 같은 값
let observer;
let lastPath = null;
let queue = Promise.resolve(); // 한 번에 하나씩 처리한다
const watched = new Set(); // 이미 보기 시작한 제출 번호. 실패한 제출은 페이지를 새로 고치면 다시 본다

startLoader();

function startLoader() {
  injectPageScript('baekjoonhub-leetcode-submitwatch', 'scripts/leetcode/submitwatch.js');
  window.addEventListener('message', onMessage);
  observer = new MutationObserver(onPageChange);
  observer.observe(document.body, { childList: true, subtree: true });
  onPageChange();
}

function stopLoader() {
  window.removeEventListener('message', onMessage);
  observer.disconnect();
}

function onMessage(event) {
  if (event.source !== window || event.origin !== location.origin) return;
  const data = event.data;
  if (data?.type !== LEETCODE_SUBMISSION_MESSAGE || !Number.isSafeInteger(data.submissionId) || data.submissionId <= 0) return;
  watch(data.submissionId);
}

function onPageChange() {
  if (location.pathname === lastPath) return;
  lastPath = location.pathname;
  const submissionId = leetcodeSubmissionId(lastPath);
  if (!isNull(submissionId)) watch(submissionId);
}

/** 제출 하나를 보기 시작합니다. 이미 본 제출이면 아무것도 하지 않는다. */
function watch(submissionId) {
  if (watched.has(submissionId)) return;
  watched.add(submissionId);
  queue = queue.then(() => checkSubmission(submissionId, 0));
}

/** LeetCode GraphQL 에 질의합니다. 로그인 쿠키는 같은 출처라 함께 간다. */
async function leetcodeGraphql(query, variables) {
  const csrftoken = /(?:^|;\s*)csrftoken=([^;]+)/.exec(document.cookie)?.[1];
  const response = await fetch('/graphql/', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(csrftoken ? { 'x-csrftoken': csrftoken } : {}) },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`LeetCode 에서 정보를 받지 못했습니다 (${response.status})`);
  const { data, errors } = await response.json();
  if (errors?.length) throw new Error(errors[0].message);
  return data;
}

/**
 * 제출 하나를 받아, 맞은 풀이면 올립니다. reject 되지 않는다.
 * @param {number} submissionId
 * @param {number} retry - 채점 중이라 다시 본 횟수
 */
async function checkSubmission(submissionId, retry) {
  try {
    /* 확장이 갱신되어 컨텍스트가 무효가 되면 storage 접근이 계속 reject 된다 */
    if (!chrome.runtime?.id) {
      stopLoader();
      return;
    }
    if (!(await checkEnable())) return;
    if (isNull(await getToken()) || isNull(await getHook())) {
      log('GitHub 저장소가 연결되어 있지 않아 올리지 않습니다');
      return;
    }
    let details;
    try {
      details = (await leetcodeGraphql(LEETCODE_SUBMISSION_QUERY, { submissionId })).submissionDetails;
    } catch (error) {
      /* 채점 중인 제출에 오류로 답할 수도 있다 */
      log('제출을 받지 못해 다시 봅니다', error);
    }
    /* 채점이 끝나기 전에는 제출이 없거나 결과가 비어 있다 */
    if (typeof details?.statusCode !== 'number' || isNull(details.code)) {
      if (retry < LEETCODE_RETRY_DELAYS.length) {
        setTimeout(() => {
          queue = queue.then(() => checkSubmission(submissionId, retry + 1));
        }, LEETCODE_RETRY_DELAYS[retry]);
      } else console.error('[BaekjoonHub] LeetCode 의 제출을 받지 못했습니다.', submissionId);
      return;
    }
    if (!isLeetcodeUploadable(details, Date.now())) {
      log('정답이 아니거나 오래된 제출이라 올리지 않습니다', submissionId, details.statusCode);
      return;
    }
    await uploadSubmission(details);
  } catch (error) {
    console.error('[BaekjoonHub] LeetCode 의 제출을 확인하지 못했습니다.', error);
  }
}

/**
 * 맞은 제출 하나를 GitHub 에 올리고 토스트로 알립니다. reject 되지 않는다.
 * @param {object} details - submissionDetails
 */
async function uploadSubmission(details) {
  try {
    const { question } = await leetcodeGraphql(LEETCODE_QUESTION_QUERY, { titleSlug: details.question.titleSlug });
    if (isNull(question)) throw new Error('문제 정보를 받지 못했습니다');
    const bojData = await makeLeetcodeData(details, question);
    log('bojData', bojData);
    await uploadUnlessSame(bojData, (branches, directory, committed) => {
      if (committed) new Toast(`LeetCode ${bojData.problemId}번 풀이를 GitHub 에 올렸습니다.`, ToastType.Succes, 5000);
    });
  } catch (error) {
    console.error('[BaekjoonHub] LeetCode 업로드 중 오류가 발생했습니다.', error);
    const reason = error?.name === 'TokenExpiredError' ? 'GitHub 토큰이 만료되었습니다. BaekjoonHub 설정에서 다시 로그인해 주세요.' : error?.message || `${error}`;
    Toast.raiseToast(`LeetCode 풀이를 GitHub 에 올리지 못했습니다: ${reason}`);
  }
}
