const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', '..', 'static', 'data', 'sequence-index.json');
const data = require(dataPath);

const intercardinal = ['ne', 'nw', 'se', 'sw'];
const cardinal = ['n', 's', 'e', 'w'];

let fixed = 0;
data.sequences.forEach(s => {
  if (s.gridMode === 'skewed') {
    // Check actual locations
    let hasIntercardinal = false;
    let hasCardinal = false;
    const beats = s.fullMetadata?.sequence?.slice(1) || [];
    beats.forEach(b => {
      const locs = [
        b.blueAttributes?.startLoc,
        b.blueAttributes?.endLoc,
        b.redAttributes?.startLoc,
        b.redAttributes?.endLoc
      ].filter(Boolean);

      locs.forEach(loc => {
        if (intercardinal.includes(loc)) hasIntercardinal = true;
        if (cardinal.includes(loc)) hasCardinal = true;
      });
    });

    // Determine correct mode based on actual locations
    let correctMode = 'diamond'; // default
    if (hasIntercardinal && hasCardinal) {
      correctMode = 'skewed'; // actually mixed
    } else if (hasIntercardinal && !hasCardinal) {
      correctMode = 'box'; // all intercardinal
    } else {
      correctMode = 'diamond'; // all cardinal
    }

    if (s.gridMode !== correctMode) {
      console.log(s.word + ': skewed → ' + correctMode);
      s.gridMode = correctMode;
      // Also fix the metadata
      if (s.fullMetadata?.sequence?.[0]) {
        s.fullMetadata.sequence[0].gridMode = correctMode;
      }
      fixed++;
    }
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('\nFixed', fixed, 'incorrectly labeled skewed sequences');
