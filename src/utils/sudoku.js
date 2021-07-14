// src/utils/sudoku.js
import _ from 'lodash';
import { multiply } from 'mathjs';

// 셀 행 혹은 셀 열의 배열을 가져오는 함수
export function getCellLine (board, direct, index) {
  if (direct === 'row') {
    return [...board[index]];
  } else {
    const list = [];
    for (let i = 0; i < 9; i++) {
      list.push(board[i][index]);
    }
    return list;
  }
}

// 스도쿠를 회전하는 함수
export function rotation (board, angular) {
  const newBoard = [];
  if (angular === 90) {
    for (let i = 0; i < 9; i++) {
      const line = getCellLine(board, 'col', i);
      newBoard.push(line.reverse());
    }
  } else if (angular === 180) {
    for (let i = 8; i >= 0; i--) {
      const line = getCellLine(board, 'row', i);
      newBoard.push(line.reverse());
    }
  } else if (angular === 270) {
    for (let i = 8; i >= 0; i--) {
      const line = getCellLine(board, 'col', i);
      newBoard.push(line);
    }
  } else {
    return board;
  }
  return newBoard;
}


// 셀 행, 셀 열을 교환하는 함수
export function swapCell (board, direct, lineNumber1, lineNumber2) {
  const ref = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1],
  ];
  const temp = ref[lineNumber1];
  ref[lineNumber1] = ref[lineNumber2];
  ref[lineNumber2] = temp;
  return direct === 'row'
    ? multiply(ref, board)
    : multiply(board, ref);
}

// 박스 행, 박스 열을 교환하는 함수
export function swapBox (board, direct, lineNumber1, lineNumber2) {
  const ref = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1],
  ];
  for (let i = 0; i < 3; i++) {
    const temp = ref[lineNumber1 * 3 + i];
    ref[lineNumber1 * 3 + i] = ref[lineNumber2 * 3 + i];
    ref[lineNumber2 * 3 + i] = temp;
  }
  return direct === 'row'
    ? multiply(ref, board)
    : multiply(board, ref);
}

// 스도쿠를 생성하는 함수
export function getSolution () {
  const s = _.chunk(_.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]), 3); // 임의의 위치에 1부터 9까지의 숫자를 가지는 3X3 행렬을 생성합니다.
  const x1 = [[0, 0, 1], [1, 0, 0], [0, 1, 0]];
  const x2 = [[0, 1, 0], [0, 0, 1], [1, 0, 0]];
  const x1s = multiply(x1, s);
  const x2s = multiply(x2, s);
  const sx1 = multiply(s, x1);
  const sx2 = multiply(s, x2);
  const x2sx1 = multiply(x2s, x1);
  const x1sx1 = multiply(x1s, x1);
  const x1sx2 = multiply(x1s, x2);
  const x2sx2 = multiply(x2s, x2);
  let solution = [
    [...s[0], ...x1s[0], ...x2s[0]],
    [...s[1], ...x1s[1], ...x2s[1]],
    [...s[2], ...x1s[2], ...x2s[2]],
    [...sx1[0], ...x1sx1[0], ...x2sx1[0]],
    [...sx1[1], ...x1sx1[1], ...x2sx1[1]],
    [...sx1[2], ...x1sx1[2], ...x2sx1[2]],
    [...sx2[0], ...x1sx2[0], ...x2sx2[0]],
    [...sx2[1], ...x1sx2[1], ...x2sx2[1]],
    [...sx2[2], ...x1sx2[2], ...x2sx2[2]],
  ];
  solution = swapCell(solution, 'row', ..._.take(_.shuffle([0, 1, 2]), 2));
  solution = swapCell(solution, 'row', ..._.take(_.shuffle([3, 4, 5]), 2));
  solution = swapCell(solution, 'row', ..._.take(_.shuffle([6, 7, 8]), 2));
  solution = swapCell(solution, 'col', ..._.take(_.shuffle([0, 1, 2]), 2));
  solution = swapCell(solution, 'col', ..._.take(_.shuffle([3, 4, 5]), 2));
  solution = swapCell(solution, 'col', ..._.take(_.shuffle([6, 7, 8]), 2));
  solution = swapBox(solution, 'row', ..._.take(_.shuffle([0, 1, 2]), 2));
  solution = swapBox(solution, 'col', ..._.take(_.shuffle([0, 1, 2]), 2));
  solution = rotation(solution, _.shuffle(0, 90, 180, 270)[0]);
  return solution;
}

// 스도쿠 퍼즐의 빈 칸의 좌표 배열을 가져오는 함수
export function getEmptyPointList (board) {
  const emptyPointList = [];
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (!board[y][x]) emptyPointList.push({ x, y })
    }
  }
  return emptyPointList;
}

// 박스 안에 있는 셀 좌표 배열을 가져오는 함수
export function getFocusCellsBox (point) {
  const refs = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
  const xRef = refs.filter(x => point.x >= Math.min(...x) && point.x <= Math.max(...x)).pop();
  const yRef = refs.filter(y => point.y >= Math.min(...y) && point.y <= Math.max(...y)).pop();
  const cells = [];
  for (const x of xRef) {
    for (const y of yRef) {
      cells.push({ x, y });
    }
  }
  return cells;
}

// 셀 행 안에 있는 셀 좌표 배열을 가져오는 함수
export function getFocusCellsRow (point) {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8].map(x => ({ x, y: point.y }));
}

// 셀 열 안에 있는 셀 좌표 배열을 가져오는 함수
export function getFocusCellsCol (point) {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8].map(y => ({ x: point.x, y }));
}

// 첫번째 풀이 방법을 적용하는 함수
export function setMemo (board, memo) {
  const emptyPointList = getEmptyPointList(board); // 스도쿠 퍼즐의 빈 칸 좌표 배열을 가져옵니다.
  let isSolve = true;
  for (const emptyPoint of emptyPointList) { // 빈 칸 개수 만큼 첫번째 풀이 방법을 적용합니다.
    const focusCellsRow = getFocusCellsRow(emptyPoint); // 현재 빈 칸을 기준으로 셀 행 안에 있는 셀 좌표를 가져옵니다.
    const focusCellsCol = getFocusCellsCol(emptyPoint); // 현재 빈 칸을 기준으로 셀 열 안에 있는 셀 좌표를 가져옵니다.
    const focusCellsBox = getFocusCellsBox(emptyPoint); // 현재 빈 칸을 기준으로 박스 안에 있는 셀 좌표를 가져옵니다.

    const memoGroup = [];
    for (const cells of [focusCellsRow, focusCellsCol, focusCellsBox]) { // 셀 행, 셀 열, 박스에서 가능한 후보 숫자를 저장합니다.
      const values = cells.map(p => board[p.y][p.x]);
      memoGroup.push(_.difference([1, 2, 3, 4, 5, 6, 7, 8, 9], values));
    }
    const memoList = _.intersection(...memoGroup); // 셀 행, 셀 열, 박스에서 가능한 후보 숫자의 교집합을 가져옵니다.

    if (memoList.length === 1) { // 교집합이 1개라면 빈 칸의 답이 됩니다.
      memo[emptyPoint.y][emptyPoint.x] = [];
      board[emptyPoint.y][emptyPoint.x] = memoList[0];
      return setMemo(board, memo); // 빈 칸이 채워졌기 때문에, 첫번째 풀이 방법을 다시 적용합니다.
    } else if (memoList.length > 1) { // 교집합이 2개 이상이라면 후보 숫자로 메모에 기록합니다.
      memo[emptyPoint.y][emptyPoint.x] = memoList;
      isSolve = false; 
    }
  }
  return isSolve;
}

// 두번째 풀이 방법을 적용하는 함수
export function diffMemo (board, memo) {
  const emptyPointList = getEmptyPointList(board); // 스도쿠 퍼즐의 빈 칸 배열을 가져옵니다.
  let isSolve = true;
  for (const emptyPoint of emptyPointList) { // 빈 칸 개수 만큼 두번째 풀이 방법을 적용합니다.
    const curMemo = memo[emptyPoint.y][emptyPoint.x];

    const focusCellsRow = getFocusCellsRow(emptyPoint).filter(p => !_.isEqual(p, emptyPoint)); // 현재 빈 칸을 제외한 현재 빈 칸 기준의 셀 행 안에 있는 셀 좌표를 가져옵니다.
    const focusCellsCol = getFocusCellsCol(emptyPoint).filter(p => !_.isEqual(p, emptyPoint)); // 현재 빈 칸을 제외한 현재 빈 칸 기준의 셀 열 안에 있는 셀 좌표를 가져옵니다.
    const focusCellsBox = getFocusCellsBox(emptyPoint).filter(p => !_.isEqual(p, emptyPoint)); // 현재 빈 칸을 제외한 현재 빈 칸 기준의 박스 안에 있는 셀 좌표를 가져옵니다.

    for (const cells of [focusCellsRow, focusCellsCol, focusCellsBox]) {
      const memos = cells.map(p => memo[p.y][p.x]);
      const possibleMemos = _.difference(curMemo, ...memos); // 현재 빈 칸을 기준으로 차집합을 구합니다.
      if (possibleMemos.length === 1) { // 차집합이 1개라면 빈 칸의 정답이 됩니다.
        board[emptyPoint.y][emptyPoint.x] = possibleMemos[0];
        return diffMemo(board, memo); // 빈 칸이 채워졌기 때문에, 두번째 풀이 방법을 다시 적용합니다.
      } else {
        isSolve = false;
      }
    }
  }
  return isSolve;
}

// 빈 칸으로 변경할 수 있는 임의의 셀 좌표 값을 가져오는 함수
export function getRandomPoint (board, except = []) {
  const possiblePoints = [];
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] && !except.find(item => _.isEqual(item, { x, y }))) {
        possiblePoints.push({ x, y });
      }
    }
  }
  return possiblePoints[_.random(0, possiblePoints.length)];
}

// 스도쿠 퍼즐의 난이도를 확인하기 위한 함수
export function isValidDifficulty (difficulty, emptyLength) {
  const refDifficulty = {
    'easy': 45,
    'medium': 50,
    'hard': 55,
  };
  if (difficulty === 'easy') {
    return emptyLength >= refDifficulty.easy && emptyLength < refDifficulty.medium;
  } else if (difficulty === 'medium') {
    return emptyLength >= refDifficulty.medium && emptyLength < refDifficulty.hard;
  } else {
    return emptyLength >= refDifficulty.hard;
  }
}

// 첫번째, 두번째 풀이 방법을 적용하는 함수
export function solve (board) {
  const memo = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (!memo[i]) memo[i] = [];
      if (!memo[i][j]) memo[i][j] = [];
    }
  }
  return setMemo(board, memo) || diffMemo(board, memo);
}

// 스도쿠 퍼즐 생성 함수
export function getSudoku (difficulty) {
  const solution = getSolution(); // 스도쿠 정답을 생성합니다.
  const board = _.cloneDeep(solution);
  const emptyPoints = [];
  const invalidPoints = [];
  while (!isValidDifficulty(difficulty, emptyPoints.length)) { // 설정한 난이도 만큼 반복합니다.
    const point = getRandomPoint(board, [...emptyPoints, ...invalidPoints]); // 임의의 셀 좌표를 가져옵니다.
    if (!point) break;
    const oriValue = board[point.y][point.x];
    board[point.y][point.x] = 0; // 임의의 셀을 빈 칸으로 변경합니다.
    const isSolve = solve(_.cloneDeep(board)); // 첫번째, 두번째 풀이를 적용합니다.
    if (!isSolve) { // 스도쿠 퍼즐이 완성 되지 않을 경우, 빈 칸으로 변경한 값을 복구합니다.
      board[point.y][point.x] = oriValue;
      invalidPoints.push(point);
    } else {
      emptyPoints.push(point);
    }
  }
  return !isValidDifficulty(difficulty, getEmptyPointList(board).length)
    ? getSudoku(difficulty) // 설정한 난이도와 완성된 스도쿠 퍼즐의 난이도가 다르다면 스도쿠 퍼즐 생성을 다시 시작합니다.
    : { solution, board };
}
