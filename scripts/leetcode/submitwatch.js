/* LeetCode 의 제출 요청을 지켜보는 스크립트. 로더(leetcode.js)가 <script> 요소로 페이지에 넣어 페이지 컨텍스트에서 돈다.
   확장 스크립트(격리된 세계)는 페이지가 부르는 fetch 를 볼 수 없기 때문이다.
   제출(POST /problems/<문제>/submit/)의 응답에서 제출 번호(submission_id)를 읽어 postMessage 로 로더에 알리기만 한다.
   요청은 바꾸지 않고, 응답은 복제본을 읽는다.
   ponytail: fetch 만 감싼다. LeetCode 가 제출을 XMLHttpRequest 로 보내게 되면 그쪽도 감싸야 한다. */
(function () {
  'use strict';

  const MESSAGE_TYPE = 'BaekjoonHub:leetcode-submission'; // leetcode.js 의 LEETCODE_SUBMISSION_MESSAGE 와 같은 값
  const SUBMIT_PATH = /^\/problems\/[^/]+\/submit\/?$/;

  if (window.__baekjoonHubLeetcodeWatch) return; // 두 번 넣어도 한 번만 감싼다
  window.__baekjoonHubLeetcodeWatch = true;

  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    const promise = originalFetch.apply(this, arguments);
    try {
      const url = new URL(input instanceof Request ? input.url : `${input}`, location.href);
      const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
      if (url.origin === location.origin && method === 'POST' && SUBMIT_PATH.test(url.pathname)) {
        promise
          .then((response) => (response.ok ? response.clone().json() : null))
          .then((data) => {
            const submissionId = Number(data?.submission_id);
            if (Number.isSafeInteger(submissionId) && submissionId > 0) window.postMessage({ type: MESSAGE_TYPE, submissionId }, location.origin);
          })
          .catch(() => {});
      }
    } catch (error) {
      /* 지켜보다 실패해도 사이트의 요청은 그대로 둔다 */
    }
    return promise;
  };
})();
