import "clsx";
import { G as GridMode } from "./enums.js";
const state = {
  currentSequence: null,
  sequences: [],
  isLoading: false,
  error: null,
  selectedBeatIndex: null,
  selectedSequenceId: null,
  gridMode: GridMode.DIAMOND
};
function getCurrentSequence() {
  return state.currentSequence;
}
function setCurrentSequence(sequence) {
  state.currentSequence = sequence;
  state.selectedSequenceId = sequence?.id ?? null;
  state.selectedBeatIndex = null;
}
function addSequence(sequence) {
  state.sequences.push(sequence);
  setCurrentSequence(sequence);
}
function setLoading(loading) {
  state.isLoading = loading;
}
function setError(error) {
  state.error = error;
}
function clearError() {
  state.error = null;
}
export {
  addSequence as a,
  setError as b,
  clearError as c,
  setCurrentSequence as d,
  state as e,
  getCurrentSequence as g,
  setLoading as s
};
