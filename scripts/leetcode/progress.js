/*
  LeetCode 업로드 진행 표시. 화면 오른쪽 아래에 작은 상태 표시를 띄운다.
  업로드는 제출 뒤 20초쯤 걸리고 그 사이 페이지를 떠나면 끊기므로, 올리는 중임을 보여 주고
  새로 고침·탭 닫기는 브라우저 확인 창으로 한 번 막는다. (사이트 안의 페이지 이동은 막을 수 없다)
  정답이 아니거나 오래된 제출처럼 올리지 않는 제출에는 띄우지 않는다.
*/
const LeetcodeProgress = (() => {
  const ID = 'BaekjoonHub_leetcode_progress';
  const DONE_HIDE_MS = 6000;
  let hideTimer = null;
  let active = 0; // 올리는 중인 제출 수

  function onBeforeUnload(event) {
    event.preventDefault();
    event.returnValue = '';
  }

  function element() {
    let elem = document.getElementById(ID);
    if (!elem) {
      elem = document.createElement('div');
      elem.id = ID;
      elem.setAttribute('role', 'status');
      elem.setAttribute('aria-live', 'polite');
      elem.innerHTML = '<span class="bjh-lc-icon" aria-hidden="true"></span><span class="bjh-lc-text"></span>';
      elem.addEventListener('click', () => {
        if (!elem.classList.contains('bjh-lc-uploading')) elem.remove();
      });
      document.body.appendChild(elem);
    }
    return elem;
  }

  function show(state, text) {
    clearTimeout(hideTimer);
    const elem = element();
    elem.className = `bjh-lc-${state}`;
    elem.querySelector('.bjh-lc-text').textContent = text;
    if (state !== 'uploading') hideTimer = setTimeout(() => elem.remove(), DONE_HIDE_MS);
  }

  function finish() {
    active = Math.max(0, active - 1);
    if (active === 0) window.removeEventListener('beforeunload', onBeforeUnload);
  }

  return {
    /** @param {string} label - 예: '1. Two Sum' */
    start(label) {
      if (active++ === 0) window.addEventListener('beforeunload', onBeforeUnload);
      this.update(label);
    },
    /** 올리는 중 표시의 문제 이름만 바꾼다 */
    update(label) {
      show('uploading', `${label} 풀이를 GitHub 에 올리는 중… 페이지를 떠나지 마세요`);
    },
    uploaded(label) {
      finish();
      show('done', `${label} 풀이를 GitHub 에 올렸습니다`);
    },
    skipped(label) {
      finish();
      show('done', `${label} 풀이는 이미 올라가 있습니다`);
    },
    failed(reason) {
      finish();
      show('failed', `GitHub 에 올리지 못했습니다: ${reason}`);
    },
  };
})();
