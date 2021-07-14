<!-- src/App.svelte -->
<script>
  import { onMount } from 'svelte';
  import _ from 'lodash';
  import Difficulty from './components/Difficulty.svelte';
  import Navigation from './components/Navigation.svelte';
  import NumberPad from './components/NumberPad.svelte';
  import Sudoku from './components/Sudoku.svelte';
  import { remainHint, message, memoFlag } from './store/sudoku';
  import { getSudoku } from './utils/sudoku';

  let difficulty = localStorage.getItem('sudoku.difficulty') || 'easy'; // 난이도를 나타냅니다. Difficulty 컴포넌트에 Props로 전달됩니다.
  let selectedPoint = { x: 0, y: 0 }; // 정답을 맞추기 위해 현재 선택된 셀의 위치입니다. Sudoku 컴포넌트에 Props로 전달됩니다.
  let board = JSON.parse(localStorage.getItem('sudoku.board')) || []; // 스도쿠 퍼즐 정보입니다. Sudoku 컴포넌트에 Props로 전달됩니다.
  let answer = JSON.parse(localStorage.getItem('sudoku.answer')) || []; // 스도쿠 퍼즐 정보에 사용자가 입력한 정답까지 포함한 정보입니다. Sudoku 컴포넌트에 Props로 전달됩니다.
  let memo = JSON.parse(localStorage.getItem('sudoku.memo')) || []; // 빈 칸 각각의 후보 숫자 배열이 저장됩니다. Sudoku 컴포넌트에 Props로 전달됩니다.
  let solution = JSON.parse(localStorage.getItem('sudoku.solution')) || []; // 완성된 스도쿠 퍼즐입니다.

  $: isEditable = !(board?.[selectedPoint.y]?.[selectedPoint.x]); // 선택된 셀이 맞춰야 하는 칸인지 확인하기 위한 값입니다.
  $: if (answer.length !== 0 && _.isEqual(answer, solution)) { // 퍼즐이 완성되었을 때 호출되어 message 스토어 값을 업데이트 합니다.
    $message = '훌륭합니다.'
  }
  $: localStorage.setItem('sudoku.difficulty', difficulty); // 사용자가 퍼즐의 빈 칸을 채울 때마다 호출됩니다.
  $: localStorage.setItem('sudoku.answer', JSON.stringify(answer)); // 사용자가 퍼즐의 빈 칸을 채울 때마다 호출됩니다.
  $: localStorage.setItem('sudoku.remainHint', $remainHint); // 사용자가 힌트를 사용할 때마다 호출됩니다.
  $: localStorage.setItem('sudoku.memo', JSON.stringify(memo)); // 사용자가 후보 숫자를 입력했을 때 호출됩니다.
  $: localStorage.setItem('sudoku.solution', JSON.stringify(solution)); // 새로운 스도쿠 게임을 시작할 때 호출됩니다.
  $: localStorage.setItem('sudoku.board', JSON.stringify(board)); // 새로운 스도쿠 게임을 시작할 때 호출됩니다.

  onMount(() => {
    $remainHint = Number(localStorage.getItem('sudoku.remainHint')) || 0; // 남아 있는 힌트 개수를 저장합니다. Navigation 컴포넌트에서도 공유되는 스토어입니다.

    if (solution.length) return;
    handleNewGame();
  });

  // 새로운 스도쿠 게임 정보를 설정하는 함수입니다.
  function handleNewGame () {
    $message = '새로운 게임을 생성 중입니다.';
    setTimeout(() => {
      const result = getSudoku(difficulty);
      solution = result.solution;
      board = result.board;
      answer = _.cloneDeep(result.board);

      const tmpMemo = [];
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (!tmpMemo[i]) tmpMemo[i] = [];
          if (!tmpMemo[i][j]) tmpMemo[i][j] = [];
        }
      }
      memo = tmpMemo;

      $message = '';
      $remainHint = 3;
    });
  }

  // 스도쿠 빈 칸에 입력된 값을 지우는 함수입니다.
  function handleRemove () {
    if (!isEditable) return;
    memo[selectedPoint.y][selectedPoint.x] = [];
    answer[selectedPoint.y][selectedPoint.x] = 0;
  }

  // 선택된 셀에 힌트를 사용하는 함수입니다.
  function handleHint () {
    if (!isEditable || $remainHint <= 0) return;
    $remainHint--;
    answer[selectedPoint.y][selectedPoint.x] = solution[selectedPoint.y][selectedPoint.x];
  }

  // NumberPad 컴포넌트에서 숫자가 클릭 되었을 때 호출되는 함수입니다.
  function handleClickNumber ({ detail }) {
    if (!isEditable) return;
    if ($memoFlag) {
      const memoList = memo[selectedPoint.y][selectedPoint.x];
      const index = memoList.indexOf(detail);
      if (index >= 0) {
        memoList.splice(index, 1);
      } else {
        memoList.push(detail);
      }
      memo[selectedPoint.y][selectedPoint.x] = memoList;
    } else {
      answer[selectedPoint.y][selectedPoint.x] = detail;
    }
  }
</script>

<div class="contents">
  <Difficulty bind:difficulty on:change={handleNewGame}/>
  <Sudoku
    bind:selectedPoint
    {answer}
    {memo}
    {board}
  />
  <Navigation
    on:remove={handleRemove}
    on:hint={handleHint}
    on:newGame={handleNewGame}
  />
  <NumberPad
    on:click={handleClickNumber}
  />
</div>

<style>
  .contents {
    width: 600px;
    margin: auto;
  }
</style>