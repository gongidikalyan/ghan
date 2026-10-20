import {
  Challenge,
  ChallengeType,
  ColorTapItem,
  Direction,
  DontTouchItem,
  FindOddItem,
  OrderItem,
  RPSChoice,
  ShapeItem,
} from '../types/game';
import { getDynamicDuration, getSpeedMultiplier } from './difficulty';

// 12 High-Contrast Curated Colors
const COLOR_PALETTE = [
  { name: 'BLUE', hex: '#3B82F6' },
  { name: 'RED', hex: '#EF4444' },
  { name: 'GREEN', hex: '#10B981' },
  { name: 'YELLOW', hex: '#FBBF24' },
  { name: 'PURPLE', hex: '#A855F7' },
  { name: 'ORANGE', hex: '#F97316' },
  { name: 'CYAN', hex: '#06B6D4' },
  { name: 'PINK', hex: '#EC4899' },
  { name: 'LIME', hex: '#84CC16' },
  { name: 'TEAL', hex: '#14B8A6' },
  { name: 'VIOLET', hex: '#7C3AED' },
  { name: 'ROSE', hex: '#F43F5E' },
];

// Rich Library of 10 Themed Categories for Don't Touch
const EMOJI_SETS = [
  {
    category: 'vehicles',
    forbiddenList: [
      { label: 'CAR', icon: '🚗' },
      { label: 'BUS', icon: '🚌' },
      { label: 'AIRPLANE', icon: '✈️' },
      { label: 'ROCKET', icon: '🚀' },
      { label: 'TRAIN', icon: '🚆' },
      { label: 'AMBULANCE', icon: '🚑' },
    ],
    safeList: [
      { label: 'BICYCLE', icon: '🚲' },
      { label: 'BOAT', icon: '⛵' },
      { label: 'SKATEBOARD', icon: '🛹' },
      { label: 'SCOOTER', icon: '🛴' },
      { label: 'HELICOPTER', icon: '🚁' },
      { label: 'TAXI', icon: '🚕' },
      { label: 'CANOE', icon: '🛶' },
    ],
  },
  {
    category: 'animals',
    forbiddenList: [
      { label: 'DOG', icon: '🐶' },
      { label: 'CAT', icon: '🐱' },
      { label: 'LION', icon: '🦁' },
      { label: 'BEAR', icon: '🐻' },
      { label: 'SHARK', icon: '🦈' },
      { label: 'SNAKE', icon: '🐍' },
    ],
    safeList: [
      { label: 'RABBIT', icon: '🐰' },
      { label: 'PANDA', icon: '🐼' },
      { label: 'FROG', icon: '🐸' },
      { label: 'FOX', icon: '🦊' },
      { label: 'KOALA', icon: '🐨' },
      { label: 'TIGER', icon: '🐯' },
      { label: 'MONKEY', icon: '🐵' },
      { label: 'DOLPHIN', icon: '🐬' },
    ],
  },
  {
    category: 'hazard_items',
    forbiddenList: [
      { label: 'BOMB', icon: '💣' },
      { label: 'FIRE', icon: '🔥' },
      { label: 'SKULL', icon: '💀' },
      { label: 'CACTUS', icon: '🌵' },
      { label: 'LIGHTNING', icon: '⚡' },
      { label: 'POISON', icon: '🧪' },
    ],
    safeList: [
      { label: 'GEM', icon: '💎' },
      { label: 'STAR', icon: '⭐' },
      { label: 'KEY', icon: '🔑' },
      { label: 'BELL', icon: '🔔' },
      { label: 'SHIELD', icon: '🛡️' },
      { label: 'CROWN', icon: '👑' },
      { label: 'HEART', icon: '💖' },
      { label: 'COIN', icon: '🪙' },
    ],
  },
  {
    category: 'food',
    forbiddenList: [
      { label: 'PIZZA', icon: '🍕' },
      { label: 'BURGER', icon: '🍔' },
      { label: 'DONUT', icon: '🍩' },
      { label: 'HOTDOG', icon: '🌭' },
      { label: 'FRIES', icon: '🍟' },
    ],
    safeList: [
      { label: 'APPLE', icon: '🍎' },
      { label: 'BANANA', icon: '🍌' },
      { label: 'CHERRY', icon: '🍒' },
      { label: 'GRAPES', icon: '🍇' },
      { label: 'WATERMELON', icon: '🍉' },
      { label: 'AVOCADO', icon: '🥑' },
      { label: 'PEACH', icon: '🍑' },
    ],
  },
  {
    category: 'electronics',
    forbiddenList: [
      { label: 'SMARTPHONE', icon: '📱' },
      { label: 'LAPTOP', icon: '💻' },
      { label: 'ROBOT', icon: '🤖' },
      { label: 'BATTERY', icon: '🔋' },
    ],
    safeList: [
      { label: 'CAMERA', icon: '📷' },
      { label: 'WATCH', icon: '⌚' },
      { label: 'HEADPHONES', icon: '🎧' },
      { label: 'GAMEPAD', icon: '🎮' },
      { label: 'PRINTER', icon: '🖨️' },
      { label: 'FLASHLIGHT', icon: '🔦' },
    ],
  },
  {
    category: 'sports',
    forbiddenList: [
      { label: 'SOCCER BALL', icon: '⚽' },
      { label: 'BASKETBALL', icon: '🏀' },
      { label: 'BASEBALL', icon: '⚾' },
      { label: 'BOWLING', icon: '🎳' },
    ],
    safeList: [
      { label: 'TENNIS', icon: '🎾' },
      { label: 'MEDAL', icon: '🥇' },
      { label: 'TROPHY', icon: '🏆' },
      { label: 'GOAL', icon: '🥅' },
      { label: 'SKIS', icon: '🎿' },
      { label: 'GOLF', icon: '⛳' },
    ],
  },
];

// 20+ Subtle Odd-One Variations
const ODD_EMOJI_PAIRS = [
  { common: '🔵', odd: '🟣', desc: 'Purple circle among blue' },
  { common: '⭐', odd: '🌟', desc: 'Glowing star with sparks' },
  { common: '🐱', odd: '🐶', desc: 'Dog among cats' },
  { common: '🟥', odd: '🟧', desc: 'Orange square among red' },
  { common: '🍏', odd: '🍎', desc: 'Red apple among green' },
  { common: '🚗', odd: '🏎️', desc: 'Racecar among normal cars' },
  { common: '⚪', odd: '🔘', desc: 'Dotted button among white circles' },
  { common: '🔼', odd: '🔽', desc: 'Inverted triangle' },
  { common: '💎', odd: '💠', desc: 'Diamond pattern' },
  { common: '🌙', odd: '⭐', desc: 'Star among moons' },
  { common: '😀', odd: '😃', desc: 'Open mouth smiley' },
  { common: '🕐', odd: '🕑', desc: 'Clock pointing to different hour' },
  { common: '🔋', odd: '🪫', desc: 'Low battery among full' },
  { common: '📦', odd: '📫', desc: 'Mailbox among boxes' },
  { common: '⬆️', odd: '↗️', desc: 'Diagonal arrow among up arrows' },
  { common: '🍇', odd: '🫐', desc: 'Blueberries among grapes' },
  { common: '🟩', odd: '🟨', desc: 'Yellow square among green' },
  { common: '🔒', odd: '🔓', desc: 'Unlocked padlock' },
  { common: '🌕', odd: '🌖', desc: 'Gibbous moon among full moon' },
  { common: '🎲', odd: '🎯', desc: 'Target among dice' },
];

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 1. Color Tap
function generateColorTap(score: number, forceStroop?: boolean): Challenge {
  const id = `color_tap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let itemCount = 3;
  if (score >= 25) itemCount = 6;
  else if (score >= 10) itemCount = 4;

  const shuffledColors = shuffle(COLOR_PALETTE).slice(0, itemCount);
  const targetIndex = Math.floor(Math.random() * itemCount);
  const target = shuffledColors[targetIndex];

  const isStroop = forceStroop !== undefined ? forceStroop : (score >= 14 && Math.random() > 0.45);
  let items: ColorTapItem[] = [];
  const durationMs = getDynamicDuration(6000, score, 3500);

  if (isStroop) {
    const otherColors = COLOR_PALETTE.filter(c => c.name !== target.name);
    const inkColors = shuffle(otherColors);

    items = shuffledColors.map((color, idx) => {
      const isTarget = idx === targetIndex;
      return {
        id: `ct_item_${idx}`,
        colorName: color.name,
        hex: color.hex,
        label: isTarget ? target.name : inkColors[idx % inkColors.length].name,
        isCorrect: isTarget,
      };
    });

    return {
      id,
      type: 'color_tap',
      title: 'TAP THE COLOR',
      instruction: `TAP ${target.name}`,
      durationMs,
      payload: {
        type: 'color_tap',
        data: {
          items,
          targetColorName: target.name,
          targetColorHex: target.hex,
          isStroop: true,
        },
      },
    };
  }

  items = shuffledColors.map((color, idx) => ({
    id: `ct_item_${idx}`,
    colorName: color.name,
    hex: color.hex,
    isCorrect: idx === targetIndex,
  }));

  return {
    id,
    type: 'color_tap',
    title: 'TAP THE COLOR',
    instruction: `TAP ${target.name}`,
    durationMs,
    payload: {
      type: 'color_tap',
      data: {
        items,
        targetColorName: target.name,
        targetColorHex: target.hex,
      },
    },
  };
}

// 2. Don't Touch
function generateDontTouch(score: number, forcedCategory?: string): Challenge {
  const id = `dont_touch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const chosenSet = forcedCategory
    ? EMOJI_SETS.find(s => s.category === forcedCategory) || EMOJI_SETS[0]
    : EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
  const forbiddenObj = chosenSet.forbiddenList[Math.floor(Math.random() * chosenSet.forbiddenList.length)];

  let totalItems = 4;
  if (score >= 25) totalItems = 6;
  else if (score >= 12) totalItems = 5;

  const safeCount = totalItems - 1;
  const shuffledSafe = shuffle(chosenSet.safeList);
  const selectedSafe = shuffledSafe.slice(0, safeCount);

  const rawItems: DontTouchItem[] = [
    {
      id: 'dt_forbidden',
      iconName: forbiddenObj.icon,
      label: forbiddenObj.label,
      isForbidden: true,
    },
    ...selectedSafe.map((s, i) => ({
      id: `dt_safe_${i}`,
      iconName: s.icon,
      label: s.label,
      isForbidden: false,
    })),
  ];

  const items = shuffle(rawItems);
  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'dont_touch',
    title: "DON'T TOUCH",
    instruction: `DON'T TOUCH THE ${forbiddenObj.icon} ${forbiddenObj.label}`,
    durationMs,
    payload: {
      type: 'dont_touch',
      data: {
        items,
        forbiddenLabel: forbiddenObj.label,
        forbiddenIconName: forbiddenObj.icon,
      },
    },
  };
}

// 3. Find The Odd One
function generateFindOdd(score: number, forcedPairIndex?: number): Challenge {
  const id = `find_odd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const pair = forcedPairIndex !== undefined
    ? ODD_EMOJI_PAIRS[forcedPairIndex % ODD_EMOJI_PAIRS.length]
    : ODD_EMOJI_PAIRS[Math.floor(Math.random() * ODD_EMOJI_PAIRS.length)];

  let totalItems = 4;
  let gridCols = 2;

  if (score >= 25) {
    totalItems = 12;
    gridCols = 4;
  } else if (score >= 12) {
    totalItems = 9;
    gridCols = 3;
  } else if (score >= 5) {
    totalItems = 6;
    gridCols = 3;
  }

  const oddIndex = Math.floor(Math.random() * totalItems);
  const items: FindOddItem[] = [];

  for (let i = 0; i < totalItems; i++) {
    const isOdd = i === oddIndex;
    items.push({
      id: `fo_item_${i}`,
      content: isOdd ? pair.odd : pair.common,
      isOdd,
    });
  }

  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'find_odd',
    title: 'FIND THE ODD ONE',
    instruction: 'FIND THE DIFFERENT ONE',
    durationMs,
    payload: {
      type: 'find_odd',
      data: {
        items,
        gridCols,
        oddDescription: pair.desc,
      },
    },
  };
}

// 4. Memory Position
function generateMemoryPosition(score: number, forcedGridSize?: number): Challenge {
  const id = `memory_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let gridSize = forcedGridSize || 3;
  let targetCount = 1;
  let flashDurationMs = 850;

  if (!forcedGridSize) {
    if (score >= 25) {
      gridSize = 4;
      targetCount = 2;
      flashDurationMs = 550;
    } else if (score >= 14) {
      gridSize = 3;
      targetCount = 2;
      flashDurationMs = 650;
    }
  }

  const totalTiles = gridSize * gridSize;
  const indices: number[] = [];
  while (indices.length < targetCount) {
    const r = Math.floor(Math.random() * totalTiles);
    if (!indices.includes(r)) indices.push(r);
  }

  const icons = ['🔴', '💎', '⭐', '⚡', '🔥', '👑', '🎯'];
  const targetIcon = icons[Math.floor(Math.random() * icons.length)];
  const answerTimeMs = getDynamicDuration(5150, score, 3000);

  return {
    id,
    type: 'memory_position',
    title: 'REMEMBER POSITION',
    instruction: `TAP WHERE ${targetIcon} WAS`,
    durationMs: flashDurationMs + answerTimeMs,
    payload: {
      type: 'memory_position',
      data: {
        gridSize,
        targetIndices: indices,
        targetIcon,
        flashDurationMs,
      },
    },
  };
}

// 5. Stop The Target
function generateStopTarget(score: number): Challenge {
  const id = `stop_target_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const speedMult = getSpeedMultiplier(score);
  const targetZoneWidthPercent = Math.max(14, Math.round(28 / Math.pow(speedMult, 0.4)));
  const speedMs = Math.max(700, Math.round(1800 / speedMult));
  const minStart = 15;
  const maxStart = 85 - targetZoneWidthPercent;
  const targetZoneStartPercent = Math.floor(minStart + Math.random() * (maxStart - minStart));
  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'stop_target',
    title: 'STOP THE TARGET',
    instruction: 'TAP INSIDE THE GREEN ZONE',
    durationMs,
    payload: {
      type: 'stop_target',
      data: {
        targetZoneStartPercent,
        targetZoneWidthPercent,
        speedMs,
      },
    },
  };
}

// 6. Swipe Direction
function generateSwipeDirection(score: number, forcedOpposite?: boolean): Challenge {
  const id = `swipe_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const dirs: Direction[] = ['LEFT', 'RIGHT', 'UP', 'DOWN'];
  const promptDir = dirs[Math.floor(Math.random() * dirs.length)];
  
  // Opposite rule at score >= 12 or if forced
  const isOpposite = forcedOpposite !== undefined ? forcedOpposite : (score >= 12 && Math.random() > 0.5);
  const oppositeMap: Record<Direction, Direction> = {
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
    UP: 'DOWN',
    DOWN: 'UP',
  };
  const targetDirection = isOpposite ? oppositeMap[promptDir] : promptDir;
  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'swipe_direction',
    title: 'SWIPE DIRECTION',
    instruction: isOpposite ? `SWIPE OPPOSITE OF ${promptDir}` : `SWIPE ${promptDir}`,
    durationMs,
    payload: {
      type: 'swipe_direction',
      data: {
        promptDirection: promptDir,
        targetDirection,
        isOppositeRule: isOpposite,
      },
    },
  };
}

// 7. Quick Math
function generateQuickMath(score: number, forcedMode?: 'true_false' | 'parity' | 'comparison'): Challenge {
  const id = `math_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const rand = Math.random();
  const mode = forcedMode || (rand < 0.4 ? 'true_false' : rand < 0.7 ? 'parity' : 'comparison');
  const durationMs = getDynamicDuration(6000, score, 3500);

  if (mode === 'true_false') {
    // True/False arithmetic
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    const isSum = Math.random() > 0.5;
    const correctVal = isSum ? a + b : a * 2;
    const isActuallyTrue = Math.random() > 0.5;
    const displayedVal = isActuallyTrue ? correctVal : correctVal + (Math.random() > 0.5 ? 1 : -1);

    const question = isSum ? `${a} + ${b} = ${displayedVal}` : `${a} × 2 = ${displayedVal}`;

    return {
      id,
      type: 'quick_math',
      title: 'FAST MATH',
      instruction: 'IS THIS TRUE OR FALSE?',
      durationMs,
      payload: {
        type: 'quick_math',
        data: {
          question,
          options: [
            { id: 'opt_true', label: 'TRUE', isCorrect: isActuallyTrue },
            { id: 'opt_false', label: 'FALSE', isCorrect: !isActuallyTrue },
          ],
          explanation: `${question} is ${isActuallyTrue ? 'TRUE' : 'FALSE'}`,
        },
      },
    };
  } else if (mode === 'parity') {
    // Tap Even or Odd
    const askEven = Math.random() > 0.5;
    const evenNum = (Math.floor(Math.random() * 20) + 2) * 2;
    const oddNum1 = Math.floor(Math.random() * 20) * 2 + 1;
    const oddNum2 = Math.floor(Math.random() * 20) * 2 + 3;

    const numbers = askEven 
      ? [{ num: evenNum, correct: true }, { num: oddNum1, correct: false }, { num: oddNum2, correct: false }]
      : [{ num: oddNum1, correct: true }, { num: evenNum, correct: false }, { num: evenNum + 2, correct: false }];

    const shuffled = shuffle(numbers);

    return {
      id,
      type: 'quick_math',
      title: 'NUMBER LOGIC',
      instruction: askEven ? 'TAP THE EVEN NUMBER' : 'TAP THE ODD NUMBER',
      durationMs,
      payload: {
        type: 'quick_math',
        data: {
          question: askEven ? 'FIND EVEN' : 'FIND ODD',
          options: shuffled.map((item, idx) => ({
            id: `opt_${idx}`,
            label: item.num.toString(),
            isCorrect: item.correct,
          })),
          explanation: askEven ? `${evenNum} is even` : `${oddNum1} is odd`,
        },
      },
    };
  } else {
    // Tap Highest Number
    const n1 = Math.floor(Math.random() * 70) + 10;
    const n2 = n1 + Math.floor(Math.random() * 15) + 3;
    const n3 = n1 - Math.floor(Math.random() * 8) - 2;
    const highest = Math.max(n1, n2, n3);

    const items = shuffle([n1, n2, n3]);

    return {
      id,
      type: 'quick_math',
      title: 'HIGHEST VALUE',
      instruction: 'TAP THE LARGEST NUMBER',
      durationMs,
      payload: {
        type: 'quick_math',
        data: {
          question: 'LARGEST NUMBER?',
          options: items.map((num, idx) => ({
            id: `opt_${idx}`,
            label: num.toString(),
            isCorrect: num === highest,
          })),
          explanation: `${highest} was the largest number`,
        },
      },
    };
  }
}

// 8. Tap Count
function generateTapCount(score: number, forcedCount?: number): Challenge {
  const id = `tap_count_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let targetCount = forcedCount || (Math.floor(Math.random() * 3) + 2); // 2, 3, or 4
  if (!forcedCount && score >= 20) targetCount = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5

  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'tap_count',
    title: 'RAPID TAPS',
    instruction: `TAP EXACTLY ${targetCount} TIMES!`,
    durationMs,
    payload: {
      type: 'tap_count',
      data: {
        targetCount,
      },
    },
  };
}

// 9. Rock Paper Scissors
function generateRPS(score: number, forcedLoseGoal?: boolean): Challenge {
  const id = `rps_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const choices: RPSChoice[] = ['ROCK', 'PAPER', 'SCISSORS'];
  const opponentChoice = choices[Math.floor(Math.random() * choices.length)];

  // Winning map:
  // ROCK is beaten by PAPER
  // PAPER is beaten by SCISSORS
  // SCISSORS is beaten by ROCK
  const winMap: Record<RPSChoice, RPSChoice> = {
    ROCK: 'PAPER',
    PAPER: 'SCISSORS',
    SCISSORS: 'ROCK',
  };

  // Losing map:
  const loseMap: Record<RPSChoice, RPSChoice> = {
    ROCK: 'SCISSORS',
    PAPER: 'ROCK',
    SCISSORS: 'PAPER',
  };

  const isLoseGoal = forcedLoseGoal !== undefined ? forcedLoseGoal : (score >= 16 && Math.random() > 0.6);
  const targetChoice = isLoseGoal ? loseMap[opponentChoice] : winMap[opponentChoice];
  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'rock_paper_scissors',
    title: 'ROCK PAPER SCISSORS',
    instruction: isLoseGoal ? `LOSE TO ${opponentChoice}!` : `BEAT THE ${opponentChoice}!`,
    durationMs,
    payload: {
      type: 'rock_paper_scissors',
      data: {
        opponentChoice,
        targetChoice,
        goal: isLoseGoal ? 'LOSE' : 'WIN',
      },
    },
  };
}

// 10. Shape Match
function generateShapeMatch(score: number): Challenge {
  const id = `shape_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const shapes: { key: ShapeItem['shapeKey']; label: string }[] = [
    { key: 'circle', label: 'CIRCLE' },
    { key: 'square', label: 'SQUARE' },
    { key: 'triangle', label: 'TRIANGLE' },
    { key: 'diamond', label: 'DIAMOND' },
    { key: 'star', label: 'STAR' },
    { key: 'heart', label: 'HEART' },
    { key: 'hexagon', label: 'HEXAGON' },
  ];

  const shuffledShapes = shuffle(shapes);
  let count = 4;
  if (score >= 20) count = 6;

  const activeShapes = shuffledShapes.slice(0, count);
  const targetShape = activeShapes[Math.floor(Math.random() * count)];

  const items: ShapeItem[] = activeShapes.map((s) => ({
    id: `shape_${s.key}`,
    shapeKey: s.key,
    label: s.label,
    isCorrect: s.key === targetShape.key,
  }));
  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'shape_match',
    title: 'SHAPE MATCH',
    instruction: `TAP THE ${targetShape.label}`,
    durationMs,
    payload: {
      type: 'shape_match',
      data: {
        targetShapeKey: targetShape.key,
        targetShapeLabel: targetShape.label,
        items,
      },
    },
  };
}

// 11. Order Sequence
function generateOrderSequence(score: number, forcedAlphabet?: boolean): Challenge {
  const id = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const totalSteps = score >= 20 ? 4 : 3;

  const isAlpha = forcedAlphabet !== undefined ? forcedAlphabet : Math.random() >= 0.6;
  let stepLabels: string[] = [];

  if (!isAlpha) {
    stepLabels = totalSteps === 4 ? ['1', '2', '3', '4'] : ['1', '2', '3'];
  } else {
    stepLabels = totalSteps === 4 ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C'];
  }

  const rawItems: OrderItem[] = stepLabels.map((lbl, idx) => ({
    id: `seq_${idx}`,
    label: lbl,
    stepNumber: idx + 1,
  }));

  const items = shuffle(rawItems);
  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'order_sequence',
    title: 'ORDER SEQUENCE',
    instruction: `TAP IN ORDER: ${stepLabels.join(' → ')}`,
    durationMs,
    payload: {
      type: 'order_sequence',
      data: {
        items,
        totalSteps,
      },
    },
  };
}

// 12. Lane Action (Knife Dodge, Meteor Dodge, Catch Star, Coin Catch, Laser Dodge, Falling Object, Magnetic Maze)
function generateLaneAction(score: number, forcedSubType?: string): Challenge {
  const id = `lane_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const subTypes = [
    { type: 'knife_dodge', title: 'KNIFE DODGE', instruction: 'AVOID THE KNIVES!', player: '🏃', hazard: '🔪', mode: 'dodge' as const, hint: 'Step into the safe lane!' },
    { type: 'meteor_dodge', title: 'METEOR DODGE', instruction: 'EVADE FALLING METEORS!', player: '🚀', hazard: '☄️', mode: 'dodge' as const, hint: 'Evade incoming meteors!' },
    { type: 'laser_dodge', title: 'LASER DODGE', instruction: 'AVOID ELECTRIC BEAM!', player: '🤖', hazard: '⚡', mode: 'dodge' as const, hint: 'Find the dead zone!' },
    { type: 'magnetic_maze', title: 'MAGNETIC MAZE', instruction: 'DODGE MAGNETIC SPIKES!', player: '🧲', hazard: '🌵', mode: 'dodge' as const, hint: 'Steer clear of spikes!' },
    { type: 'catch_star', title: 'CATCH THE STAR', instruction: 'CATCH THE FALLING STAR!', player: '🧺', target: '⭐', mode: 'catch' as const, hint: 'Line up basket under star!' },
    { type: 'coin_catch', title: 'COIN CATCH', instruction: 'CATCH GOLD COIN!', player: '👛', target: '🪙', mode: 'catch' as const, hint: 'Grab the falling coin!' },
    { type: 'falling_object', title: 'FALLING OBJECT', instruction: 'CATCH THE DIAMOND!', player: '🧤', target: '💎', mode: 'catch' as const, hint: 'Catch the rare gem!' },
  ];

  const picked = forcedSubType
    ? subTypes.find(s => s.type === forcedSubType) || subTypes[0]
    : subTypes[Math.floor(Math.random() * subTypes.length)];
  const laneCount = 3;
  const initialPlayerLane = 1; // Center lane

  let hazardLanes: number[] = [];
  let targetLane = 1;

  if (picked.mode === 'dodge') {
    // 1 or 2 hazard lanes
    const safeLane = Math.floor(Math.random() * laneCount);
    hazardLanes = [0, 1, 2].filter(l => l !== safeLane);
  } else {
    // Catch in a random lane
    targetLane = Math.floor(Math.random() * laneCount);
  }

  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'lane_action',
    title: picked.title,
    instruction: picked.instruction,
    durationMs,
    payload: {
      type: 'lane_action',
      data: {
        mode: picked.mode,
        playerIcon: picked.player,
        targetIcon: picked.target || '⭐',
        hazardIcon: picked.hazard || '💥',
        laneCount,
        initialPlayerLane,
        hazardLanes,
        targetLane,
        hint: picked.hint,
      },
    },
  };
}

// 13. Tension Meter (Bullseye, Rocket Launch/Landing, Knife Throw, Bottle Flip, Power Charge, Tug of War, Temperature, Balance, Wind)
function generateTensionMeter(score: number, forcedSubType?: string): Challenge {
  const id = `meter_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const meterModes = [
    { subType: 'bullseye', title: 'BULLSEYE', instruction: 'STOP POINTER IN CENTER!', icon: '🎯', zoneStart: 42, zoneWidth: 20, speed: 1100, label: 'Hit the center bullseye!' },
    { subType: 'rocket_launch', title: 'ROCKET LAUNCH', instruction: 'LAUNCH AT GREEN ZONE!', icon: '🚀', zoneStart: 65, zoneWidth: 22, speed: 1000, label: 'Hit maximum thrust!' },
    { subType: 'rocket_landing', title: 'ROCKET LANDING', instruction: 'LAND IN TOUCHDOWN ZONE!', icon: '🛬', zoneStart: 35, zoneWidth: 22, speed: 1150, label: 'Touchdown safely!' },
    { subType: 'knife_throw', title: 'KNIFE THROW', instruction: 'STRIKE TARGET BOARD!', icon: '🗡️', zoneStart: 45, zoneWidth: 18, speed: 950, label: 'Throw into the board!' },
    { subType: 'bottle_flip', title: 'BOTTLE FLIP', instruction: 'LAND BOTTLE UPRIGHT!', icon: '🍾', zoneStart: 40, zoneWidth: 18, speed: 1050, label: 'Land upright!' },
    { subType: 'power_charge', title: 'POWER CHARGE', instruction: 'STOP IN MAX POWER ZONE!', icon: '🔋', zoneStart: 72, zoneWidth: 18, speed: 900, label: 'Full charge capacity!' },
    { subType: 'tug_of_war', title: 'TUG OF WAR', instruction: 'PULL ROPE: RAPID MASH!', icon: '🪢', zoneStart: 50, zoneWidth: 50, speed: 1000, label: 'Mash button rapidly!', isMash: true },
    { subType: 'temperature_control', title: 'TEMPERATURE', instruction: 'STABILIZE TEMPERATURE!', icon: '🌡️', zoneStart: 40, zoneWidth: 22, speed: 1200, label: 'Keep in green range!' },
    { subType: 'balance_meter', title: 'BALANCE METER', instruction: 'KEEP METER BALANCED!', icon: '⚖️', zoneStart: 42, zoneWidth: 18, speed: 1100, label: 'Maintain level balance!' },
    { subType: 'wind_control', title: 'WIND CONTROL', instruction: 'ALIGN PARACHUTE WITH WIND!', icon: '🌬️', zoneStart: 38, zoneWidth: 22, speed: 1100, label: 'Adjust flap angle!' },
  ];

  const picked = forcedSubType
    ? meterModes.find(m => m.subType === forcedSubType) || meterModes[0]
    : meterModes[Math.floor(Math.random() * meterModes.length)];
  const speedMult = getSpeedMultiplier(score);
  let speed = Math.max(600, Math.round((picked.speed * 1.35) / speedMult));
  let zoneWidth = Math.max(12, Math.round(picked.zoneWidth / Math.pow(speedMult, 0.4)));

  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'tension_meter',
    title: picked.title,
    instruction: picked.instruction,
    durationMs,
    payload: {
      type: 'tension_meter',
      data: {
        meterType: picked.isMash ? 'rapid_mash' : 'timing_stop',
        subType: picked.subType,
        centerIcon: picked.icon,
        targetZoneStartPercent: picked.zoneStart,
        targetZoneWidthPercent: zoneWidth,
        speedMs: speed,
        mashTargetTaps: score >= 20 ? 6 : 5,
        label: picked.label,
      },
    },
  };
}

// 14. Floating Target (Pop Bubbles, Balloon Burst, Moving Target, Final Target, Avoid Bomb, Spot Crack)
function generateFloatingTarget(score: number, forcedSubType?: string): Challenge {
  const id = `float_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const modes = [
    { subType: 'pop_bubbles', title: 'POP THE BUBBLES', instruction: 'POP THE BUBBLE 🫧!', targetIcon: '🫧', hazardIcon: '⚪', desc: 'Pop target bubble 🫧' },
    { subType: 'balloon_burst', title: 'BALLOON BURST', instruction: 'POP THE RED BALLOON!', targetIcon: '🎈', hazardIcon: '🔵', desc: 'Pop red balloon' },
    { subType: 'moving_target', title: 'MOVING TARGET', instruction: 'HIT MOVING CROSSHAIR!', targetIcon: '🎯', hazardIcon: '🔘', desc: 'Tap crosshair target' },
    { subType: 'final_target', title: 'FINAL TARGET', instruction: 'SURVIVE AND HIT TARGET!', targetIcon: '🎪', hazardIcon: '◽', desc: 'Tap the final target' },
    { subType: 'avoid_bomb', title: 'AVOID THE BOMB', instruction: 'TAP GEM, AVOID BOMB!', targetIcon: '💎', hazardIcon: '💣', desc: 'Tap gem, never bomb!' },
    { subType: 'spot_crack', title: 'SPOT THE CRACK', instruction: 'TAP THE CRACKED SHELL 🐣!', targetIcon: '🐣', hazardIcon: '🥚', desc: 'Tap cracked item' },
  ];

  const picked = forcedSubType
    ? modes.find(m => m.subType === forcedSubType) || modes[0]
    : modes[Math.floor(Math.random() * modes.length)];

  // Create 3 floating positions
  const positions = [
    { x: 25, y: 30 },
    { x: 75, y: 35 },
    { x: 50, y: 70 },
  ];
  const shuffledPositions = shuffle(positions);
  const targetPos = shuffledPositions[0];

  const items = [
    {
      id: 'target_item_1',
      icon: picked.targetIcon,
      isTarget: true,
      xPercent: targetPos.x,
      yPercent: targetPos.y,
      sizePx: 64,
    },
    {
      id: 'hazard_item_1',
      icon: picked.hazardIcon,
      isTarget: false,
      xPercent: shuffledPositions[1].x,
      yPercent: shuffledPositions[1].y,
      sizePx: 58,
    },
    {
      id: 'hazard_item_2',
      icon: picked.hazardIcon,
      isTarget: false,
      xPercent: shuffledPositions[2].x,
      yPercent: shuffledPositions[2].y,
      sizePx: 58,
    },
  ];

  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'floating_target',
    title: picked.title,
    instruction: picked.instruction,
    durationMs,
    payload: {
      type: 'floating_target',
      data: {
        subType: picked.subType,
        items,
        requiredPops: 1,
        targetDescription: picked.desc,
        penaltyOnWrong: true,
      },
    },
  };
}

// 15. Choice Hazard (Which Door?, Trap Door, Safe Tile, Floor Is Lava, Portal Match, Teleport Choice, Key & Lock, Escape Box, Shadow Match, Color Pour, Magnet Match)
function generateChoiceHazard(score: number, forcedSubType?: string): Challenge {
  const id = `choice_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const scenarios = [
    {
      subType: 'which_door',
      title: 'WHICH DOOR?',
      instruction: 'CHOOSE THE SAFE DOOR!',
      question: 'OPEN DOOR?',
      clue: 'THE BLUE DOOR HAS NO TRAPS',
      options: [
        { id: 'opt_blue', title: 'BLUE DOOR', icon: '🟦', isCorrect: true },
        { id: 'opt_red', title: 'RED DOOR', icon: '🟥', isCorrect: false },
        { id: 'opt_gold', title: 'GOLD DOOR', icon: '🟨', isCorrect: false },
      ],
    },
    {
      subType: 'trap_door',
      title: 'TRAP DOOR',
      instruction: 'AVOID THE DANGEROUS TRAPDOOR!',
      question: 'PICK STABLE DOOR',
      clue: 'DOOR C HAS A CRUMBLING HINGE',
      options: [
        { id: 'opt_a', title: 'DOOR A', icon: '🚪', isCorrect: true },
        { id: 'opt_b', title: 'DOOR B', icon: '🚪', isCorrect: true },
        { id: 'opt_c', title: 'DOOR C ⚠️', icon: '🕳️', isCorrect: false },
      ],
    },
    {
      subType: 'floor_is_lava',
      title: 'FLOOR IS LAVA',
      instruction: 'JUMP TO SAFE PLATFORM!',
      question: 'LAVA IS RISING!',
      clue: 'STEP ON THE HARD STONE ONLY',
      options: [
        { id: 'opt_stone', title: 'STONE', icon: '🪨', isCorrect: true },
        { id: 'opt_lava', title: 'LAVA', icon: '🔥', isCorrect: false },
        { id: 'opt_magma', title: 'MAGMA', icon: '🌋', isCorrect: false },
      ],
    },
    {
      subType: 'safe_tile',
      title: 'SAFE TILE',
      instruction: 'STEP ON THE GLOWING TILE!',
      question: 'SELECT SAFE TILE',
      options: [
        { id: 'opt_green', title: 'STABLE TILE', icon: '🟩', isCorrect: true },
        { id: 'opt_decay1', title: 'CRACKED', icon: '⬛', isCorrect: false },
        { id: 'opt_decay2', title: 'BROKEN', icon: '⬛', isCorrect: false },
      ],
    },
    {
      subType: 'portal_match',
      title: 'PORTAL MATCH',
      instruction: 'SEND ORB TO PURPLE PORTAL!',
      question: 'ORB: 🔮 PURPLE',
      options: [
        { id: 'opt_p_purp', title: 'PURPLE PORTAL', icon: '🌀', isCorrect: true },
        { id: 'opt_p_oran', title: 'ORANGE PORTAL', icon: '🌀', isCorrect: false },
        { id: 'opt_p_cyan', title: 'CYAN PORTAL', icon: '🌀', isCorrect: false },
      ],
    },
    {
      subType: 'key_and_lock',
      title: 'KEY & LOCK',
      instruction: 'MATCH KEY TO GOLDEN LOCK 🔒',
      question: 'LOCK: GOLDEN 🔒',
      options: [
        { id: 'opt_k_gold', title: 'GOLD KEY', icon: '🗝️', isCorrect: true },
        { id: 'opt_k_silv', title: 'SILVER KEY', icon: '🗝️', isCorrect: false },
        { id: 'opt_k_iron', title: 'IRON KEY', icon: '🗝️', isCorrect: false },
      ],
    },
    {
      subType: 'escape_box',
      title: 'ESCAPE THE BOX',
      instruction: 'FIND THE UNLOCKED EXIT!',
      question: 'SEARCH EXIT GRATE',
      clue: 'VENT 2 HAS UNBOLTED SCREWS',
      options: [
        { id: 'opt_e_v1', title: 'VENT 1', icon: '🔒', isCorrect: false },
        { id: 'opt_e_v2', title: 'VENT 2', icon: '🚪', isCorrect: true },
        { id: 'opt_e_v3', title: 'VENT 3', icon: '🔒', isCorrect: false },
      ],
    },
    {
      subType: 'color_pour',
      title: 'COLOR POUR',
      instruction: 'POUR INTO RED BEAKER!',
      question: 'LIQUID: 🧪 RED',
      options: [
        { id: 'opt_cp_red', title: 'RED BEAKER', icon: '🧪', isCorrect: true },
        { id: 'opt_cp_blue', title: 'BLUE BEAKER', icon: '🧪', isCorrect: false },
        { id: 'opt_cp_green', title: 'GREEN BEAKER', icon: '🧪', isCorrect: false },
      ],
    },
    {
      subType: 'magnet_match',
      title: 'MAGNET MATCH',
      instruction: 'ATTRACT NORTH POLE (+)',
      question: 'TARGET: NORTH (+)',
      clue: 'Opposites attract! (+ attracts -)',
      options: [
        { id: 'opt_m_south', title: 'SOUTH (-)', icon: '🧲', isCorrect: true },
        { id: 'opt_m_north', title: 'NORTH (+)', icon: '🧲', isCorrect: false },
      ],
    },
    {
      subType: 'shadow_match',
      title: 'SHADOW MATCH',
      instruction: 'MATCH ITEM TO SHADOW ⬛',
      question: 'ANIMAL: 🦁 LION',
      options: [
        { id: 'opt_sm_lion', title: 'LION SHADOW', icon: '⬛', isCorrect: true },
        { id: 'opt_sm_bear', title: 'BEAR SHADOW', icon: '⬛', isCorrect: false },
      ],
    },
  ];

  const picked = forcedSubType
    ? scenarios.find(s => s.subType === forcedSubType) || scenarios[0]
    : scenarios[Math.floor(Math.random() * scenarios.length)];
  const shuffledOptions = shuffle(picked.options);
  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'choice_hazard',
    title: picked.title,
    instruction: picked.instruction,
    durationMs,
    payload: {
      type: 'choice_hazard',
      data: {
        subType: picked.subType,
        question: picked.question,
        clue: picked.clue,
        options: shuffledOptions,
      },
    },
  };
}

// 16. Wire Switch (Bomb Defuse, Wire Connect, Light Switch, Train Switch, Traffic Control, Pipe Connect, Gear Match, Shape Rotation)
function generateWireSwitch(score: number, forcedSubType?: string): Challenge {
  const id = `wire_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const switchModes = [
    {
      subType: 'bomb_defuse',
      title: 'BOMB DEFUSE',
      instruction: 'CUT THE BLUE WIRE!',
      prompt: 'DEFUSE TIMER TICKING!',
      items: [
        { id: 'wire_red', label: 'RED WIRE', icon: '✂️', isTargetAction: false, state: 'inactive' as const, colorHex: '#ef4444' },
        { id: 'wire_blue', label: 'BLUE WIRE', icon: '✂️', isTargetAction: true, state: 'inactive' as const, colorHex: '#3b82f6' },
        { id: 'wire_yellow', label: 'YELLOW WIRE', icon: '✂️', isTargetAction: false, state: 'inactive' as const, colorHex: '#eab308' },
      ],
    },
    {
      subType: 'wire_connect',
      title: 'WIRE CONNECT',
      instruction: 'CONNECT GREEN TERMINAL!',
      prompt: 'RESTORE POWER FLOW',
      items: [
        { id: 'w_conn_green', label: 'GREEN WIRE', icon: '🔌', isTargetAction: true, state: 'inactive' as const, colorHex: '#10b981' },
        { id: 'w_conn_purple', label: 'PURPLE WIRE', icon: '🔌', isTargetAction: false, state: 'inactive' as const, colorHex: '#a855f7' },
        { id: 'w_conn_orange', label: 'ORANGE WIRE', icon: '🔌', isTargetAction: false, state: 'inactive' as const, colorHex: '#f97316' },
      ],
    },
    {
      subType: 'light_switch',
      title: 'LIGHT SWITCH',
      instruction: 'FLIP TOGGLE #2 TO POWER ON!',
      prompt: 'GRID OVERRIDE REQUIRED',
      items: [
        { id: 'sw_1', label: 'SWITCH 1', icon: '💡', isTargetAction: false, state: 'inactive' as const, colorHex: '#64748b' },
        { id: 'sw_2', label: 'SWITCH 2', icon: '💡', isTargetAction: true, state: 'inactive' as const, colorHex: '#10b981' },
        { id: 'sw_3', label: 'SWITCH 3', icon: '💡', isTargetAction: false, state: 'inactive' as const, colorHex: '#64748b' },
      ],
    },
    {
      subType: 'train_switch',
      title: 'TRAIN SWITCH',
      instruction: 'SWITCH TO CLEAR TRACK B!',
      prompt: 'JUNCTION DEAD-END AHEAD!',
      items: [
        { id: 'tr_a', label: 'TRACK A (BLOCKED ⚠️)', icon: '🚂', isTargetAction: false, state: 'inactive' as const, colorHex: '#ef4444' },
        { id: 'tr_b', label: 'TRACK B (OPEN ✓)', icon: '🚂', isTargetAction: true, state: 'inactive' as const, colorHex: '#10b981' },
      ],
    },
    {
      subType: 'traffic_control',
      title: 'TRAFFIC CONTROL',
      instruction: 'CLEAR EMERGENCY AMBULANCE!',
      prompt: 'OPEN SIGNAL FOR AMBULANCE',
      items: [
        { id: 'tc_norm', label: 'LANE 1 (CARS)', icon: '🚗', isTargetAction: false, state: 'inactive' as const, colorHex: '#64748b' },
        { id: 'tc_amb', label: 'LANE 2 (AMBULANCE 🚑)', icon: '🚦', isTargetAction: true, state: 'inactive' as const, colorHex: '#10b981' },
      ],
    },
    {
      subType: 'pipe_connect',
      title: 'PIPE CONNECT',
      instruction: 'ROTATE VALVE B TO CONNECT!',
      prompt: 'WATER PRESSURE BUILDING',
      items: [
        { id: 'pipe_a', label: 'VALVE A', icon: '🚰', isTargetAction: false, state: 'inactive' as const, colorHex: '#64748b' },
        { id: 'pipe_b', label: 'VALVE B', icon: '🚰', isTargetAction: true, state: 'inactive' as const, colorHex: '#06b6d4' },
        { id: 'pipe_c', label: 'VALVE C', icon: '🚰', isTargetAction: false, state: 'inactive' as const, colorHex: '#64748b' },
      ],
    },
    {
      subType: 'gear_match',
      title: 'GEAR MATCH',
      instruction: 'ENGAGE DRIVE GEAR ⚙️',
      prompt: 'MESH TEETH WITH ROTATING SHAFT',
      items: [
        { id: 'gear_drive', label: 'DRIVE COG (12T)', icon: '⚙️', isTargetAction: true, state: 'inactive' as const, colorHex: '#f59e0b' },
        { id: 'gear_idle', label: 'IDLE COG (24T)', icon: '⚙️', isTargetAction: false, state: 'inactive' as const, colorHex: '#64748b' },
      ],
    },
  ];

  const picked = forcedSubType
    ? switchModes.find(s => s.subType === forcedSubType) || switchModes[0]
    : switchModes[Math.floor(Math.random() * switchModes.length)];
  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'wire_switch',
    title: picked.title,
    instruction: picked.instruction,
    durationMs,
    payload: {
      type: 'wire_switch',
      data: {
        subType: picked.subType,
        prompt: picked.prompt,
        items: picked.items,
      },
    },
  };
}

// 17. Code Puzzle (Unlock Code, Code Sequence, Disappearing Path, Mirror Match, Rapid Sort, Object Swap, Moving Puzzle)
function generateCodePuzzle(score: number, forcedSubType?: string): Challenge {
  const id = `code_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  // Choose 3 distinct digits so permutations are guaranteed strictly unique
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const n1 = digits[0];
  const n2 = digits[1];
  const n3 = digits[2];
  const pin = `${n1}${n2}${n3}`;
  const fakePin1 = `${n2}${n3}${n1}`;
  const fakePin2 = `${n3}${n1}${n2}`;

  const puzzleModes = [
    {
      subType: 'unlock_code',
      title: 'UNLOCK CODE',
      instruction: 'RECALL AND ENTER CODE!',
      displayCode: pin,
      flashMs: 800,
      options: [
        { id: 'pin_c', label: pin, isCorrect: true },
        { id: 'pin_w1', label: fakePin1, isCorrect: false },
        { id: 'pin_w2', label: fakePin2, isCorrect: false },
      ],
    },
    {
      subType: 'rapid_sort',
      title: 'RAPID SORT',
      instruction: 'SORT APPLE 🍎 INTO FRUIT BASKET!',
      displayCode: 'ITEM: 🍎 FRESH APPLE',
      flashMs: 0,
      options: [
        { id: 'sort_basket', label: 'FRUIT BASKET 🧺', isCorrect: true },
        { id: 'sort_trash', label: 'TRASH BIN 🗑️', isCorrect: false },
      ],
    },
    {
      subType: 'mirror_match',
      title: 'MIRROR MATCH',
      instruction: 'SELECT THE MIRRORED PATTERN!',
      displayCode: 'ORIGINAL: ◀ ◀ ▲',
      flashMs: 0,
      options: [
        { id: 'mm_cor', label: '▲ ▶ ▶', isCorrect: true },
        { id: 'mm_w1', label: '▼ ◀ ◀', isCorrect: false },
      ],
    },
    {
      subType: 'object_swap',
      title: 'OBJECT SWAP',
      instruction: 'COMPLETE THE SEQUENCE 🔴 🟡 🟢',
      displayCode: 'CURRENT: 🔴 🟢 🟡',
      flashMs: 0,
      options: [
        { id: 'sw_cor', label: 'SWAP POS 2 & 3', isCorrect: true },
        { id: 'sw_w1', label: 'SWAP POS 1 & 2', isCorrect: false },
      ],
    },
    {
      subType: 'disappearing_path',
      title: 'DISAPPEARING PATH',
      instruction: 'WHICH PATH WAS FLASHED?',
      displayCode: 'FLASHED: 🐾 PATH NORTH',
      flashMs: 700,
      options: [
        { id: 'dp_c', label: 'PATH NORTH', isCorrect: true },
        { id: 'dp_w', label: 'PATH SOUTH', isCorrect: false },
      ],
    },
  ];

  const picked = forcedSubType
    ? puzzleModes.find(p => p.subType === forcedSubType) || puzzleModes[0]
    : puzzleModes[Math.floor(Math.random() * puzzleModes.length)];
  const shuffledOptions = shuffle(picked.options);
  const durationMs = getDynamicDuration(6000, score, 3500);

  return {
    id,
    type: 'code_puzzle',
    title: picked.title,
    instruction: picked.instruction,
    durationMs,
    payload: {
      type: 'code_puzzle',
      data: {
        subType: picked.subType,
        displayCode: picked.displayCode,
        flashMs: picked.flashMs,
        options: shuffledOptions,
      },
    },
  };
}

export interface MechanicDefinition {
  index: number; // 1 to 180
  id: string;
  name: string;
  icon: string;
  category: string;
  summary: string;
  type: ChallengeType;
  generator: (score: number) => Challenge;
}

export const MECHANICS_CATALOG: MechanicDefinition[] = [
  { index: 1, id: 'mech_color_tap', name: 'Color Tap', icon: '🎨', category: 'Reflex & Color', summary: 'Tap the color matching the target name', type: 'color_tap', generator: (s) => generateColorTap(s, false) },
  { index: 2, id: 'mech_stroop_trap', name: 'Stroop Color Trap', icon: '🧠', category: 'Mental Trick', summary: 'Ignore ink color, read the text word', type: 'color_tap', generator: (s) => generateColorTap(s, true) },
  { index: 3, id: 'mech_dont_touch_vehicles', name: "Don't Touch Vehicles", icon: '🚗', category: 'Impulse Control', summary: 'Do not touch any vehicle icons', type: 'dont_touch', generator: (s) => generateDontTouch(s, 'vehicles') },
  { index: 4, id: 'mech_dont_touch_hazards', name: "Don't Touch Hazards", icon: '💣', category: 'Impulse Control', summary: 'Avoid explosives and hazardous spikes', type: 'dont_touch', generator: (s) => generateDontTouch(s, 'hazard_items') },
  { index: 5, id: 'mech_dont_touch_animals', name: "Don't Touch Predators", icon: '🦁', category: 'Impulse Control', summary: 'Avoid dangerous wild predator animals', type: 'dont_touch', generator: (s) => generateDontTouch(s, 'animals') },
  { index: 6, id: 'mech_dont_touch_food', name: "Don't Touch Food", icon: '🍕', category: 'Impulse Control', summary: 'Skip the fast food items', type: 'dont_touch', generator: (s) => generateDontTouch(s, 'food') },
  { index: 7, id: 'mech_dont_touch_tech', name: "Don't Touch Tech", icon: '💻', category: 'Impulse Control', summary: 'Avoid short-circuiting electronics', type: 'dont_touch', generator: (s) => generateDontTouch(s, 'electronics') },
  { index: 8, id: 'mech_dont_touch_sports', name: "Don't Touch Sports", icon: '⚽', category: 'Impulse Control', summary: 'Do not touch the sports balls', type: 'dont_touch', generator: (s) => generateDontTouch(s, 'sports') },
  { index: 9, id: 'mech_find_odd_color', name: 'Odd Color Dot', icon: '🟣', category: 'Observation', summary: 'Spot the tile with subtle tint variation', type: 'find_odd', generator: (s) => generateFindOdd(s, 0) },
  { index: 10, id: 'mech_find_odd_star', name: 'Odd Glowing Star', icon: '🌟', category: 'Observation', summary: 'Identify the rogue glowing star', type: 'find_odd', generator: (s) => generateFindOdd(s, 1) },
  { index: 11, id: 'mech_find_odd_imposter', name: 'Imposter Emoji', icon: '🐶', category: 'Observation', summary: 'Find the hidden animal imposter in the grid', type: 'find_odd', generator: (s) => generateFindOdd(s, 2) },
  { index: 12, id: 'mech_memory_grid_2x2', name: 'Memory Flash 2x2', icon: '⚡', category: 'Memory', summary: 'Remember which tile flashed briefly', type: 'memory_position', generator: (s) => generateMemoryPosition(s, 2) },
  { index: 13, id: 'mech_memory_grid_3x3', name: 'Memory Matrix 3x3', icon: '🧩', category: 'Memory', summary: 'Track target locations in 9-tile matrix', type: 'memory_position', generator: (s) => generateMemoryPosition(s, 3) },
  { index: 14, id: 'mech_stop_target', name: 'Stop In Green Zone', icon: '🎯', category: 'Timing', summary: 'Tap precisely when pointer enters green zone', type: 'stop_target', generator: (s) => generateStopTarget(s) },
  { index: 15, id: 'mech_swipe_cardinal', name: 'Direct Arrow Swipe', icon: '➡️', category: 'Agility', summary: 'Swipe fast in the exact direction shown', type: 'swipe_direction', generator: (s) => generateSwipeDirection(s, false) },
  { index: 16, id: 'mech_swipe_inverted', name: 'Inverted Swipe', icon: '🔄', category: 'Mental Trick', summary: 'Swipe in opposite direction of the arrow', type: 'swipe_direction', generator: (s) => generateSwipeDirection(s, true) },
  { index: 17, id: 'mech_math_true_false', name: 'True or False Math', icon: '➕', category: 'Speed Math', summary: 'Decide if the arithmetic equation is correct', type: 'quick_math', generator: (s) => generateQuickMath(s, 'true_false') },
  { index: 18, id: 'mech_math_parity', name: 'Even or Odd Parity', icon: '⚖️', category: 'Speed Math', summary: 'Identify the requested even or odd number', type: 'quick_math', generator: (s) => generateQuickMath(s, 'parity') },
  { index: 19, id: 'mech_math_comparison', name: 'Highest Number Pick', icon: '🔢', category: 'Speed Math', summary: 'Tap the largest number among options', type: 'quick_math', generator: (s) => generateQuickMath(s, 'comparison') },
  { index: 20, id: 'mech_tap_count', name: 'Rapid Tap Burst', icon: '👆', category: 'Twitch Reflex', summary: 'Rapidly mash screen the exact number of times', type: 'tap_count', generator: (s) => generateTapCount(s) },
  { index: 21, id: 'mech_rps_win', name: 'Rock Paper Scissors', icon: '✊', category: 'Reflex', summary: 'Select the hand that beats the opponent', type: 'rock_paper_scissors', generator: (s) => generateRPS(s, false) },
  { index: 22, id: 'mech_rps_lose', name: 'Inverse RPS (Must Lose)', icon: '✋', category: 'Mental Trick', summary: 'Defeat your instincts: select the losing hand', type: 'rock_paper_scissors', generator: (s) => generateRPS(s, true) },
  { index: 23, id: 'mech_shape_match', name: 'Shape Geometry Match', icon: '🔷', category: 'Observation', summary: 'Tap the requested geometric shape', type: 'shape_match', generator: (s) => generateShapeMatch(s) },
  { index: 24, id: 'mech_order_numbers', name: 'Order Sequence 1-2-3', icon: '🔢', category: 'Order & Speed', summary: 'Tap numbers in ascending numerical order', type: 'order_sequence', generator: (s) => generateOrderSequence(s, false) },
  { index: 25, id: 'mech_order_letters', name: 'Order Sequence A-B-C', icon: '🔤', category: 'Order & Speed', summary: 'Tap alphabet letters in sequence', type: 'order_sequence', generator: (s) => generateOrderSequence(s, true) },
  { index: 26, id: 'mech_lane_knife_dodge', name: 'Knife Dodge Lane', icon: '🔪', category: 'Action Lane', summary: 'Shift lanes away from falling blades', type: 'lane_action', generator: (s) => generateLaneAction(s, 'knife_dodge') },
  { index: 27, id: 'mech_lane_meteor_dodge', name: 'Meteor Evade Lane', icon: '☄️', category: 'Action Lane', summary: 'Steer spaceship away from incoming meteors', type: 'lane_action', generator: (s) => generateLaneAction(s, 'meteor_dodge') },
  { index: 28, id: 'mech_lane_laser_dodge', name: 'Laser Beam Dodge', icon: '⚡', category: 'Action Lane', summary: 'Find the dead zone and avoid electric laser', type: 'lane_action', generator: (s) => generateLaneAction(s, 'laser_dodge') },
  { index: 29, id: 'mech_lane_catch_star', name: 'Catch Falling Star', icon: '⭐', category: 'Action Lane', summary: 'Position basket directly under falling star', type: 'lane_action', generator: (s) => generateLaneAction(s, 'catch_star') },
  { index: 30, id: 'mech_lane_coin_catch', name: 'Catch Gold Coin', icon: '🪙', category: 'Action Lane', summary: 'Grab the gold coin before it drops away', type: 'lane_action', generator: (s) => generateLaneAction(s, 'coin_catch') },
  { index: 31, id: 'mech_tension_bullseye', name: 'Bullseye Center Stop', icon: '🎯', category: 'Tension Meter', summary: 'Stop sweeping pointer right on bullseye', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'bullseye') },
  { index: 32, id: 'mech_tension_rocket_launch', name: 'Rocket Launch Thrust', icon: '🚀', category: 'Tension Meter', summary: 'Launch engine in maximum green thrust zone', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'rocket_launch') },
  { index: 33, id: 'mech_tension_knife_throw', name: 'Knife Throw Target', icon: '🗡️', category: 'Tension Meter', summary: 'Time your throw into rotating target board', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'knife_throw') },
  { index: 34, id: 'mech_tension_bottle_flip', name: 'Bottle Flip Upright', icon: '🍾', category: 'Tension Meter', summary: 'Land bottle upright within balance window', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'bottle_flip') },
  { index: 35, id: 'mech_tension_power_charge', name: 'Power Charge Max', icon: '🔋', category: 'Tension Meter', summary: 'Stop power generator at peak capacity', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'power_charge') },
  { index: 36, id: 'mech_tension_temperature', name: 'Stabilize Temperature', icon: '🌡️', category: 'Tension Meter', summary: 'Maintain boiler temperature in safe zone', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'temperature_control') },
  { index: 37, id: 'mech_floating_pop_bubbles', name: 'Pop Green Bubble', icon: '🫧', category: 'Floating Target', summary: 'Pop floating green bubble and avoid white ones', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'pop_bubbles') },
  { index: 38, id: 'mech_floating_balloon_burst', name: 'Balloon Burst', icon: '🎈', category: 'Floating Target', summary: 'Snipe the red balloon among decoys', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'balloon_burst') },
  { index: 39, id: 'mech_floating_moving_target', name: 'Moving Crosshair', icon: '🎪', category: 'Floating Target', summary: 'Strike the moving target crosshair', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'moving_target') },
  { index: 40, id: 'mech_floating_avoid_bomb', name: 'Gem Tap (Avoid Bomb)', icon: '💎', category: 'Floating Target', summary: 'Collect floating gem without tapping bombs', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'avoid_bomb') },
  { index: 41, id: 'mech_choice_which_door', name: 'Which Safe Door?', icon: '🚪', category: 'Hazard Choice', summary: 'Read the clue and choose the trap-free door', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'which_door') },
  { index: 42, id: 'mech_choice_trap_door', name: 'Avoid The Trapdoor', icon: '🕳️', category: 'Hazard Choice', summary: 'Detect and evade collapsing trapdoor', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'trap_door') },
  { index: 43, id: 'mech_choice_floor_is_lava', name: 'Floor Is Lava', icon: '🌋', category: 'Hazard Choice', summary: 'Jump onto solid stone before magma rises', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'floor_is_lava') },
  { index: 44, id: 'mech_choice_safe_tile', name: 'Step On Safe Tile', icon: '🟩', category: 'Hazard Choice', summary: 'Find the glowing tile on crumbling floor', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'safe_tile') },
  { index: 45, id: 'mech_choice_portal_match', name: 'Warp Portal Match', icon: '🌀', category: 'Hazard Choice', summary: 'Send energy orb into matching colored portal', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'portal_match') },
  { index: 46, id: 'mech_choice_key_and_lock', name: 'Vault Key & Lock', icon: '🗝️', category: 'Hazard Choice', summary: 'Match golden key to vault lock', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'key_and_lock') },
  { index: 47, id: 'mech_choice_escape_box', name: 'Escape The Box Vent', icon: '📦', category: 'Hazard Choice', summary: 'Find unbolted ventilation escape hatch', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'escape_box') },
  { index: 48, id: 'mech_choice_color_pour', name: 'Chemical Color Pour', icon: '🧪', category: 'Hazard Choice', summary: 'Pour reagent into matching test beaker', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'color_pour') },
  { index: 49, id: 'mech_choice_magnet_match', name: 'Magnet Pole Match', icon: '🧲', category: 'Hazard Choice', summary: 'Select opposite magnetic polarity to attract', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'magnet_match') },
  { index: 50, id: 'mech_wire_bomb_defuse', name: 'Bomb Defuse Wire Cut', icon: '✂️', category: 'Circuit & Switch', summary: 'Cut exact target wire before clock hits zero', type: 'wire_switch', generator: (s) => generateWireSwitch(s, 'bomb_defuse') },
  { index: 51, id: 'mech_dont_do_anything', name: "Don't Do Anything", icon: '🧘', category: 'Impulse Control', summary: 'Fight the urge: touch nothing until timer expires', type: 'dont_touch', generator: (s) => generateDontTouch(s) },
  { index: 52, id: 'mech_mirror_swipe', name: 'Mirror Swipe Invert', icon: '🪞', category: 'Mental Trick', summary: 'Swipe in mirror-inverted direction', type: 'swipe_direction', generator: (s) => generateSwipeDirection(s, true) },
  { index: 53, id: 'mech_fake_game_over', name: 'Fake Out Alert', icon: '💀', category: 'Mental Trick', summary: 'Bypass fake warning and tap resume target', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'final_target') },
  { index: 54, id: 'mech_missing_vowel', name: 'Missing Vowel Fill', icon: '🔤', category: 'Order & Speed', summary: 'Complete word spelling sequence', type: 'order_sequence', generator: (s) => generateOrderSequence(s, true) },
  { index: 55, id: 'mech_true_color_match', name: 'True Color Match', icon: '🌈', category: 'Reflex & Color', summary: 'Match true ink color without distraction', type: 'color_tap', generator: (s) => generateColorTap(s, false) },
  { index: 56, id: 'mech_opposite_count', name: 'Opposite Number Pick', icon: '🔢', category: 'Mental Trick', summary: 'Pick number that contradicts rule', type: 'quick_math', generator: (s) => generateQuickMath(s, 'parity') },
  { index: 57, id: 'mech_shadow_size_trick', name: 'Shadow Size Check', icon: '👤', category: 'Observation', summary: 'Spot anomalous cast shadow', type: 'find_odd', generator: (s) => generateFindOdd(s, 0) },
  { index: 58, id: 'mech_wrong_equation_fix', name: 'Equation Error Fix', icon: '✏️', category: 'Speed Math', summary: 'Evaluate arithmetic equation veracity', type: 'quick_math', generator: (s) => generateQuickMath(s, 'true_false') },
  { index: 59, id: 'mech_electric_fence_jump', name: 'Electric Fence Jump', icon: '⚡', category: 'Action Lane', summary: 'Evade high-voltage perimeter fence', type: 'lane_action', generator: (s) => generateLaneAction(s, 'laser_dodge') },
  { index: 60, id: 'mech_submarine_dive', name: 'Submarine Depth Dive', icon: '🌊', category: 'Action Lane', summary: 'Steer sub between naval depth mines', type: 'lane_action', generator: (s) => generateLaneAction(s, 'meteor_dodge') },
  { index: 61, id: 'mech_sliding_doors', name: 'Sliding Blast Doors', icon: '🚪', category: 'Action Lane', summary: 'Slip through closing hydraulic gates', type: 'lane_action', generator: (s) => generateLaneAction(s, 'knife_dodge') },
  { index: 62, id: 'mech_boulder_leap', name: 'Rolling Boulder Leap', icon: '🪨', category: 'Action Lane', summary: 'Leap into safe lane away from stone', type: 'lane_action', generator: (s) => generateLaneAction(s, 'meteor_dodge') },
  { index: 63, id: 'mech_shield_deflect', name: 'Shield Deflect Guard', icon: '🛡️', category: 'Action Lane', summary: 'Block incoming fireball with shield', type: 'lane_action', generator: (s) => generateLaneAction(s, 'catch_star') },
  { index: 64, id: 'mech_pothole_swerve', name: 'High-Speed Pothole', icon: '🏎️', category: 'Action Lane', summary: 'Steer sports car around road craters', type: 'lane_action', generator: (s) => generateLaneAction(s, 'knife_dodge') },
  { index: 65, id: 'mech_train_crossing', name: 'Railroad Crossing', icon: '🚊', category: 'Action Lane', summary: 'Evade incoming express train', type: 'lane_action', generator: (s) => generateLaneAction(s, 'laser_dodge') },
  { index: 66, id: 'mech_tornado_evade', name: 'Vortex Tornado Evade', icon: '🌪️', category: 'Action Lane', summary: 'Keep vehicle outside vortex suction', type: 'lane_action', generator: (s) => generateLaneAction(s, 'meteor_dodge') },
  { index: 67, id: 'mech_pressure_valve', name: 'Pressure Valve Defuse', icon: '🎛️', category: 'Tension Meter', summary: 'Release valve in green safety threshold', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'temperature_control') },
  { index: 68, id: 'mech_tightrope_unicycle', name: 'Tightrope Balance', icon: '🎪', category: 'Tension Meter', summary: 'Keep unicycle bubble dead centered', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'balance_meter') },
  { index: 69, id: 'mech_safe_dial_lock', name: 'Safe Dial Tumbler', icon: '🔐', category: 'Tension Meter', summary: 'Stop rotating dial right on lock notch', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'bullseye') },
  { index: 70, id: 'mech_coffee_pour', name: 'Pour To The Brim', icon: '☕', category: 'Tension Meter', summary: 'Fill mug to dotted line without spilling', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'bottle_flip') },
  { index: 71, id: 'mech_heartbeat_sync', name: 'Heartbeat Pulse Sync', icon: '💓', category: 'Tension Meter', summary: 'Time tap precisely with peak pulse', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'power_charge') },
  { index: 72, id: 'mech_sniper_wind', name: 'Sniper Crosswind Aim', icon: '🎯', category: 'Tension Meter', summary: 'Adjust aim point against wind deflection', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'wind_control') },
  { index: 73, id: 'mech_dynamite_fuse', name: 'Dynamite Fuse Snip', icon: '🧨', category: 'Tension Meter', summary: 'Snip fuse spark before it hits TNT', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'rocket_launch') },
  { index: 74, id: 'mech_rocket_reentry', name: 'Re-entry Angle Lock', icon: '🛸', category: 'Tension Meter', summary: 'Lock spacecraft pitch in atmospheric cone', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'rocket_landing') },
  { index: 75, id: 'mech_recycling_sort', name: 'Eco Recycling Sorter', icon: '♻️', category: 'Hazard Choice', summary: 'Sort plastic waste into recycle receptacle', type: 'code_puzzle', generator: (s) => generateCodePuzzle(s, 'rapid_sort') },
  { index: 76, id: 'mech_burglar_vs_cop', name: 'Burglar vs Civilian', icon: '👮', category: 'Hazard Choice', summary: 'Spot and arrest masked perpetrator', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'which_door') },
  { index: 77, id: 'mech_sandwich_stack', name: 'Sandwich Assembly', icon: '🥪', category: 'Order & Speed', summary: 'Stack ingredients in customer order', type: 'order_sequence', generator: (s) => generateOrderSequence(s, false) },
  { index: 78, id: 'mech_coin_denomination', name: 'Coin Value Pick', icon: '🪙', category: 'Observation', summary: 'Tap requested currency coin', type: 'find_odd', generator: (s) => generateFindOdd(s, 1) },
  { index: 79, id: 'mech_plug_leaks', name: 'Dual Leak Plug', icon: '🚰', category: 'Twitch Reflex', summary: 'Rapidly mash to seal water pipe spray', type: 'tap_count', generator: (s) => generateTapCount(s, 4) },
  { index: 80, id: 'mech_battery_polarity', name: 'Battery Polarity Slot', icon: '🔋', category: 'Circuit & Switch', summary: 'Insert positive (+) terminal forward', type: 'wire_switch', generator: (s) => generateWireSwitch(s, 'light_switch') },
  { index: 81, id: 'mech_package_seal', name: 'Conveyor Box Seal', icon: '📦', category: 'Agility', summary: 'Swipe across seam to tape parcel shut', type: 'swipe_direction', generator: (s) => generateSwipeDirection(s, false) },
  { index: 82, id: 'mech_passport_stamp', name: 'Border Visa Stamp', icon: '🛂', category: 'Hazard Choice', summary: 'Review expiration year and stamp passport', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'trap_door') },
  { index: 83, id: 'mech_odd_prime', name: 'Spot The Prime Number', icon: '🔢', category: 'Speed Math', summary: 'Identify the only prime integer', type: 'quick_math', generator: (s) => generateQuickMath(s, 'parity') },
  { index: 84, id: 'mech_quick_percentage', name: 'Quick 50% Discount', icon: '🏷️', category: 'Speed Math', summary: 'Calculate clearance price under clock', type: 'quick_math', generator: (s) => generateQuickMath(s, 'comparison') },
  { index: 85, id: 'mech_clock_face', name: 'Analog Clock Match', icon: '⏰', category: 'Speed Math', summary: 'Match clock hands to digital time', type: 'quick_math', generator: (s) => generateQuickMath(s, 'true_false') },
  { index: 86, id: 'mech_roman_numeral', name: 'Roman Numeral Decode', icon: '🏛️', category: 'Speed Math', summary: 'Convert Roman numeral VII to decimal', type: 'quick_math', generator: (s) => generateQuickMath(s, 'parity') },
  { index: 87, id: 'mech_greatest_diff', name: 'Greatest Gap Pair', icon: '➖', category: 'Speed Math', summary: 'Pick pair with widest numerical span', type: 'quick_math', generator: (s) => generateQuickMath(s, 'comparison') },
  { index: 88, id: 'mech_dice_total', name: 'Double Dice Total', icon: '🎲', category: 'Speed Math', summary: 'Tally pips of rolled dice pair', type: 'quick_math', generator: (s) => generateQuickMath(s, 'true_false') },
  { index: 89, id: 'mech_coin_counter', name: 'Coin Drop Tally', icon: '💰', category: 'Speed Math', summary: 'Sum dropped coins in treasure chest', type: 'quick_math', generator: (s) => generateQuickMath(s, 'comparison') },
  { index: 90, id: 'mech_temp_freeze', name: 'Freezing Point Check', icon: '❄️', category: 'Speed Math', summary: 'Confirm water freezing threshold 0°C', type: 'quick_math', generator: (s) => generateQuickMath(s, 'true_false') },
  { index: 91, id: 'mech_briefcase_combo', name: 'Briefcase Lock Combo', icon: '💼', category: 'Memory', summary: 'Recall flashed 3-digit combination', type: 'code_puzzle', generator: (s) => generateCodePuzzle(s, 'unlock_code') },
  { index: 92, id: 'mech_which_one_moved', name: 'Position Shift Anomaly', icon: '🕵️', category: 'Memory', summary: 'Detect tile that shifted during blink', type: 'code_puzzle', generator: (s) => generateCodePuzzle(s, 'object_swap') },
  { index: 93, id: 'mech_footstep_tracker', name: 'Footstep Trail Trace', icon: '🐾', category: 'Memory', summary: 'Follow trail to destination tile', type: 'code_puzzle', generator: (s) => generateCodePuzzle(s, 'disappearing_path') },
  { index: 94, id: 'mech_simon_fast', name: 'Rapid Simon Rhythm', icon: '🚦', category: 'Memory', summary: 'Repeat flashed light sequence', type: 'memory_position', generator: (s) => generateMemoryPosition(s, 2) },
  { index: 95, id: 'mech_shadow_silhouette', name: 'Animal Silhouette', icon: '👤', category: 'Observation', summary: 'Match animal to cast silhouette', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'shadow_match') },
  { index: 96, id: 'mech_missing_domino', name: 'Domino Dot Progression', icon: '🁣', category: 'Observation', summary: 'Identify missing sequence domino', type: 'find_odd', generator: (s) => generateFindOdd(s, 2) },
  { index: 97, id: 'mech_mosquito_swat', name: 'Darting Mosquito Swat', icon: '🦟', category: 'Floating Target', summary: 'Swat erratic flying mosquito with one tap', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'moving_target') },
  { index: 98, id: 'mech_hot_potato', name: 'Hot Potato Quick Tap', icon: '🥔', category: 'Floating Target', summary: 'Tap sizzling potato before it bursts', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'avoid_bomb') },
  { index: 99, id: 'mech_trap_or_gold', name: 'Mimic Chest vs Gold', icon: '🧰', category: 'Hazard Choice', summary: 'Discern real gold chest from sharp-toothed mimic', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'key_and_lock') },
  { index: 100, id: 'mech_emergency_eject', name: 'Emergency Cockpit Eject', icon: '🚨', category: 'Circuit & Switch', summary: 'Pull canopy ejection lever in flaming jet', type: 'wire_switch', generator: (s) => generateWireSwitch(s, 'light_switch') },

  // 101 - 180: Themes 1 to 8 Set
  { index: 101, id: 'mech_biometric_fp', name: 'Biometric Fingerprint', icon: '🔍', category: 'Observation', summary: 'Match authorized whorl fingerprint', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'safe_tile') },
  { index: 102, id: 'mech_cut_alarm_sensor', name: 'Laser Alarm Breaker', icon: '🚨', category: 'Circuit & Switch', summary: 'Sever optical alarm wire relay', type: 'wire_switch', generator: (s) => generateWireSwitch(s, 'wire_connect') },
  { index: 103, id: 'mech_pin_scramble', name: 'PIN Keypad Scramble', icon: '🔢', category: 'Hazard Choice', summary: 'Tap highlighted target key on scrambled keypad', type: 'code_puzzle', generator: (s) => generateCodePuzzle(s, 'unlock_code') },
  { index: 104, id: 'mech_data_stream_catch', name: 'Data Stream Catch', icon: '💾', category: 'Action Lane', summary: 'Intercept golden encryption packet', type: 'lane_action', generator: (s) => generateLaneAction(s, 'coin_catch') },
  { index: 105, id: 'mech_firewall_breaker', name: 'Firewall Probe Shot', icon: '🧱', category: 'Timing', summary: 'Shoot data packet through firewall gap', type: 'stop_target', generator: (s) => generateStopTarget(s) },
  { index: 106, id: 'mech_ransomware_decrypt', name: 'Ransomware Alphabetize', icon: '🦠', category: 'Order & Speed', summary: 'Sort cipher keys in alphabetical order', type: 'order_sequence', generator: (s) => generateOrderSequence(s, true) },
  { index: 107, id: 'mech_vault_stethoscope', name: 'Vault Tumbler Click', icon: '🎧', category: 'Tension Meter', summary: 'Stop dial on acoustic tumbler click', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'knife_throw') },
  { index: 108, id: 'mech_cctv_blindspot', name: 'CCTV Camera Cone Dash', icon: '📹', category: 'Floating Target', summary: 'Tap spy running in camera blind zone', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'moving_target') },
  { index: 109, id: 'mech_override_key_turn', name: 'Dual Key Override', icon: '🔑', category: 'Agility', summary: 'Turn override key in matching direction', type: 'swipe_direction', generator: (s) => generateSwipeDirection(s, false) },
  { index: 110, id: 'mech_server_eject', name: 'Hot Server Core Eject', icon: '💽', category: 'Circuit & Switch', summary: 'Pull overheated blade from server rack', type: 'wire_switch', generator: (s) => generateWireSwitch(s, 'gear_match') },
  { index: 111, id: 'mech_catch_egg', name: 'Falling Egg Pan Catch', icon: '🍳', category: 'Action Lane', summary: 'Catch rolling egg in skillet before impact', type: 'lane_action', generator: (s) => generateLaneAction(s, 'catch_star') },
  { index: 112, id: 'mech_pancake_flip', name: 'Pancake Air Flip', icon: '🥞', category: 'Tension Meter', summary: 'Catch flipped pancake golden side down', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'bottle_flip') },
  { index: 113, id: 'mech_grease_fire', name: 'Extinguish Grease Fire', icon: '🧯', category: 'Hazard Choice', summary: 'Smother stove flames with lid, never water', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'floor_is_lava') },
  { index: 114, id: 'mech_sushi_slice', name: 'Sushi Sashimi Slices', icon: '🍣', category: 'Agility', summary: 'Execute clean directional knife slice', type: 'swipe_direction', generator: (s) => generateSwipeDirection(s, false) },
  { index: 115, id: 'mech_soda_pop', name: 'Shaken Soda Can Vent', icon: '🥤', category: 'Tension Meter', summary: 'Vent carbonation pressure without explosion', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'power_charge') },
  { index: 116, id: 'mech_toast_popup', name: 'Airborne Toast Catch', icon: '🍞', category: 'Action Lane', summary: 'Snatch popped toast slice from toaster', type: 'lane_action', generator: (s) => generateLaneAction(s, 'falling_object') },
  { index: 117, id: 'mech_wasabi_or_guac', name: 'Wasabi vs Guacamole', icon: '🥑', category: 'Hazard Choice', summary: 'Add guacamole, reject fiery green wasabi', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'color_pour') },
  { index: 118, id: 'mech_soup_seasoning', name: 'Soup Seasoning Balance', icon: '🧂', category: 'Tension Meter', summary: 'Season soup broth into green balance window', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'temperature_control') },
  { index: 119, id: 'mech_stop_blender', name: 'Blender Lid Clamp', icon: '🌪️', category: 'Impulse Control', summary: 'Hold lid still until vortex motor stops', type: 'dont_touch', generator: (s) => generateDontTouch(s, 'dont_do_anything') },
  { index: 120, id: 'mech_pizza_cutter', name: '4-Quarter Pizza Slice', icon: '🍕', category: 'Agility', summary: 'Cut cross-section slice down the middle', type: 'swipe_direction', generator: (s) => generateSwipeDirection(s, true) },
  { index: 121, id: 'mech_docking_ring', name: 'Orbital Docking Collar', icon: '🛰️', category: 'Tension Meter', summary: 'Mesh rotating space station collar teeth', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'rocket_landing') },
  { index: 122, id: 'mech_meteor_laser', name: 'Laser Meteor Turret', icon: '☄️', category: 'Floating Target', summary: 'Blast incoming asteroid with laser cannon', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'balloon_burst') },
  { index: 123, id: 'mech_airlock_seal', name: 'Airlock Crank Seal', icon: '🚀', category: 'Twitch Reflex', summary: 'Mash crank wheel to seal depressurizing hatch', type: 'tap_count', generator: (s) => generateTapCount(s, 5) },
  { index: 124, id: 'mech_asteroid_slingshot', name: 'Slingshot Gravity Arc', icon: '🪐', category: 'Timing', summary: 'Release gravity slingshot at orbital vector', type: 'stop_target', generator: (s) => generateStopTarget(s) },
  { index: 125, id: 'mech_solar_flare_shield', name: 'Solar Flare Shield', icon: '☀️', category: 'Agility', summary: 'Swipe thermal shield over sunlit hull', type: 'swipe_direction', generator: (s) => generateSwipeDirection(s, false) },
  { index: 126, id: 'mech_thruster_burn', name: 'Lunar Thruster Level', icon: '🔥', category: 'Tension Meter', summary: 'Stabilize lander thruster during descent', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'rocket_launch') },
  { index: 127, id: 'mech_radio_freq', name: 'Oscilloscope Wave Tune', icon: '📻', category: 'Tension Meter', summary: 'Tune radio dial to resonance frequency', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'temperature_control') },
  { index: 128, id: 'mech_alien_egg_hold', name: "Don't Breathe Alien Egg", icon: '🥚', category: 'Impulse Control', summary: 'Hold dead still while alien egg opens', type: 'dont_touch', generator: (s) => generateDontTouch(s, 'alien_egg') },
  { index: 129, id: 'mech_spacewalk_tether', name: 'Spacewalk Tether Clamp', icon: '👨‍🚀', category: 'Timing', summary: 'Latch safety carabiner onto airlock ring', type: 'stop_target', generator: (s) => generateStopTarget(s) },
  { index: 130, id: 'mech_hyperspace_coords', name: 'Hyperspace Star Nav', icon: '✨', category: 'Observation', summary: 'Select stellar nav alignment coordinate', type: 'shape_match', generator: (s) => generateShapeMatch(s) },
  { index: 131, id: 'mech_snake_strike', name: 'Viper Strike Jump', icon: '🐍', category: 'Action Lane', summary: 'Shift out of viper striking path', type: 'lane_action', generator: (s) => generateLaneAction(s, 'knife_dodge') },
  { index: 132, id: 'mech_chameleon_tongue', name: 'Chameleon Fly Snatch', icon: '🦎', category: 'Floating Target', summary: 'Flick tongue and snag flying insect', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'pop_bubbles') },
  { index: 133, id: 'mech_crocodile_river', name: 'Crocodile Log Crossing', icon: '🐊', category: 'Hazard Choice', summary: 'Step on real driftwood, avoid crocodile snout', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'safe_tile') },
  { index: 134, id: 'mech_bee_swarm_duck', name: 'Duck Bee Swarm', icon: '🐝', category: 'Action Lane', summary: 'Dodge away from approaching hornet swarm', type: 'lane_action', generator: (s) => generateLaneAction(s, 'meteor_dodge') },
  { index: 135, id: 'mech_catch_salmon', name: 'Bear Waterfall Catch', icon: '🐻', category: 'Action Lane', summary: 'Line up bear paws under leaping salmon', type: 'lane_action', generator: (s) => generateLaneAction(s, 'catch_star') },
  { index: 136, id: 'mech_piranha_water_dip', name: 'Piranha Ring Retrieve', icon: '🐟', category: 'Floating Target', summary: 'Fish gold ring out without brushing piranha', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'avoid_bomb') },
  { index: 137, id: 'mech_spider_web_switch', name: 'Dewdrop Spider Silk', icon: '🕸️', category: 'Circuit & Switch', summary: 'Route morning dewdrop to dry silk junction', type: 'wire_switch', generator: (s) => generateWireSwitch(s, 'pipe_connect') },
  { index: 138, id: 'mech_bull_matador', name: 'Charging Bull Side-Step', icon: '🐂', category: 'Action Lane', summary: 'Side-step charging bull at last instant', type: 'lane_action', generator: (s) => generateLaneAction(s, 'laser_dodge') },
  { index: 139, id: 'mech_owl_night_vision', name: 'Night Owl Eye Spot', icon: '🦉', category: 'Floating Target', summary: 'Spot glowing eyes in pitch dark woods', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'final_target') },
  { index: 140, id: 'mech_ant_colony_bridge', name: 'Ant Chain Bridge Mash', icon: '🐜', category: 'Twitch Reflex', summary: 'Mash screen to link living ant bridge', type: 'tap_count', generator: (s) => generateTapCount(s, 5) },
  { index: 141, id: 'mech_conveyor_sledgehammer', name: 'Cracked Gear Sledge', icon: '🔨', category: 'Observation', summary: 'Spot defective cog on high-speed conveyor', type: 'find_odd', generator: (s) => generateFindOdd(s, 0) },
  { index: 142, id: 'mech_steam_valve_bleed', name: 'Boiler Steam Bleed', icon: '💨', category: 'Tension Meter', summary: 'Bleed boiler pressure before tank ruptures', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'temperature_control') },
  { index: 143, id: 'mech_crane_magnet_drop', name: 'Steel Beam Crane Drop', icon: '🧲', category: 'Tension Meter', summary: 'Drop suspended I-beam into flatbed truck', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'bullseye') },
  { index: 144, id: 'mech_chainsaw_cut', name: 'Lumberjack Laser Cut', icon: '🪚', category: 'Tension Meter', summary: 'Halt spinning blade right on trunk crossmark', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'knife_throw') },
  { index: 145, id: 'mech_molten_metal_pour', name: 'Molten Bronze Ingot', icon: '🌋', category: 'Tension Meter', summary: 'Fill steel ingot mold without spilling over', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'bottle_flip') },
  { index: 146, id: 'mech_hydraulic_press_snatch', name: 'Hydraulic Press Snatch', icon: '🦾', category: 'Tension Meter', summary: 'Snatch coin before piston slams downward', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'power_charge') },
  { index: 147, id: 'mech_assembly_nut_bolt', name: 'Hex Nut Fastener', icon: '🔩', category: 'Order & Speed', summary: 'Thread matching hex bolt in order', type: 'order_sequence', generator: (s) => generateOrderSequence(s, false) },
  { index: 148, id: 'mech_hazard_gate_drop', name: 'Crash Gate Emergency', icon: '🚧', category: 'Timing', summary: 'Drop safety crash gate before runaway cart', type: 'stop_target', generator: (s) => generateStopTarget(s) },
  { index: 149, id: 'mech_pipe_pressure_clamp', name: 'Oil Leak Rubber Clamp', icon: '🛢️', category: 'Circuit & Switch', summary: 'Clamp ruptured industrial oil pipeline', type: 'wire_switch', generator: (s) => generateWireSwitch(s, 'pipe_connect') },
  { index: 150, id: 'mech_blown_fuse_replace', name: 'Blown Fuse Swap', icon: '💡', category: 'Circuit & Switch', summary: 'Replace burnt fuse to power factory', type: 'wire_switch', generator: (s) => generateWireSwitch(s, 'light_switch') },
  { index: 151, id: 'mech_defibrillator_shock', name: 'Defibrillator Shock Sync', icon: '⚡', category: 'Timing', summary: 'Discharge paddles when cardiac ECG aligns', type: 'stop_target', generator: (s) => generateStopTarget(s) },
  { index: 152, id: 'mech_splinter_extraction', name: 'Precision Tweezers Pull', icon: '🩹', category: 'Timing', summary: 'Extract deep splinter without slipping', type: 'stop_target', generator: (s) => generateStopTarget(s) },
  { index: 153, id: 'mech_iv_drip_meter', name: 'IV Fluid Drip Rate', icon: '💧', category: 'Tension Meter', summary: 'Calibrate IV medication drip tempo', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'temperature_control') },
  { index: 154, id: 'mech_heartbeat_valve', name: 'Lub-Dub Stethoscope', icon: '🫀', category: 'Twitch Reflex', summary: 'Tap screen to sync with heart valve rhythm', type: 'tap_count', generator: (s) => generateTapCount(s, 3) },
  { index: 155, id: 'mech_blood_type_triage', name: 'Emergency O- Blood Match', icon: '🩸', category: 'Hazard Choice', summary: 'Pick universal donor O- transfusion bag', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'color_pour') },
  { index: 156, id: 'mech_xray_fracture_spot', name: 'X-Ray Fracture Spot', icon: '🦴', category: 'Observation', summary: 'Spot hair-line bone fracture on X-ray', type: 'find_odd', generator: (s) => generateFindOdd(s, 1) },
  { index: 157, id: 'mech_oxygen_valve_twist', name: 'Oxygen Tank Twist', icon: '🤿', category: 'Agility', summary: 'Twist valve wheel counter-clockwise', type: 'swipe_direction', generator: (s) => generateSwipeDirection(s, false) },
  { index: 158, id: 'mech_pupil_reflex', name: 'Pupil Light Contraction', icon: '👁️', category: 'Tension Meter', summary: 'Observe pupil contract under flashlight', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'bullseye') },
  { index: 159, id: 'mech_tourniquet_cinch', name: 'Tourniquet Rapid Cinch', icon: '🩺', category: 'Twitch Reflex', summary: 'Mash buckle to tighten artery tourniquet', type: 'tap_count', generator: (s) => generateTapCount(s, 4) },
  { index: 160, id: 'mech_mercury_shake', name: 'Fever Thermometer Reset', icon: '🌡️', category: 'Twitch Reflex', summary: 'Mash downwards to shake mercury down', type: 'tap_count', generator: (s) => generateTapCount(s, 5) },
  { index: 161, id: 'mech_pong_paddle', name: 'Pong High-Speed Volley', icon: '🏓', category: 'Tension Meter', summary: 'Return 8-bit ball off paddle edge', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'bottle_flip') },
  { index: 162, id: 'mech_brick_powerup_catch', name: 'Retro Powerup Catch', icon: '🧱', category: 'Action Lane', summary: 'Catch arcade multiplier capsule', type: 'lane_action', generator: (s) => generateLaneAction(s, 'catch_star') },
  { index: 163, id: 'mech_space_invader_bomb', name: 'Pixel Alien Bomb Snip', icon: '👾', category: 'Timing', summary: 'Snipe dropping alien missile mid-flight', type: 'stop_target', generator: (s) => generateStopTarget(s) },
  { index: 164, id: 'mech_snake_90deg_turn', name: 'Snake Grid 90° Turn', icon: '🟩', category: 'Agility', summary: 'Execute sharp 90-degree corner turn', type: 'swipe_direction', generator: (s) => generateSwipeDirection(s, false) },
  { index: 165, id: 'mech_slot_triple_7', name: 'Slot Machine Triple 7', icon: '🎰', category: 'Tension Meter', summary: 'Halt spinning reel on golden 7', type: 'tension_meter', generator: (s) => generateTensionMeter(s, 'bullseye') },
  { index: 166, id: 'mech_pixel_boss_mash', name: 'Pixel Boss Shield Mash', icon: '👹', category: 'Twitch Reflex', summary: 'Mash attack while boss barrier is breached', type: 'tap_count', generator: (s) => generateTapCount(s, 6) },
  { index: 167, id: 'mech_pac_ghost_evade', name: 'Pac-Maze Ghost Evade', icon: '🟡', category: 'Action Lane', summary: 'Dodge oncoming red chaser ghost', type: 'lane_action', generator: (s) => generateLaneAction(s, 'knife_dodge') },
  { index: 168, id: 'mech_platform_pit_jump', name: '8-Bit Ledge Spring Jump', icon: '🕳️', category: 'Timing', summary: 'Time jump right as boots clear platform edge', type: 'stop_target', generator: (s) => generateStopTarget(s) },
  { index: 169, id: 'mech_whack_a_pixel', name: 'Whack-A-Pixel Burrow', icon: '🦔', category: 'Floating Target', summary: 'Whack mole before it burrows back down', type: 'floating_target', generator: (s) => generateFloatingTarget(s, 'moving_target') },
  { index: 170, id: 'mech_pinball_flipper', name: 'Pinball Flipper Rebound', icon: '🕹️', category: 'Timing', summary: 'Trigger flipper at apex of ball drop', type: 'stop_target', generator: (s) => generateStopTarget(s) },
  { index: 171, id: 'mech_reverse_clockwise', name: 'Opposite Spin Swipe', icon: '🔄', category: 'Mental Trick', summary: 'Swipe in opposite direction of spin', type: 'swipe_direction', generator: (s) => generateSwipeDirection(s, true) },
  { index: 172, id: 'mech_simon_says_color', name: 'Simon Color Inversion', icon: '🗣️', category: 'Mental Trick', summary: 'Obey colored word text, ignore spoken color', type: 'color_tap', generator: (s) => generateColorTap(s, true) },
  { index: 173, id: 'mech_lie_detector', name: '2+2=5 Lie Detector', icon: '🤥', category: 'Hazard Choice', summary: 'Flag mathematical fallacy as a LIE', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'which_door') },
  { index: 174, id: 'mech_missing_glove', name: 'Glove Anomaly Spot', icon: '👏', category: 'Observation', summary: 'Identify hand missing safety glove', type: 'find_odd', generator: (s) => generateFindOdd(s, 2) },
  { index: 175, id: 'mech_hidden_hotspot', name: 'Invisible Button Radar', icon: '👻', category: 'Observation', summary: 'Locate subtle faint pulse radar hotspot', type: 'find_odd', generator: (s) => generateFindOdd(s, 1) },
  { index: 176, id: 'mech_blink_counter', name: 'Rapid Flash Count', icon: '💡', category: 'Speed Math', summary: 'Count number of rapid bulb strobe pulses', type: 'quick_math', generator: (s) => generateQuickMath(s, 'parity') },
  { index: 177, id: 'mech_upside_down_calc', name: '07734 Upside-Down Word', icon: '🙃', category: 'Observation', summary: 'Decipher upside-down calculator display', type: 'find_odd', generator: (s) => generateFindOdd(s, 0) },
  { index: 178, id: 'mech_speed_typo_hunter', name: 'TENSI0N Typo Spot', icon: '🔤', category: 'Observation', summary: 'Spot zero disguised as letter O in title', type: 'find_odd', generator: (s) => generateFindOdd(s, 1) },
  { index: 179, id: 'mech_siren_trap', name: 'Safe vs Danger Trap', icon: '🚨', category: 'Hazard Choice', summary: 'Read word SAFE despite red warning glow', type: 'choice_hazard', generator: (s) => generateChoiceHazard(s, 'which_door') },
  { index: 180, id: 'mech_nuclear_abort', name: 'Nuclear Abort Keycode', icon: '☢️', category: 'Order & Speed', summary: 'Input 3-symbol abort sequence before ignition', type: 'code_puzzle', generator: (s) => generateCodePuzzle(s, 'unlock_code') },
];

/**
 * MechanicsDeckManager: Infinite Shuffled Bag of 180 Unique Mechanics.
 * Guarantees that ALL 180 mechanics appear sequentially without premature repetition.
 * Tracks discovered mechanics across game sessions in localStorage.
 */
class MechanicsDeckManager {
  private activeDeck: number[] = [];
  private lastMechanicIndex: number = -1;
  private discoveredIndices: Set<number> = new Set();

  constructor() {
    this.loadDiscovered();
    this.refillDeck();
  }

  private loadDiscovered(): void {
    try {
      const saved = localStorage.getItem('speed_tension_discovered_mechanics_v1');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          this.discoveredIndices = new Set(arr);
        }
      }
    } catch {
      // Fallback
    }
  }

  private saveDiscovered(): void {
    try {
      localStorage.setItem(
        'speed_tension_discovered_mechanics_v1',
        JSON.stringify(Array.from(this.discoveredIndices))
      );
    } catch {
      // Ignore storage errors
    }
  }

  private refillDeck(): void {
    // Fill deck with all 180 indices (0 to MECHANICS_CATALOG.length - 1)
    const all = Array.from({ length: MECHANICS_CATALOG.length }, (_, i) => i);
    // Fisher-Yates Shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    // Prevent immediate repeat on reshuffle boundary
    if (all[0] === this.lastMechanicIndex && all.length > 1) {
      const swapIdx = Math.floor(Math.random() * (all.length - 1)) + 1;
      [all[0], all[swapIdx]] = [all[swapIdx], all[0]];
    }
    this.activeDeck = all;
  }

  /**
   * Draws the next mechanic from the shuffled 180-card bag.
   */
  public drawNextMechanic(lastType?: ChallengeType): MechanicDefinition {
    if (this.activeDeck.length === 0) {
      this.refillDeck();
    }

    // If top card happens to match lastType, swap with next card if available to avoid same engine back-to-back
    if (lastType && this.activeDeck.length > 1) {
      const topIdx = this.activeDeck[this.activeDeck.length - 1];
      if (MECHANICS_CATALOG[topIdx].type === lastType) {
        // Swap top with second-to-top
        const swapIdx = this.activeDeck.length - 2;
        [this.activeDeck[this.activeDeck.length - 1], this.activeDeck[swapIdx]] = [
          this.activeDeck[swapIdx],
          this.activeDeck[this.activeDeck.length - 1],
        ];
      }
    }

    const nextIndex = this.activeDeck.pop()!;
    this.lastMechanicIndex = nextIndex;
    const def = MECHANICS_CATALOG[nextIndex];

    if (!this.discoveredIndices.has(def.index)) {
      this.discoveredIndices.add(def.index);
      this.saveDiscovered();
    }

    return def;
  }

  public getDiscoveredCount(): number {
    return this.discoveredIndices.size;
  }

  public isDiscovered(index: number): boolean {
    return this.discoveredIndices.has(index);
  }

  public getCatalog(): readonly MechanicDefinition[] {
    return MECHANICS_CATALOG;
  }

  public resetDiscovery(): void {
    this.discoveredIndices.clear();
    this.saveDiscovered();
    this.refillDeck();
  }
}

export const mechanicsDeckManager = new MechanicsDeckManager();

/**
 * Generates the next challenge drawn directly from the 180-card shuffled deck.
 * Guaranteed variety: each of the 180 mechanics appears in order before any repeat!
 */
export function generateNextChallenge(score: number, lastType?: ChallengeType): Challenge {
  const mechanic = mechanicsDeckManager.drawNextMechanic(lastType);
  const challenge = mechanic.generator(score);

  // Attach mechanic metadata
  challenge.mechanicIndex = mechanic.index;
  challenge.mechanicName = mechanic.name;
  challenge.mechanicIcon = mechanic.icon;

  return challenge;
}