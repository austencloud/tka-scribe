import { settingsStore } from '../store/settings';
import { generatorStore } from '../store/generator';
import { determineRotationDirection } from '../utils/rotationDeterminer';
import { generateOrientations } from '../utils/orientationCalculator';
import { mapPositions } from '../utils/positionMaps';
import { validateFreeformSequence } from './validators';

interface FreeformSequenceOptions {
  numBeats: number;
  turnIntensity: number;
  propContinuity: 'continuous' | 'random';
  letterTypes: string[];
}

export async function createFreeformSequence(options: FreeformSequenceOptions) {
  try {
    generatorStore.startGeneration();
    generatorStore.updateProgress(10, 'Initializing freeform sequence generation');

    // Step 1: Determine rotation parameters
    const rotationDirection = determineRotationDirection(options.propContinuity);

    generatorStore.updateProgress(30, 'Generating base sequence');
    // Step 2: Generate base sequence
    const baseSequence = generateBaseSequence(options);

    generatorStore.updateProgress(70, 'Validating sequence');
    // Step 3: Validate sequence
    const validationResult = validateFreeformSequence(baseSequence, options.letterTypes);
    if (!validationResult.isValid) {
      throw new Error(validationResult.errors.join('; '));
    }

    generatorStore.updateProgress(90, 'Finalizing sequence');
    // Step 4: Final processing
    const finalSequence = postProcessSequence(baseSequence);

    generatorStore.completeGeneration();
    return finalSequence;

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to generate freeform sequence';
    
    generatorStore.setError(errorMessage);
    throw error;
  }
}

function generateBaseSequence(options: FreeformSequenceOptions) {
  const sequence = [];
  
  for (let i = 0; i < options.numBeats; i++) {
    const beat = generateSingleBeat(options, i);
    sequence.push(beat);
  }

  return sequence;
}

function generateSingleBeat(options: FreeformSequenceOptions, beatIndex: number) {
  return {
    beat: beatIndex,
    turnIntensity: calculateTurnIntensity(options.turnIntensity),
    orientation: generateOrientations(),
    position: mapPositions(beatIndex),
    letterType: selectLetterType(options.letterTypes)
  };
}

function calculateTurnIntensity(baseTurnIntensity: number) {
  const variation = Math.random() * 0.5 - 0.25;
  return Math.max(0, baseTurnIntensity + variation);
}

function selectLetterType(letterTypes: string[]) {
  // If no types specified, choose randomly
  if (letterTypes.length === 0) {
    const allTypes = ['type1', 'type2', 'type3', 'type4'];
    return allTypes[Math.floor(Math.random() * allTypes.length)];
  }
  
  // Choose randomly from provided types
  return letterTypes[Math.floor(Math.random() * letterTypes.length)];
}

function postProcessSequence(sequence: any[]) {
  return sequence.map(beat => ({
    ...beat,
    finalOrientation: normalizeOrientation(beat.orientation)
  }));
}

function normalizeOrientation(orientation: any) {
  return orientation;
}