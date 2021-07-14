// src/store/sudoku.js
import { writable } from 'svelte/store';

export const memoFlag = writable(false);
export const remainHint = writable(3);
export const message = writable('');
