<!-- src/components/Sudoku.svelte -->
<script>
  import _ from 'lodash';
  import { fade } from 'svelte/transition';
  import Cell from './Cell.svelte';
  import { message } from '../store/sudoku';
  import { getFocusCellsRow, getFocusCellsCol, getFocusCellsBox } from '../utils/sudoku';

  export let board = []; // 스도쿠 퍼즐이 저장되어 있는 변수입니다.
  export let answer = []; // 스도쿠 퍼즐 정보에 사용자가 입력한 정답까지 저장되는 변수입니다.
  export let memo = []; // 셀 좌표에 후보 숫자 배열이 저장되는 변수입니다.
  export let selectedPoint = { x: 0, y: 0 }; // 정답을 맞추기 위해 선택된 셀 위치입니다.

  $: selectedAnswer = answer?.[selectedPoint.y]?.[selectedPoint.x]; // 선택된 셀에 입력된 숫자가 반응형으로 저장됩니다.
  $: focusCellsRow = getFocusCellsRow(selectedPoint); // 선택된 셀이 포함된 셀 행의 셀 좌표 배열이 반응형으로 저장됩니다.
  $: focusCellsCol = getFocusCellsCol(selectedPoint); // 선택된 셀이 포함된 셀 열의 셀 좌표 배열이 반응형으로 저장됩니다.
  $: focusCellsBox = getFocusCellsBox(selectedPoint); // 선택된 셀이 포함된 박스의 셀 좌표 배열이 반응형으로 저장됩니다.
  $: focusCells = _.uniqWith([...focusCellsRow, ...focusCellsCol, ...focusCellsBox], _.isEqual); // 중복을 제거한 focusCellsRow, focusCellsCol, focusCellsBox를 합친 배열입니다.

  // 각 셀의 에러를 확인하는 함수입니다. 셀 행, 셀 열, 박스에 중복된 숫자가 있으면 에러입니다.
  function isError (selectedPoint) {
    const value = answer[selectedPoint.y][selectedPoint.x];
    if (!value) return false;

    const row = getFocusCellsRow(selectedPoint);
    const col = getFocusCellsCol(selectedPoint);
    const square = getFocusCellsBox(selectedPoint);
    const rowValues = row.map(p => answer[p.y][p.x]).filter(x => !!x);
    const colValues = col.map(p => answer[p.y][p.x]).filter(x => !!x);
    const squareValues = square.map(p => answer[p.y][p.x]).filter(x => !!x);
    return rowValues.filter(x => x === value).length > 1 ||
      colValues.filter(x => x === value).length > 1 ||
      squareValues.filter(x => x === value).length > 1
  }
 </script>

<div class="wrapper">
  <table class="game-table">
    {#if $message}
      <div out:fade class="message">{$message}</div>
    {/if}
    <tbody>
      {#each answer as row, y (y)}
        <tr>
          {#each row as item, x (x)}
            <td
              class:is-answer={board[y][x] === 0}
              class:selected={selectedPoint.x === x && selectedPoint.y === y}
              class:active={focusCells.find(p => p.x === x && p.y === y)}
              class:highlight={selectedAnswer && item === selectedAnswer}
              class:error={isError({ x, y })}
            >
              <Cell
                value={item}
                memo={memo[y][x]}
                on:click={() => selectedPoint = { x, y }}
              />
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .wrapper {
    width: 600px;
    height: 600px;
    position: relative;
  }
  .game-table {
    display: block;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    border: 2px solid #344861;
  }
  .game-table:after {
    content: '';
    border-left: 2px solid #344861;
    border-right: 2px solid #344861;
    box-sizing: border-box;
    left: 33.3333%;
    width: 33.3333%;
    position: absolute;
    top: 0;
    height: 100%;
    pointer-events: none;
  }
  .game-table tbody:after {
    content: '';
    border-top: 2px solid #344861;
    border-bottom: 2px solid #344861;
    box-sizing: border-box;
    pointer-events: none;
    width: 100%;
    height: 33.3333%;
    position: absolute;
    top: 33.3333%;
    left: 0;
  }
  .game-table tbody {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
  .game-table tr {
    height: 11.1111%;
    display: flex;
  }
  .game-table td {
    width: 100%;
    border-right: 1px solid #bec6d4;
    border-bottom: 1px solid #bec6d4;
    box-sizing: border-box;
    cursor: pointer;
  }
  .game-table td.active {
    background-color: #e2e7ed;
  }
  .game-table td.highlight {
    background-color: #cbdbed;
  }
  .game-table td.error {
    background-color: #f7cfd6;
  }
  .game-table td.is-answer.error :global(svg path) {
    fill: #fb3d3f;
  }
  .game-table td.selected {
    background-color: #bbdefb;
  }
  .message {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    text-align: center;
    background-color: #fff;
    opacity: 0.8;
    font-size: 25px;
  }
  .message:after {
    content: '';
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }
</style>