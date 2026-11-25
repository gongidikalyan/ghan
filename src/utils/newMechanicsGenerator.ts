import { Challenge, PatternGridCell } from '../types/game';
import type { MechanicDefinition } from './challengeGenerator';
import { getDynamicDuration, getSpeedMultiplier } from './difficulty';

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================================
// 1. HOLD & RELEASE TIMING (5 New Mechanisms: #181 - #185)
// ============================================================================
function generateHoldRelease(score: number, subType: string): Challenge {
  const id = `hold_${subType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const speedMult = getSpeedMultiplier(score);
  const targetWidth = Math.max(15, Math.round(24 / Math.pow(speedMult, 0.35)));
  const fillDurationMs = Math.max(1250, Math.round(2100 / Math.pow(speedMult, 0.5)));
  const durationMs = getDynamicDuration(6200, score, 3800);

  const configs: Record<
    string,
    { title: string; instruction: string; icon: string; actionLabel: string; hint: string; minStart: number; maxStart: number }
  > = {
    slingshot_pull: {
      title: 'SLINGSHOT PULL',
      instruction: 'DRAW & RELEASE IN GREEN!',
      icon: '🏹',
      actionLabel: 'HOLD TO DRAW',
      hint: 'Pull bowstring into the green band, then let go',
      minStart: 52,
      maxStart: 70,
    },
    breath_hold: {
      title: 'BREATH HOLD',
      instruction: 'SURFACE IN GREEN ZONE!',
      icon: '🤿',
      actionLabel: 'HOLD BREATH',
      hint: 'Hold until oxygen gauge enters the green zone',
      minStart: 45,
      maxStart: 68,
    },
    turbo_boost: {
      title: 'TURBO BOOST',
      instruction: 'REV RPM INTO GREEN!',
      icon: '🏎️',
      actionLabel: 'HOLD PEDAL',
      hint: 'Rev engine into launch RPM and release for boost',
      minStart: 58,
      maxStart: 72,
    },
    balloon_inflate: {
      title: 'BALLOON INFLATE',
      instruction: 'PUMP WITHOUT POPPING!',
      icon: '🎈',
      actionLabel: 'HOLD TO PUMP',
      hint: 'Inflate to the green size ring — release before 100%',
      minStart: 50,
      maxStart: 70,
    },
    sniper_breath: {
      title: 'SNIPER BREATH',
      instruction: 'STEADY SCOPE & FIRE!',
      icon: '🔭',
      actionLabel: 'HOLD TO STEADY',
      hint: 'Hold breath until scope locks in green, then release',
      minStart: 40,
      maxStart: 66,
    },
  };

  const cfg = configs[subType] || configs.slingshot_pull;
  const maxAllowedStart = Math.min(cfg.maxStart, 88 - targetWidth);
  const targetStart = Math.floor(cfg.minStart + Math.random() * Math.max(4, maxAllowedStart - cfg.minStart));

  return {
    id,
    type: 'hold_release',
    title: cfg.title,
    instruction: cfg.instruction,
    durationMs,
    payload: {
      type: 'hold_release',
      data: {
        subType,
        centerIcon: cfg.icon,
        actionLabel: cfg.actionLabel,
        targetStartPercent: targetStart,
        targetWidthPercent: targetWidth,
        fillDurationMs,
        hint: cfg.hint,
      },
    },
  };
}

// ============================================================================
// 2. DIAL ROTATE ALIGNMENT (5 New Mechanisms: #186 - #190)
// ============================================================================
function generateDialRotate(score: number, subType: string): Challenge {
  const id = `dial_${subType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const durationMs = getDynamicDuration(6400, score, 3900);

  const configs: Record<
    string,
    { title: string; icon: string; stepsCount: 4 | 8; labels: string[]; makeInstruction: (lbl: string) => string; hint: string }
  > = {
    compass_align: {
      title: 'COMPASS ALIGN',
      icon: '🧭',
      stepsCount: 4,
      labels: ['N', 'E', 'S', 'W'],
      makeInstruction: (lbl) => `POINT COMPASS TO ${lbl}`,
      hint: 'Rotate compass needle to match target bearing',
    },
    safe_cracker: {
      title: 'SAFE CRACKER',
      icon: '🔓',
      stepsCount: 8,
      labels: ['0', '15', '30', '45', '60', '75', '90', '105'],
      makeInstruction: (lbl) => `TURN DIAL TO ${lbl}`,
      hint: 'Align vault tumbler with the green combination',
    },
    dish_aim: {
      title: 'SATELLITE DISH',
      icon: '📡',
      stepsCount: 4,
      labels: ['0°', '90°', '180°', '270°'],
      makeInstruction: (lbl) => `AIM DISH TO ${lbl}`,
      hint: 'Rotate radar dish onto the green orbital signal',
    },
    clock_set: {
      title: 'CLOCK HANDS',
      icon: '🕒',
      stepsCount: 4,
      labels: ['12:00', '3:00', '6:00', '9:00'],
      makeInstruction: (lbl) => `SET CLOCK TO ${lbl}`,
      hint: 'Spin the hand to the requested hour and lock',
    },
    laser_mirror: {
      title: 'LASER MIRROR',
      icon: '🔦',
      stepsCount: 8,
      labels: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
      makeInstruction: (lbl) => `BOUNCE BEAM TO ${lbl}`,
      hint: 'Angle the mirror prism toward the green receiver',
    },
  };

  const cfg = configs[subType] || configs.compass_align;
  const targetStep = Math.floor(Math.random() * cfg.stepsCount);
  const offset = 1 + Math.floor(Math.random() * (cfg.stepsCount - 1));
  const initialStep = (targetStep + offset) % cfg.stepsCount;
  const targetLabel = cfg.labels[targetStep];

  return {
    id,
    type: 'dial_rotate',
    title: cfg.title,
    instruction: cfg.makeInstruction(targetLabel),
    durationMs,
    payload: {
      type: 'dial_rotate',
      data: {
        subType,
        centerIcon: cfg.icon,
        stepsCount: cfg.stepsCount,
        initialStep,
        targetStep,
        stepLabels: cfg.labels,
        targetLabel,
        hint: cfg.hint,
      },
    },
  };
}

// ============================================================================
// 3. PATTERN GRID MULTI-TAP (5 New Mechanisms: #191 - #195)
// ============================================================================
function generatePatternGrid(score: number, subType: string): Challenge {
  const id = `grid_${subType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const durationMs = getDynamicDuration(6400, score, 3900);
  const allIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  let title = 'LIGHTS OUT';
  let instruction = 'TAP ALL RED BULBS!';
  let hint = 'Turn off every lit alarm bulb';
  let cells: PatternGridCell[] = [];
  let previewIndices: number[] | undefined;

  if (subType === 'lights_out') {
    const litCount = score >= 18 ? 4 : 3;
    const targets = new Set(shuffle(allIndices).slice(0, litCount));
    title = 'LIGHTS OUT';
    instruction = 'SHUT OFF ALL ALARM BULBS!';
    hint = 'Tap only glowing warning bulbs';
    cells = allIndices.map((index) => ({
      index,
      icon: targets.has(index) ? '🚨' : '⚫',
      isTarget: targets.has(index),
      isLit: targets.has(index),
    }));
  } else if (subType === 'star_grid') {
    const starCount = score >= 18 ? 4 : 3;
    const targets = new Set(shuffle(allIndices).slice(0, starCount));
    title = 'STAR COLLECTOR';
    instruction = 'TAP ALL STARS — AVOID SKULLS!';
    hint = 'Collect every golden star';
    cells = allIndices.map((index) => ({
      index,
      icon: targets.has(index) ? '⭐' : '💀',
      isTarget: targets.has(index),
      isLit: false,
    }));
  } else if (subType === 'row_match') {
    const rows = [
      { name: 'TOP ROW', indices: [0, 1, 2] },
      { name: 'MIDDLE ROW', indices: [3, 4, 5] },
      { name: 'BOTTOM ROW', indices: [6, 7, 8] },
    ];
    const pickedRow = pick(rows);
    const targets = new Set(pickedRow.indices);
    title = 'ROW CLEANER';
    instruction = `CLEAR THE ${pickedRow.name}!`;
    hint = `Tap all 3 bricks in the ${pickedRow.name.toLowerCase()}`;
    cells = allIndices.map((index) => ({
      index,
      icon: '🧱',
      isTarget: targets.has(index),
      isLit: targets.has(index),
    }));
  } else if (subType === 'corner_lock') {
    const corners = new Set([0, 2, 6, 8]);
    title = 'CORNER LOCK';
    instruction = 'LOCK ALL 4 CORNERS!';
    hint = 'Tap only the 4 corner bolts';
    cells = allIndices.map((index) => ({
      index,
      icon: corners.has(index) ? '🔩' : '✖️',
      isTarget: corners.has(index),
      isLit: false,
    }));
  } else {
    // symmetry_grid
    const count = 3;
    const pattern = shuffle(allIndices).slice(0, count);
    const targets = new Set(pattern);
    previewIndices = pattern;
    title = 'PATTERN COPY';
    instruction = 'MATCH THE MINI GRID!';
    hint = 'Tap the exact same 3 squares shown above';
    cells = allIndices.map((index) => ({
      index,
      icon: '⬜',
      isTarget: targets.has(index),
      isLit: false,
    }));
  }

  return {
    id,
    type: 'pattern_grid',
    title,
    instruction,
    durationMs,
    payload: {
      type: 'pattern_grid',
      data: {
        subType,
        cells,
        previewIndices,
        hint,
      },
    },
  };
}

// ============================================================================
// 4. SLIDER MATCH TUNER (5 New Mechanisms: #196 - #200)
// ============================================================================
function generateSliderMatch(score: number, subType: string): Challenge {
  const id = `slider_${subType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const durationMs = getDynamicDuration(6600, score, 4100);
  const speedMult = getSpeedMultiplier(score);

  const configs: Record<
    string,
    {
      title: string;
      icon: string;
      unit: string;
      minVal: number;
      maxVal: number;
      bandSize: number;
      confirmLabel: string;
      hint: string;
      isFocusMode?: boolean;
      makeInstruction: (min: number, max: number, unit: string) => string;
    }
  > = {
    radio_tuner: {
      title: 'RADIO TUNER',
      icon: '📻',
      unit: ' MHz',
      minVal: 88,
      maxVal: 108,
      bandSize: 4,
      confirmLabel: 'LOCK SIGNAL',
      hint: 'Slide radio tuner into the clear station band',
      makeInstruction: (min, max, u) => `TUNE TO ${min}–${max}${u}`,
    },
    reactor_slider: {
      title: 'REACTOR TEMP',
      icon: '☢️',
      unit: '°',
      minVal: 0,
      maxVal: 100,
      bandSize: 18,
      confirmLabel: 'STABILIZE',
      hint: 'Move coolant slider into the green safety band',
      makeInstruction: (min, max, u) => `SET TEMP: ${min}${u}–${max}${u}`,
    },
    volume_mixer: {
      title: 'STUDIO MIXER',
      icon: '🎚️',
      unit: ' dB',
      minVal: 0,
      maxVal: 100,
      bandSize: 18,
      confirmLabel: 'SET LEVEL',
      hint: 'Drag studio fader to match target audio volume',
      makeInstruction: (min, max, u) => `MIX TO ${min}–${max}${u}`,
    },
    lens_focus: {
      title: 'CAMERA FOCUS',
      icon: pick(['🦅', '🦋', '🦁', '🏎️', '🌺', '🚀']),
      unit: '%',
      minVal: 0,
      maxVal: 100,
      bandSize: 18,
      confirmLabel: 'SNAP PHOTO',
      hint: 'Slide lens until the blurred image turns razor sharp',
      isFocusMode: true,
      makeInstruction: () => 'FOCUS LENS UNTIL SHARP!',
    },
    tank_fill: {
      title: 'WATER LEVEL',
      icon: '💧',
      unit: '%',
      minVal: 0,
      maxVal: 100,
      bandSize: 18,
      confirmLabel: 'SEAL VALVE',
      hint: 'Match the green fill line before locking the valve',
      makeInstruction: (min, max, u) => `FILL TANK: ${min}–${max}${u}`,
    },
  };

  const cfg = configs[subType] || configs.radio_tuner;
  const effectiveBand = Math.max(
    cfg.unit === ' MHz' ? 3 : 14,
    Math.round(cfg.bandSize / Math.pow(speedMult, 0.25))
  );
  const range = cfg.maxVal - cfg.minVal;
  const margin = Math.round(range * 0.12);
  const targetMin = Math.floor(
    cfg.minVal + margin + Math.random() * Math.max(1, range - margin * 2 - effectiveBand)
  );
  const targetMax = targetMin + effectiveBand;
  const targetCenter = (targetMin + targetMax) / 2;

  // Start slider far away from the target band
  const initialVal =
    targetCenter > cfg.minVal + range / 2
      ? cfg.minVal + Math.round(range * 0.08)
      : cfg.maxVal - Math.round(range * 0.08);

  const targetLabel = `${targetMin}–${targetMax}${cfg.unit}`;

  return {
    id,
    type: 'slider_match',
    title: cfg.title,
    instruction: cfg.makeInstruction(targetMin, targetMax, cfg.unit),
    durationMs,
    payload: {
      type: 'slider_match',
      data: {
        subType,
        centerIcon: cfg.icon,
        unit: cfg.unit,
        minVal: cfg.minVal,
        maxVal: cfg.maxVal,
        initialVal,
        targetMin,
        targetMax,
        targetLabel,
        isFocusMode: cfg.isFocusMode,
        confirmLabel: cfg.confirmLabel,
        hint: cfg.hint,
      },
    },
  };
}

// ============================================================================
// 5. WORD REFLEX & LOGIC (5 New Mechanisms: #201 - #205)
// ============================================================================
const ANTONYM_BANK = [
  { word: 'HOT', answer: 'COLD', fakes: ['WARM', 'DRY', 'FAST'] },
  { word: 'FAST', answer: 'SLOW', fakes: ['QUICK', 'HIGH', 'LOUD'] },
  { word: 'RISE', answer: 'FALL', fakes: ['JUMP', 'GROW', 'SOAR'] },
  { word: 'DARK', answer: 'LIGHT', fakes: ['DEEP', 'DIM', 'COLD'] },
  { word: 'PUSH', answer: 'PULL', fakes: ['PRESS', 'LIFT', 'HOLD'] },
  { word: 'OPEN', answer: 'CLOSE', fakes: ['WIDE', 'FREE', 'DOOR'] },
  { word: 'WIN', answer: 'LOSE', fakes: ['BEAT', 'PLAY', 'DRAW'] },
  { word: 'HARD', answer: 'SOFT', fakes: ['FIRM', 'TOUGH', 'ROCK'] },
  { word: 'EMPTY', answer: 'FULL', fakes: ['BLANK', 'ZERO', 'OPEN'] },
  { word: 'LOUD', answer: 'QUIET', fakes: ['NOISY', 'BIG', 'SHARP'] },
];

const RHYME_BANK = [
  { word: 'FIRE', answer: 'WIRE', fakes: ['BURN', 'FLAME', 'IRON'] },
  { word: 'LIGHT', answer: 'NIGHT', fakes: ['LAMP', 'GLOW', 'DARK'] },
  { word: 'GOLD', answer: 'COLD', fakes: ['COIN', 'RICH', 'GLOW'] },
  { word: 'STAR', answer: 'CAR', fakes: ['MOON', 'SKY', 'SUN'] },
  { word: 'RING', answer: 'KING', fakes: ['BELL', 'GOLD', 'HAND'] },
  { word: 'CAKE', answer: 'LAKE', fakes: ['SWEET', 'PIE', 'FORK'] },
  { word: 'RAIN', answer: 'TRAIN', fakes: ['CLOUD', 'DROP', 'STORM'] },
  { word: 'SHIP', answer: 'FLIP', fakes: ['BOAT', 'WAVE', 'SAIL'] },
  { word: 'LOCK', answer: 'ROCK', fakes: ['KEY', 'DOOR', 'SAFE'] },
];

const FIRST_LETTER_BANK = [
  { letter: 'B', correct: { label: 'BANANA', icon: '🍌' }, fakes: [{ label: 'APPLE', icon: '🍎' }, { label: 'GRAPE', icon: '🍇' }, { label: 'CHERRY', icon: '🍒' }] },
  { letter: 'R', correct: { label: 'ROCKET', icon: '🚀' }, fakes: [{ label: 'CAR', icon: '🚗' }, { label: 'TRAIN', icon: '🚆' }, { label: 'BOAT', icon: '⛵' }] },
  { letter: 'T', correct: { label: 'TIGER', icon: '🐯' }, fakes: [{ label: 'LION', icon: '🦁' }, { label: 'PANDA', icon: '🐼' }, { label: 'FOX', icon: '🦊' }] },
  { letter: 'P', correct: { label: 'PIZZA', icon: '🍕' }, fakes: [{ label: 'BURGER', icon: '🍔' }, { label: 'TACO', icon: '🌮' }, { label: 'CAKE', icon: '🍰' }] },
  { letter: 'M', correct: { label: 'MOON', icon: '🌙' }, fakes: [{ label: 'STAR', icon: '⭐' }, { label: 'SUN', icon: '☀️' }, { label: 'CLOUD', icon: '☁️' }] },
  { letter: 'G', correct: { label: 'GUITAR', icon: '🎸' }, fakes: [{ label: 'DRUM', icon: '🥁' }, { label: 'HORN', icon: '🎺' }, { label: 'VIOLIN', icon: '🎻' }] },
  { letter: 'C', correct: { label: 'CROWN', icon: '👑' }, fakes: [{ label: 'SHIELD', icon: '🛡️' }, { label: 'KEY', icon: '🔑' }, { label: 'RING', icon: '💍' }] },
  { letter: 'D', correct: { label: 'DOLPHIN', icon: '🐬' }, fakes: [{ label: 'SHARK', icon: '🦈' }, { label: 'WHALE', icon: '🐳' }, { label: 'OCTOPUS', icon: '🐙' }] },
];

const MISSING_LETTER_BANK = [
  { masked: 'F L _ M E', answer: 'A', full: 'FLAME', fakes: ['O', 'I', 'U'] },
  { masked: 'S P _ E D', answer: 'E', full: 'SPEED', fakes: ['A', 'O', 'U'] },
  { masked: 'S T _ R M', answer: 'O', full: 'STORM', fakes: ['E', 'I', 'U'] },
  { masked: 'L _ S E R', answer: 'A', full: 'LASER', fakes: ['O', 'U', 'I'] },
  { masked: 'B R _ I N', answer: 'A', full: 'BRAIN', fakes: ['E', 'O', 'U'] },
  { masked: 'T _ G E R', answer: 'I', full: 'TIGER', fakes: ['A', 'O', 'U'] },
  { masked: 'S P _ C E', answer: 'A', full: 'SPACE', fakes: ['E', 'I', 'O'] },
  { masked: 'C R _ W N', answer: 'O', full: 'CROWN', fakes: ['A', 'E', 'I'] },
  { masked: 'P O W _ R', answer: 'E', full: 'POWER', fakes: ['A', 'I', 'U'] },
  { masked: 'S H _ R K', answer: 'A', full: 'SHARK', fakes: ['E', 'O', 'U'] },
];

const CATEGORY_ODD_BANK = [
  { group: 'Fruits', odd: 'CHAIR', common: ['APPLE', 'MANGO', 'GRAPE'] },
  { group: 'Planets', odd: 'RIVER', common: ['MARS', 'VENUS', 'SATURN'] },
  { group: 'Animals', odd: 'SPOON', common: ['LION', 'ZEBRA', 'PANDA'] },
  { group: 'Vehicles', odd: 'PILLOW', common: ['TRAIN', 'TRUCK', 'PLANE'] },
  { group: 'Colors', odd: 'HAMMER', common: ['GREEN', 'BLUE', 'PURPLE'] },
  { group: 'Sports', odd: 'LAPTOP', common: ['TENNIS', 'SOCCER', 'BOXING'] },
  { group: 'Weather', odd: 'SHOES', common: ['STORM', 'SNOW', 'RAIN'] },
  { group: 'Ocean', odd: 'DESERT', common: ['SHARK', 'WHALE', 'CORAL'] },
];

function generateWordReflex(score: number, subType: string): Challenge {
  const id = `word_${subType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const durationMs = getDynamicDuration(6200, score, 3600);

  if (subType === 'antonym_clash') {
    const entry = pick(ANTONYM_BANK);
    const options = shuffle([
      { id: 'w_ans', label: entry.answer, isCorrect: true },
      ...entry.fakes.map((f, i) => ({ id: `w_f_${i}`, label: f, isCorrect: false })),
    ]);
    return {
      id,
      type: 'word_reflex',
      title: 'ANTONYM CLASH',
      instruction: 'TAP THE OPPOSITE WORD!',
      durationMs,
      payload: {
        type: 'word_reflex',
        data: {
          subType,
          badge: 'OPPOSITE MEANING',
          prompt: entry.word,
          options,
          explanation: `Opposite of ${entry.word} is ${entry.answer}`,
        },
      },
    };
  }

  if (subType === 'rhyme_spark') {
    const entry = pick(RHYME_BANK);
    const options = shuffle([
      { id: 'w_ans', label: entry.answer, isCorrect: true },
      ...entry.fakes.map((f, i) => ({ id: `w_f_${i}`, label: f, isCorrect: false })),
    ]);
    return {
      id,
      type: 'word_reflex',
      title: 'RHYMING SPARK',
      instruction: 'TAP THE WORD THAT RHYMES!',
      durationMs,
      payload: {
        type: 'word_reflex',
        data: {
          subType,
          badge: 'RHYME MATCH',
          prompt: entry.word,
          options,
          explanation: `${entry.answer} rhymes with ${entry.word}`,
        },
      },
    };
  }

  if (subType === 'first_letter') {
    const entry = pick(FIRST_LETTER_BANK);
    const options = shuffle([
      { id: 'w_ans', label: entry.correct.label, icon: entry.correct.icon, isCorrect: true },
      ...entry.fakes.map((f, i) => ({ id: `w_f_${i}`, label: f.label, icon: f.icon, isCorrect: false })),
    ]);
    return {
      id,
      type: 'word_reflex',
      title: 'FIRST LETTER SNAP',
      instruction: `STARTS WITH "${entry.letter}"!`,
      durationMs,
      payload: {
        type: 'word_reflex',
        data: {
          subType,
          badge: 'LETTER SNAP',
          prompt: `LETTER "${entry.letter}"`,
          promptSub: `Pick the item starting with ${entry.letter}`,
          options,
          explanation: `${entry.correct.label} starts with ${entry.letter}`,
        },
      },
    };
  }

  if (subType === 'missing_letter') {
    const entry = pick(MISSING_LETTER_BANK);
    const options = shuffle([
      { id: 'w_ans', label: entry.answer, isCorrect: true },
      ...entry.fakes.map((f, i) => ({ id: `w_f_${i}`, label: f, isCorrect: false })),
    ]);
    return {
      id,
      type: 'word_reflex',
      title: 'MISSING LETTER',
      instruction: 'FILL THE MISSING LETTER!',
      durationMs,
      payload: {
        type: 'word_reflex',
        data: {
          subType,
          badge: 'COMPLETE THE WORD',
          prompt: entry.masked,
          options,
          explanation: `The complete word is ${entry.full}`,
        },
      },
    };
  }

  // category_odd
  const entry = pick(CATEGORY_ODD_BANK);
  const options = shuffle([
    { id: 'w_ans', label: entry.odd, isCorrect: true },
    ...entry.common.map((c, i) => ({ id: `w_f_${i}`, label: c, isCorrect: false })),
  ]);
  return {
    id,
    type: 'word_reflex',
    title: 'CATEGORY OUTLIER',
    instruction: 'WHICH ONE DOES NOT BELONG?',
    durationMs,
    payload: {
      type: 'word_reflex',
      data: {
        subType: 'category_odd',
        badge: 'ODD WORD OUT',
        prompt: 'SPOT THE OUTLIER',
        promptSub: '3 share a category — tap the 1 that does not',
        options,
        explanation: `${entry.odd} is not in the ${entry.group} group`,
      },
    },
  };
}

// ============================================================================
// 6. DUAL REFLEX SPLIT-SCREEN COMPARISON (5 New Mechanisms: #206 - #210)
// ============================================================================
const HEAVY_PAIRS = [
  { heavy: { label: 'ELEPHANT', icon: '🐘' }, light: { label: 'MOUSE', icon: '🐁' } },
  { heavy: { label: 'TRUCK', icon: '🚚' }, light: { label: 'BICYCLE', icon: '🚲' } },
  { heavy: { label: 'ANCHOR', icon: '⚓' }, light: { label: 'FEATHER', icon: '🪶' } },
  { heavy: { label: 'WHALE', icon: '🐳' }, light: { label: 'GOLDFISH', icon: '🐠' } },
  { heavy: { label: 'BOULDER', icon: '🪨' }, light: { label: 'BALLOON', icon: '🎈' } },
  { heavy: { label: 'TRAIN', icon: '🚆' }, light: { label: 'SCOOTER', icon: '🛴' } },
  { heavy: { label: 'PIANO', icon: '🎹' }, light: { label: 'FLUTE', icon: '🪈' } },
];

const SPEED_PAIRS = [
  { fast: { label: 'JET PLANE', icon: '✈️' }, slow: { label: 'BICYCLE', icon: '🚲' } },
  { fast: { label: 'CHEETAH', icon: '🐆' }, slow: { label: 'TURTLE', icon: '🐢' } },
  { fast: { label: 'ROCKET', icon: '🚀' }, slow: { label: 'SAILBOAT', icon: '⛵' } },
  { fast: { label: 'RACECAR', icon: '🏎️' }, slow: { label: 'SNAIL', icon: '🐌' } },
  { fast: { label: 'BULLET TRAIN', icon: '🚄' }, slow: { label: 'SKATEBOARD', icon: '🛹' } },
  { fast: { label: 'EAGLE', icon: '🦅' }, slow: { label: 'PENGUIN', icon: '🐧' } },
  { fast: { label: 'LIGHTNING', icon: '⚡' }, slow: { label: 'CLOUD', icon: '☁️' } },
];

function generateDualReflex(score: number, subType: string): Challenge {
  const id = `dual_${subType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const durationMs = getDynamicDuration(6000, score, 3500);

  if (subType === 'heavy_scale') {
    const pair = pick(HEAVY_PAIRS);
    const heavyOnLeft = Math.random() > 0.5;
    return {
      id,
      type: 'dual_reflex',
      title: 'HEAVY SCALE',
      instruction: 'TAP WHICH IS HEAVIER!',
      durationMs,
      payload: {
        type: 'dual_reflex',
        data: {
          subType,
          mode: 'pick_side',
          left: heavyOnLeft ? pair.heavy : pair.light,
          right: heavyOnLeft ? pair.light : pair.heavy,
          correctAnswer: heavyOnLeft ? 'LEFT' : 'RIGHT',
          explanation: `${pair.heavy.label} is heavier than ${pair.light.label}!`,
          hint: 'Instant weight comparison',
        },
      },
    };
  }

  if (subType === 'speed_clash') {
    const pair = pick(SPEED_PAIRS);
    const fastOnLeft = Math.random() > 0.5;
    return {
      id,
      type: 'dual_reflex',
      title: 'SPEED CLASH',
      instruction: 'TAP WHICH IS FASTER!',
      durationMs,
      payload: {
        type: 'dual_reflex',
        data: {
          subType,
          mode: 'pick_side',
          left: fastOnLeft ? pair.fast : pair.slow,
          right: fastOnLeft ? pair.slow : pair.fast,
          correctAnswer: fastOnLeft ? 'LEFT' : 'RIGHT',
          explanation: `${pair.fast.label} is faster than ${pair.slow.label}!`,
          hint: 'Instant speed comparison',
        },
      },
    };
  }

  if (subType === 'dot_crowd') {
    const dotIcon = pick(['🔵', '⭐', '💎', '🟠', '🟢', '❤️']);
    const base = Math.floor(Math.random() * 4) + 4; // 4 to 7
    const diff = score >= 18 ? 2 : 3;
    const moreCount = base + diff;
    const moreOnLeft = Math.random() > 0.5;
    const leftCount = moreOnLeft ? moreCount : base;
    const rightCount = moreOnLeft ? base : moreCount;

    return {
      id,
      type: 'dual_reflex',
      title: 'DOT CROWD',
      instruction: 'WHICH SIDE HAS MORE?',
      durationMs,
      payload: {
        type: 'dual_reflex',
        data: {
          subType,
          mode: 'pick_side',
          left: { label: '', dots: Array(leftCount).fill(dotIcon) },
          right: { label: '', dots: Array(rightCount).fill(dotIcon) },
          correctAnswer: moreOnLeft ? 'LEFT' : 'RIGHT',
          explanation: `Left had ${leftCount}, Right had ${rightCount}!`,
          hint: 'Spot the bigger cluster at a glance',
        },
      },
    };
  }

  if (subType === 'math_duel') {
    const makeExpr = () => {
      const useMul = Math.random() > 0.55;
      if (useMul) {
        const a = Math.floor(Math.random() * 6) + 2;
        const b = Math.floor(Math.random() * 4) + 2;
        return { text: `${a} × ${b}`, val: a * b };
      }
      const a = Math.floor(Math.random() * 14) + 4;
      const b = Math.floor(Math.random() * 12) + 3;
      return { text: `${a} + ${b}`, val: a + b };
    };

    let e1 = makeExpr();
    let e2 = makeExpr();
    while (e1.val === e2.val) {
      e2 = makeExpr();
    }

    return {
      id,
      type: 'dual_reflex',
      title: 'MATH DUEL',
      instruction: 'TAP THE HIGHER VALUE!',
      durationMs,
      payload: {
        type: 'dual_reflex',
        data: {
          subType,
          mode: 'pick_side',
          left: { label: e1.text, subLabel: 'LEFT' },
          right: { label: e2.text, subLabel: 'RIGHT' },
          correctAnswer: e1.val > e2.val ? 'LEFT' : 'RIGHT',
          explanation: `${e1.text} = ${e1.val} vs ${e2.text} = ${e2.val}`,
          hint: 'Calculate both sides fast',
        },
      },
    };
  }

  // twin_check
  const symbolPool = ['▲', '●', '■', '★', '◆', '✚'];
  const leftSeq = Array.from({ length: 4 }, () => pick(symbolPool));
  const isSame = Math.random() > 0.5;
  let rightSeq = [...leftSeq];
  if (!isSame) {
    const mutateIdx = Math.floor(Math.random() * 4);
    const alts = symbolPool.filter((s) => s !== rightSeq[mutateIdx]);
    rightSeq[mutateIdx] = pick(alts);
  }

  return {
    id,
    type: 'dual_reflex',
    title: 'TWIN CHECK',
    instruction: 'SAME OR DIFFERENT?',
    durationMs,
    payload: {
      type: 'dual_reflex',
      data: {
        subType: 'twin_check',
        mode: 'same_diff',
        left: { label: leftSeq.join(' ') },
        right: { label: rightSeq.join(' ') },
        correctAnswer: isSame ? 'SAME' : 'DIFFERENT',
        explanation: isSame ? 'Both patterns were identical!' : 'One symbol differed between the two patterns!',
        hint: 'Scan all 4 symbols carefully',
      },
    },
  };
}

// ============================================================================
// 30 BRAND-NEW MECHANISMS CATALOG (#181 - #210)
// ============================================================================
export const NEW_30_MECHANICS: MechanicDefinition[] = [
  // Hold & Release Timing (181-185)
  { index: 181, id: 'mech_hold_slingshot', name: 'Slingshot Pull', icon: '🏹', category: 'Hold & Release', summary: 'Hold to draw bowstring into green zone, then release', type: 'hold_release', generator: (s) => generateHoldRelease(s, 'slingshot_pull') },
  { index: 182, id: 'mech_hold_breath', name: 'Breath Hold Dive', icon: '🤿', category: 'Hold & Release', summary: 'Hold oxygen gauge until the green surface window', type: 'hold_release', generator: (s) => generateHoldRelease(s, 'breath_hold') },
  { index: 183, id: 'mech_hold_turbo', name: 'Turbo Launch RPM', icon: '🏎️', category: 'Hold & Release', summary: 'Hold gas pedal to hit launch RPM and release', type: 'hold_release', generator: (s) => generateHoldRelease(s, 'turbo_boost') },
  { index: 184, id: 'mech_hold_balloon', name: 'Balloon Inflate', icon: '🎈', category: 'Hold & Release', summary: 'Pump balloon up to the green band without popping', type: 'hold_release', generator: (s) => generateHoldRelease(s, 'balloon_inflate') },
  { index: 185, id: 'mech_hold_sniper', name: 'Sniper Breath Lock', icon: '🔭', category: 'Hold & Release', summary: 'Steady scope into green lock window, then fire', type: 'hold_release', generator: (s) => generateHoldRelease(s, 'sniper_breath') },

  // Dial Rotate Alignment (186-190)
  { index: 186, id: 'mech_dial_compass', name: 'Compass North Align', icon: '🧭', category: 'Dial & Rotate', summary: 'Rotate compass needle to the target cardinal bearing', type: 'dial_rotate', generator: (s) => generateDialRotate(s, 'compass_align') },
  { index: 187, id: 'mech_dial_safe', name: 'Safe Dial Cracker', icon: '🔓', category: 'Dial & Rotate', summary: 'Spin the 8-step safe tumbler to the target number', type: 'dial_rotate', generator: (s) => generateDialRotate(s, 'safe_cracker') },
  { index: 188, id: 'mech_dial_dish', name: 'Satellite Dish Aim', icon: '📡', category: 'Dial & Rotate', summary: 'Rotate orbital radar dish onto the green beam', type: 'dial_rotate', generator: (s) => generateDialRotate(s, 'dish_aim') },
  { index: 189, id: 'mech_dial_clock', name: 'Clock Hand Sync', icon: '🕒', category: 'Dial & Rotate', summary: 'Rotate the clock hand to match the target hour', type: 'dial_rotate', generator: (s) => generateDialRotate(s, 'clock_set') },
  { index: 190, id: 'mech_dial_laser', name: 'Laser Mirror Bounce', icon: '🔦', category: 'Dial & Rotate', summary: 'Angle mirror prism to deflect laser into receiver', type: 'dial_rotate', generator: (s) => generateDialRotate(s, 'laser_mirror') },

  // Pattern Grid Multi-Tap (191-195)
  { index: 191, id: 'mech_grid_lights_out', name: 'Lights Out Board', icon: '🚨', category: 'Pattern Grid', summary: 'Shut off every glowing red alarm bulb on the 3x3 board', type: 'pattern_grid', generator: (s) => generatePatternGrid(s, 'lights_out') },
  { index: 192, id: 'mech_grid_stars', name: 'Star Collector Grid', icon: '⭐', category: 'Pattern Grid', summary: 'Tap every golden star while avoiding decoy skulls', type: 'pattern_grid', generator: (s) => generatePatternGrid(s, 'star_grid') },
  { index: 193, id: 'mech_grid_row', name: 'Row Brick Cleaner', icon: '🧱', category: 'Pattern Grid', summary: 'Clear every tile along the requested horizontal row', type: 'pattern_grid', generator: (s) => generatePatternGrid(s, 'row_match') },
  { index: 194, id: 'mech_grid_corners', name: 'Four-Corner Lock', icon: '🔩', category: 'Pattern Grid', summary: 'Bolt down all 4 corner tiles without touching the middle', type: 'pattern_grid', generator: (s) => generatePatternGrid(s, 'corner_lock') },
  { index: 195, id: 'mech_grid_symmetry', name: 'Mini Pattern Copy', icon: '🪞', category: 'Pattern Grid', summary: 'Replicate the highlighted reference pattern on the 3x3 grid', type: 'pattern_grid', generator: (s) => generatePatternGrid(s, 'symmetry_grid') },

  // Slider Match Tuner (196-200)
  { index: 196, id: 'mech_slider_radio', name: 'Radio Frequency Tuner', icon: '📻', category: 'Precision Slider', summary: 'Slide the FM dial to the requested MHz station', type: 'slider_match', generator: (s) => generateSliderMatch(s, 'radio_tuner') },
  { index: 197, id: 'mech_slider_reactor', name: 'Reactor Coolant Slider', icon: '☢️', category: 'Precision Slider', summary: 'Drag reactor temperature into the green safe band', type: 'slider_match', generator: (s) => generateSliderMatch(s, 'reactor_slider') },
  { index: 198, id: 'mech_slider_mixer', name: 'Studio Volume Fader', icon: '🎚️', category: 'Precision Slider', summary: 'Match the audio fader to the requested dB range', type: 'slider_match', generator: (s) => generateSliderMatch(s, 'volume_mixer') },
  { index: 199, id: 'mech_slider_focus', name: 'Camera Lens Focus', icon: '📸', category: 'Precision Slider', summary: 'Slide optical focus until the blurry target snaps sharp', type: 'slider_match', generator: (s) => generateSliderMatch(s, 'lens_focus') },
  { index: 200, id: 'mech_slider_tank', name: 'Water Tank Valve', icon: '💧', category: 'Precision Slider', summary: 'Slide tank level to the marked target fill band', type: 'slider_match', generator: (s) => generateSliderMatch(s, 'tank_fill') },

  // Word Reflex & Logic (201-205)
  { index: 201, id: 'mech_word_antonym', name: 'Antonym Clash', icon: '↔️', category: 'Word Reflex', summary: 'Tap the exact opposite word under clock pressure', type: 'word_reflex', generator: (s) => generateWordReflex(s, 'antonym_clash') },
  { index: 202, id: 'mech_word_rhyme', name: 'Rhyming Spark', icon: '🎵', category: 'Word Reflex', summary: 'Spot the word that rhymes with the prompt word', type: 'word_reflex', generator: (s) => generateWordReflex(s, 'rhyme_spark') },
  { index: 203, id: 'mech_word_first_letter', name: 'First Letter Snap', icon: '🔤', category: 'Word Reflex', summary: 'Pick the item that starts with the target letter', type: 'word_reflex', generator: (s) => generateWordReflex(s, 'first_letter') },
  { index: 204, id: 'mech_word_missing', name: 'Missing Letter Fill', icon: '🧩', category: 'Word Reflex', summary: 'Choose the missing letter to complete the word', type: 'word_reflex', generator: (s) => generateWordReflex(s, 'missing_letter') },
  { index: 205, id: 'mech_word_outlier', name: 'Category Outlier', icon: '🗂️', category: 'Word Reflex', summary: 'Identify the single word that does not fit the group', type: 'word_reflex', generator: (s) => generateWordReflex(s, 'category_odd') },

  // Dual Reflex Split Comparison (206-210)
  { index: 206, id: 'mech_dual_heavy', name: 'Heavy Scale Duel', icon: '⚖️', category: 'Dual Reflex', summary: 'Compare two objects and tap whichever is heavier', type: 'dual_reflex', generator: (s) => generateDualReflex(s, 'heavy_scale') },
  { index: 207, id: 'mech_dual_crowd', name: 'Dot Crowd Count', icon: '🔵', category: 'Dual Reflex', summary: 'Tap the side containing more scattered icons', type: 'dual_reflex', generator: (s) => generateDualReflex(s, 'dot_crowd') },
  { index: 208, id: 'mech_dual_math', name: 'Side-by-Side Math Duel', icon: '⚔️', category: 'Dual Reflex', summary: 'Compare two expressions and tap the higher value', type: 'dual_reflex', generator: (s) => generateDualReflex(s, 'math_duel') },
  { index: 209, id: 'mech_dual_speed', name: 'Speed Clash Compare', icon: '💨', category: 'Dual Reflex', summary: 'Compare two contenders and tap whichever is faster', type: 'dual_reflex', generator: (s) => generateDualReflex(s, 'speed_clash') },
  { index: 210, id: 'mech_dual_twin', name: 'Twin Pattern Check', icon: '👀', category: 'Dual Reflex', summary: 'Check if two 4-symbol sequences are SAME or DIFFERENT', type: 'dual_reflex', generator: (s) => generateDualReflex(s, 'twin_check') },
];
