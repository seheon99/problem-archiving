<h1 align="center">
  <img src="assets/thumbnail.png" alt="problem-archiving" width="320">
  <br>
  problem-archiving
</h1>

<p align="center">
  알고리즘 문제를 맞히면 풀이를 GitHub 저장소에 자동으로 올려 주는 Chrome 확장입니다.
  <br>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"/></a>
</p>

[백준허브(BaekjoonHub)](https://github.com/BaekjoonHub/BaekjoonHub)를 포크해 **LeetCode 지원**을 더한 프로젝트입니다. 확장의 이름과 설정 화면은 백준허브 그대로입니다.

## 지원하는 사이트

| 사이트 | 올리는 때 | 올리지 않는 제출 |
| --- | --- | --- |
| [백준](https://www.acmicpc.net/) | 채점 결과가 "맞았습니다"로 나오면 | — |
| [프로그래머스](https://school.programmers.co.kr/) | 제출 후 정답 안내가 뜨면 | — |
| [SW Expert Academy](https://swexpertacademy.com/) | Pass 결과창이 뜨면 (업로드가 끝날 때까지 결과창의 확인·닫기가 잠시 미뤄짐) | — |
| [정올](https://jungol.co.kr/) | 문제 페이지에서 제출하고 채점 결과창이 뜨면 | 대회 중 제출 |
| [DOJ](https://doj.kr/) | 채점 결과가 만점 정답으로 나오면 | 대회·DLC 제출 |
| [LeetCode](https://leetcode.com/) | 채점 결과가 Accepted 로 나오면 | 1시간보다 오래된 제출 |

새로 올리면 페이지에 알림이 뜹니다. 같은 코드가 이미 올라가 있으면 다시 커밋하지 않습니다. 업로드 중에는 페이지를 옮기지 않는 것이 좋습니다.

LeetCode 는 leetcode.com 만 지원합니다. leetcode.cn 은 아직 지원하지 않습니다.

## 설치

Chrome 웹 스토어의 백준허브에는 LeetCode 지원이 없으므로, 이 저장소를 직접 불러옵니다.

1. 이 저장소를 받습니다.
   ```bash
   git clone https://github.com/seheon99/problem-archiving.git
   ```
2. Chrome 에서 `chrome://extensions` 를 열고 오른쪽 위의 **개발자 모드**를 켭니다.
3. **압축해제된 확장 프로그램을 로드합니다**를 눌러 받은 폴더를 고릅니다.
4. 스토어판 백준허브를 쓰고 있었다면 꺼 둡니다. 둘 다 켜 두면 같은 풀이를 두 번 올립니다.

코드를 고친 뒤에는 확장 카드의 새로 고침 버튼을 누르고, 문제 사이트 탭도 새로 고칩니다.

## 처음 설정

1. 설치하면 설정 페이지가 열립니다. 닫았다면 툴바의 확장 아이콘에서 다시 열 수 있습니다.
2. **GitHub로 계속하기**를 눌러 인증합니다.
3. 풀이를 올릴 저장소를 새로 만들거나(기본값은 비공개) 기존 저장소를 고릅니다. 목록에 없으면 `소유자/이름` 이나 GitHub 주소를 직접 넣을 수 있습니다.
4. 연결하면 끝입니다. 이제 위 사이트에서 문제를 맞히면 저장소에 올라갑니다.

## 저장소에 올라가는 모양

기본 폴더 구조는 `사이트/등급/번호. 제목/` 이고, 그 안에 풀이 파일과 `README.md` 가 들어갑니다.

```
백준/Gold/1000. A＋B/A＋B.py
프로그래머스/2/12345. 타겟 넘버/타겟 넘버.js
LeetCode/Easy/1. Two Sum/Two Sum.py
```

폴더·파일 이름에 쓸 수 없는 문자(`/`, `:`, `?` 등)는 전각 문자(`／`, `：`, `？`)로 바꿉니다.

각 문제의 `README.md` 에는 다음이 들어갑니다.

| 사이트 | 문제 정보 | 내 제출 정보 |
| --- | --- | --- |
| 백준 | 제목, 번호, 링크, 등급, 분류, 문제 설명 | 코드, 메모리, 시간 |
| 프로그래머스 | 제목, 번호, 링크, 등급, 문제 설명 | 코드, 메모리, 시간 |
| SW Expert Academy | 제목, 번호, 링크, 등급 | 코드, 메모리, 시간, 코드 길이 |
| 정올 | 제목, 번호, 링크, 등급 | 코드, 메모리, 시간 |
| DOJ | 제목, 번호, 링크, 등급 | 코드, 메모리, 시간 |
| LeetCode | 제목, 번호, 링크, 난이도, 분류 | 코드, 메모리, 시간(Beats %), LeetCode 메모 |

정올·DOJ·LeetCode 는 이용약관과 저작권 때문에 문제 설명을 저장하지 않습니다.

백준은 내 제출 가운데 가장 나은 것을 올립니다. 점수(서브태스크)가 높은 것, 시간이 짧은 것, 메모리가 적은 것, 코드가 짧은 것, 최신 제출 순으로 고릅니다.

## 업로드 설정

설정 페이지의 업로드 설정에서 바꿀 수 있습니다.

- **정리 방식**: 사이트별(`백준/…`) 또는 언어별(`Python/백준/…`)로 폴더를 나눕니다.
- **폴더 템플릿**: 사이트마다 폴더 경로를 직접 정합니다. `${platform}`, `${level}`, `${id}`, `${title}`, `${language}` 를 쓸 수 있고, 백준·정올·DOJ 는 `${levelFull}`(예: `Gold V`)도 쓸 수 있습니다.
- **예제 입출력 저장**: 백준 문제의 예제 입출력을 파일로 함께 올립니다.
- **풀이별 파일 보관**: 같은 문제를 다르게 다시 풀면 `이름_002.py`, `이름_003.py` 처럼 번호를 붙여 모두 남깁니다. 기본값은 꺼짐이고, 꺼져 있으면 새 풀이가 이전 풀이를 덮어씁니다.

## 개발

빌드 단계는 없습니다. 저장소 폴더가 그대로 확장입니다.

```bash
npm test
```

테스트는 Node 내장 테스트 러너(`node --test`)로 돌고, 설치할 의존성은 없습니다.

- `manifest.json`: 사이트마다 콘텐츠 스크립트 묶음이 하나씩 있습니다.
- `scripts/`: 사이트 사이에 함께 쓰는 코드(GitHub API, 업로드, 저장소 캐시)입니다.
- `scripts/<사이트>/`: 사이트별 감지·파싱 코드입니다. 새 사이트는 `scripts/doj/` 나 `scripts/leetcode/` 를 본보기로 삼으면 됩니다.
- `tests/`: 사이트별 파싱 테스트와, 묶음마다 전역 이름이 겹치지 않는지 보는 `bundleGuards.test.js` 가 있습니다.

## 만든 사람들

- [백준허브(BaekjoonHub)](https://github.com/BaekjoonHub/BaekjoonHub)와 [그 기여자들](https://github.com/BaekjoonHub/BaekjoonHub#contributors): 이 저장소의 바탕입니다.
- [LeetHub](https://github.com/QasimWani/LeetHub): 백준허브가 영감을 받은 LeetCode 용 확장입니다. LeetCode 지원은 [LeetHub-3.0](https://github.com/raphaelheinz/LeetHub-3.0)의 방식(GraphQL 질의, 제출 요청 감지)을 참고했습니다.

## 라이선스

[MIT](LICENSE)
