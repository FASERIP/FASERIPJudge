import { rollD100 } from './dice.js';

const COLORS = {
  AUTOMATIC: 'Automatic',
  WHITE: 'White',
  GREEN: 'Green',
  YELLOW: 'Yellow',
  RED: 'Red',
  IMPOSSIBLE: 'Impossible',
};

function* percentileDiceRoller() {
  yield rollD100();
}

const percentileDice = percentileDiceRoller();

const ranks = {};
const effects = {};
let rankArray = [];
let effectsArray = [];

function isValidRank(rank) {
  return rank &&
    typeof rank.Minimum === 'number' &&
    typeof rank.Standard === 'number' &&
    typeof rank.Green === 'number' &&
    typeof rank.Yellow === 'number' &&
    typeof rank.Red === 'number' &&
    typeof rank.Abbreviation === 'string';
}

function isValidEffect(effect) {
  return effect &&
    typeof effect.abbreviation === 'string' &&
    typeof effect.ability === 'string' &&
    typeof effect.white === 'string' &&
    typeof effect.green === 'string' &&
    typeof effect.yellow === 'string' &&
    typeof effect.red === 'string';
}

function parseGameSystemData(data) {
  for (const rankName in data['Universal Table'].Rank) {
    const rank = data['Universal Table'].Rank[rankName];
    if (isValidRank(rank)) {
      rank.name = rankName;
      ranks[rankName] = rank;
    } else {
      throw new Error(`Invalid rank: ${rankName}`);
    }
  }

  rankArray = Object.values(ranks).sort((a, b) => a.Minimum - b.Minimum);
  for (const effectName in data['Universal Table'].Effect) {
    const effect = data['Universal Table'].Effect[effectName];
    if (isValidEffect(effect)) {
      effect.name = effectName;
      effects[effectName] = effect;
    } else {
      throw new Error(`Invalid effect: ${effectName}`);
    }
  }

  const rankMap = Object.entries(ranks).reduce((acc, [name, rankData]) => {
    acc[name] = rankData;
    acc[rankData.Abbreviation] = rankData;
    return acc;
  }, {});

  const effectMap = Object.entries(effects).reduce((acc, [name, effectData]) => {
    acc[name] = effectData;
    acc[effectData.abbreviation] = effectData;
    return acc;
  }, {});

  return { rankMap, effectMap };
}

function getColorResult(d100Result, rank, columnShift = 0) {
  const finalRank = getFinalRank(rank, columnShift);
  let resultColor = COLORS.WHITE;

  if (d100Result >= finalRank.Red) {
    resultColor = COLORS.RED;
  } else if (d100Result >= finalRank.Yellow) {
    resultColor = COLORS.YELLOW;
  } else if (d100Result >= finalRank.Green) {
    resultColor = COLORS.GREEN;
  }

  return resultColor;
}

function parseColumnShift(value) {
  if (typeof value === 'number') {
    return value;
  } else if (typeof value === 'string') {
    const match = value.match(/([-+]?\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  }
  return 0;
}

function getColumnShiftedRank(rank, columnShift) {
  if (isValidRank(rank)) {
    const index = rankArray.findIndex(rankData => rankData === rank);
    let shiftedIndex = index + columnShift;

    // Ensure shifted index is within bounds
    shiftedIndex = Math.max(0, Math.min(rankArray.length - 1, shiftedIndex));

    return rankArray[shiftedIndex];
  } else {
    throw new Error('Invalid rank provided.');
  }
}

// Determine the difference between ranks and get the required result
function getRequiredResult(shiftedRank, shiftedIntensity) {
  const rankIndex = Object.values(ranks).indexOf(shiftedRank);
  const intensityIndex = Object.values(ranks).indexOf(shiftedIntensity);

  const difference = rankIndex - intensityIndex;

  if (difference > 2) return COLORS.AUTOMATIC;
  if (difference === 1 || difference === 2) return COLORS.GREEN;
  if (difference === 0) return COLORS.YELLOW;
  if (difference === -1) return COLORS.RED;
  return COLORS.IMPOSSIBLE;
}

// Check if the roll result meets or exceeds the required result
function isSuccess(rollResult, requiredResult) {
  if (requiredResult === COLORS.AUTOMATIC) return true;
  if (requiredResult === COLORS.IMPOSSIBLE) return false;
  if (requiredResult === COLORS.GREEN) return rollResult === COLORS.GREEN || rollResult === COLORS.YELLOW || rollResult === COLORS.RED;
  if (requiredResult === COLORS.YELLOW) return rollResult === COLORS.YELLOW || rollResult === COLORS.RED;
  if (requiredResult === COLORS.RED) return rollResult === COLORS.RED;
  return false;
}

// Constructor for the game system
function GameSystem(gameSystemData = { 'Universal Table': { 'Rank': {}, 'Effect': {} } }) {
  const { rankMap, effectMap } = parseGameSystemData(gameSystemData);

  function getRank(value) {
    if (isValidRank(value)) {
      return value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      return rankMap[value];
    } else {
      throw new Error('Invalid rank value provided.');
    }
  }

  function getFinalRank(rankValue, columnShiftValue) {
    const rank = getRank(rankValue);
    const columnShift = parseColumnShift(columnShiftValue);

    if (columnShift === 0) {
      return rank;
    }

    return getColumnShiftedRank(rank, columnShift);
  }

  function getEffect(value) {
    return effectMap[value];
  }

  function getEffectResult(effect, color = COLORS.WHITE) {
    let effectObj;

    if (typeof effect === 'string') {
      effectObj = getEffect(effect);
    } else if (isValidEffect(effect)) {
      effectObj = effect;
    } else {
      throw new Error('Invalid effect provided.');
    }

    if (!effectObj[color]) {
      throw new Error(`Invalid color result: ${color}`);
    }

    return effectObj[color];
  }

  // Roll on the Universal Table
  function rollRaw(baseRank, d100Roll, columnShift = 0) {
    const shiftedRank = getFinalRank(baseRank, columnShift);
    const colorResult = getColorResult(shiftedRank, d100Roll);

    return {
      Roll: d100Roll,
      Rank: shiftedRank.name,
      Number: (typeof baseRank === 'number' && columnShift === 0) ? baseRank : shiftedRank.Standard,
      Result: colorResult
    };
  }

  function roll(baseRank, columnShift = 0) {
    return rollRaw(baseRank, percentileDice.next(), columnShift);
  }


  // Roll on the Universal Table vs. Intensity
  function rollWithIntensity(baseRank, d100Roll, columnShift = 0, intensity = null, intensityShift = 0) {
    const outcome = rollRaw(baseRank, d100Roll, columnShift);

    if (intensity) {
      const shiftedIntensity = getFinalRank(intensity, intensityShift);
      const required = getRequiredResult(outcome.Rank, shiftedIntensity.name);

      outcome.Required = required;
      outcome.Success = isSuccess(outcome.Result, required);
    }

    return outcome;
  }

  function rollVsIntensity(baseRank, intensity, columnShift = 0, intensityShift = 0) {
    return rollWithIntensity(baseRank, percentileDice.next(), intensity, columnShift, intensityShift);
  }

  // Roll on the Universal Table and lookup on the Effects Table
  function rollWithEffect(baseRank, d100Roll, effect = null, columnShift = 0) {
    const outcome = rollRaw(baseRank, d100Roll, columnShift);

    if (effect) {
      outcome.Column = getEffect(effect).name;
      outcome.Effect = getEffectResult(effect, outcome.Result);
    }

    return outcome;
  }

  function rollForEffect(baseRank, effect = null, columnShift = 0) {
    return rollWithEffect(baseRank, percentileDice.next(), effect, columnShift);
  }

  return {
    getRank,
    getFinalRank,
    getEffect,
    getEffectResult,
    getColorResult,
    rollRaw,
    roll,
    rollWithIntensity,
    rollVsIntensity,
    rollWithEffect,
    rollForEffect,
  };
}

export {
  GameSystem,
  COLORS,
};
