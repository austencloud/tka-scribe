// src/lib/context/sequence/sequenceContext.ts
import { setContext, getContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';
import type { BeatData } from '$lib/components/SequenceWorkbench/SequenceBeatFrame/BeatData';
import type { PictographData } from '$lib/types/PictographData';
import { sequenceActions, type SequenceAction } from '$lib/stores/sequence/sequenceActions';

// Context key
const SEQUENCE_CONTEXT_KEY = 'sequence-context';

// State interface
export interface SequenceState {
  sequenceName: string;
  difficultyLevel: number;
  beats: BeatData[];
  selectedBeatIndex: number;
  startPosition: PictographData | null;
  status: string;
}

// Initial state
const initialState: SequenceState = {
  sequenceName: 'New Sequence',
  difficultyLevel: 1,
  beats: [],
  selectedBeatIndex: -1,
  startPosition: null,
  status: 'ready'
};

// Reducer function to handle actions
function reducer(state: SequenceState, action: SequenceAction): SequenceState {
  switch (action.type) {
    case 'SELECT_BEAT':
      return { ...state, selectedBeatIndex: action.payload };
      
    case 'ADD_BEAT':
      return { 
        ...state, 
        beats: [...state.beats, action.payload],
        status: 'editing'
      };
      
    case 'UPDATE_BEAT':
      return {
        ...state,
        beats: state.beats.map((beat, index) => 
          index === action.payload.index 
            ? { ...beat, ...action.payload.beat } 
            : beat
        ),
        status: 'editing'
      };
      
    case 'REMOVE_BEAT':
      return {
        ...state,
        beats: state.beats.filter((_, index) => index !== action.payload),
        selectedBeatIndex: -1, // Deselect after removal
        status: 'editing'
      };
      
    case 'CLEAR_SEQUENCE':
      return {
        ...state,
        beats: [],
        selectedBeatIndex: -1,
        status: 'ready'
      };
      
    case 'MIRROR_SEQUENCE':
    case 'ROTATE_SEQUENCE':
    case 'SWAP_COLORS':
      // These would have complex implementations
      return { ...state, status: 'editing' };
      
    case 'SET_STATUS':
      return { ...state, status: action.payload };
      
    case 'UPDATE_START_POSITION':
      return { 
        ...state, 
        startPosition: action.payload,
        status: 'editing'
      };
      
    default:
      return state;
  }
}

// Type for context
export interface SequenceContext {
  state: Writable<SequenceState>;
  dispatch: (action: SequenceAction) => void;
}

// Create context
export function createSequenceContext(): SequenceContext {
  // Create state store
  const state = writable<SequenceState>(initialState);
  
  // Dispatch function to update state
  function dispatch(action: SequenceAction) {
    state.update(currentState => reducer(currentState, action));
  }
  
  // Set context
  const context: SequenceContext = { state, dispatch };
  setContext(SEQUENCE_CONTEXT_KEY, context);
  
  return context;
}

// Get context
export function getSequenceContext(): SequenceContext {
  return getContext<SequenceContext>(SEQUENCE_CONTEXT_KEY);
}

// Re-export actions for convenience
export { sequenceActions };