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
function generateColorTap(score: number): Challenge {
  const id = `color_tap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let itemCount = 3;
  if (score >= 25) itemCount = 6;
  else if (score >= 10) itemCount = 4;

  const shuffledColors = shuffle(COLOR_PALETTE).slice(0, itemCount);
  const targetIndex = Math.floor(Math.random() * itemCount);
  const target = shuffledColors[targetIndex];

  let durationMs = 3600;
  if (score >= 30) durationMs = 1700;
  else if (score >= 15) durationMs = 2300;
  else if (score >= 6) durationMs = 2800;

  const isStroop = score >= 14 && Math.random() > 0.45;
  let items: ColorTapItem[] = [];

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
function generateDontTouch(score: number): Challenge {
  const id = `dont_touch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const chosenSet = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
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

  let durationMs = 3500;
  if (score >= 30) durationMs = 1750;
  else if (score >= 15) durationMs = 2300;
  else if (score >= 6) durationMs = 2800;

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
function generateFindOdd(score: number): Challenge {
  const id = `find_odd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const pair = ODD_EMOJI_PAIRS[Math.floor(Math.random() * ODD_EMOJI_PAIRS.length)];

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

  let durationMs = 3600;
  if (score >= 30) durationMs = 1750;
  else if (score >= 15) durationMs = 2400;
  else if (score >= 6) durationMs = 2900;

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
function generateMemoryPosition(score: number): Challenge {
  const id = `memory_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let gridSize = 3;
  let targetCount = 1;
  let flashDurationMs = 850;

  if (score >= 25) {
    gridSize = 4;
    targetCount = 2;
    flashDurationMs = 550;
  } else if (score >= 14) {
    gridSize = 3;
    targetCount = 2;
    flashDurationMs = 650;
  }

  const totalTiles = gridSize * gridSize;
  const indices: number[] = [];
  while (indices.length < targetCount) {
    const r = Math.floor(Math.random() * totalTiles);
    if (!indices.includes(r)) indices.push(r);
  }

  const icons = ['🔴', '💎', '⭐', '⚡', '🔥', '👑', '🎯'];
  const targetIcon = icons[Math.floor(Math.random() * icons.length)];

  let answerTimeMs = 3000;
  if (score >= 30) answerTimeMs = 1600;
  else if (score >= 15) answerTimeMs = 2100;

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
  let targetZoneWidthPercent = 30;
  let speedMs = 1350;

  if (score >= 30) {
    targetZoneWidthPercent = 15;
    speedMs = 750;
  } else if (score >= 18) {
    targetZoneWidthPercent = 18;
    speedMs = 900;
  } else if (score >= 10) {
    targetZoneWidthPercent = 22;
    speedMs = 1100;
  }

  const minStart = 15;
  const maxStart = 85 - targetZoneWidthPercent;
  const targetZoneStartPercent = Math.floor(minStart + Math.random() * (maxStart - minStart));
  const durationMs = Math.round(speedMs * 2.7);

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
function generateSwipeDirection(score: number): Challenge {
  const id = `swipe_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const dirs: Direction[] = ['LEFT', 'RIGHT', 'UP', 'DOWN'];
  const promptDir = dirs[Math.floor(Math.random() * dirs.length)];
  
  // Opposite rule at score >= 12
  const isOpposite = score >= 12 && Math.random() > 0.5;
  const oppositeMap: Record<Direction, Direction> = {
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
    UP: 'DOWN',
    DOWN: 'UP',
  };
  const targetDirection = isOpposite ? oppositeMap[promptDir] : promptDir;

  let durationMs = 3200;
  if (score >= 30) durationMs = 1500;
  else if (score >= 15) durationMs = 2100;

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
function generateQuickMath(score: number): Challenge {
  const id = `math_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const mode = Math.random();

  let durationMs = 3500;
  if (score >= 30) durationMs = 1700;
  else if (score >= 15) durationMs = 2300;

  if (mode < 0.4) {
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
  } else if (mode < 0.7) {
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
function generateTapCount(score: number): Challenge {
  const id = `tap_count_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let targetCount = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
  if (score >= 20) targetCount = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5

  const durationMs = targetCount * 700 + 800;

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
function generateRPS(score: number): Challenge {
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

  const isLoseGoal = score >= 16 && Math.random() > 0.6;
  const targetChoice = isLoseGoal ? loseMap[opponentChoice] : winMap[opponentChoice];

  let durationMs = 3200;
  if (score >= 30) durationMs = 1500;
  else if (score >= 15) durationMs = 2100;

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

  let durationMs = 3400;
  if (score >= 30) durationMs = 1600;
  else if (score >= 15) durationMs = 2200;

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
function generateOrderSequence(score: number): Challenge {
  const id = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const totalSteps = score >= 20 ? 4 : 3;

  const mode = Math.random();
  let stepLabels: string[] = [];

  if (mode < 0.6) {
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
  const durationMs = totalSteps * 900 + 700;

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

const ALL_CHALLENGE_TYPES: ChallengeType[] = [
  'color_tap',
  'dont_touch',
  'find_odd',
  'memory_position',
  'stop_target',
  'swipe_direction',
  'quick_math',
  'tap_count',
  'rock_paper_scissors',
  'shape_match',
  'order_sequence',
];

export function generateNextChallenge(score: number, lastType?: ChallengeType): Challenge {
  // Filter out recent type to avoid immediate repetition
  const pool = ALL_CHALLENGE_TYPES.filter(t => t !== lastType);
  const nextType = pool[Math.floor(Math.random() * pool.length)] || ALL_CHALLENGE_TYPES[0];

  switch (nextType) {
    case 'color_tap':
      return generateColorTap(score);
    case 'dont_touch':
      return generateDontTouch(score);
    case 'find_odd':
      return generateFindOdd(score);
    case 'memory_position':
      return generateMemoryPosition(score);
    case 'stop_target':
      return generateStopTarget(score);
    case 'swipe_direction':
      return generateSwipeDirection(score);
    case 'quick_math':
      return generateQuickMath(score);
    case 'tap_count':
      return generateTapCount(score);
    case 'rock_paper_scissors':
      return generateRPS(score);
    case 'shape_match':
      return generateShapeMatch(score);
    case 'order_sequence':
      return generateOrderSequence(score);
    default:
      return generateColorTap(score);
  }
}
