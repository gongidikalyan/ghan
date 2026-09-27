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
function generateColorTap(score: number): Challenge {
  const id = `color_tap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let itemCount = 3;
  if (score >= 25) itemCount = 6;
  else if (score >= 10) itemCount = 4;

  const shuffledColors = shuffle(COLOR_PALETTE).slice(0, itemCount);
  const targetIndex = Math.floor(Math.random() * itemCount);
  const target = shuffledColors[targetIndex];

  const isStroop = score >= 14 && Math.random() > 0.45;
  let items: ColorTapItem[] = [];
  const durationMs = getDynamicDuration(3500, score, 900);

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
  const durationMs = getDynamicDuration(3400, score, 850);

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

  const durationMs = getDynamicDuration(3500, score, 950);

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
  const answerTimeMs = getDynamicDuration(2900, score, 1000);

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
  const speedMs = Math.max(500, Math.round(1350 / speedMult));
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
  const durationMs = getDynamicDuration(2800, score, 800);

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
  const durationMs = getDynamicDuration(3500, score, 1100);

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

  const baseDuration = targetCount * 650 + 750;
  const durationMs = getDynamicDuration(baseDuration, score, 900);

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
  const durationMs = getDynamicDuration(2900, score, 850);

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
  const durationMs = getDynamicDuration(3100, score, 850);

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
  const baseDuration = totalSteps * 850 + 700;
  const durationMs = getDynamicDuration(baseDuration, score, 1100);

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
function generateLaneAction(score: number): Challenge {
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

  const picked = subTypes[Math.floor(Math.random() * subTypes.length)];
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

  const durationMs = getDynamicDuration(2900, score, 950);

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
function generateTensionMeter(score: number): Challenge {
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

  const picked = meterModes[Math.floor(Math.random() * meterModes.length)];
  const speedMult = getSpeedMultiplier(score);
  let speed = Math.max(450, Math.round(picked.speed / speedMult));
  let zoneWidth = Math.max(10, Math.round(picked.zoneWidth / Math.pow(speedMult, 0.4)));

  const durationMs = picked.isMash 
    ? getDynamicDuration(2700, score, 1300) 
    : Math.round(speed * 2.7);

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
function generateFloatingTarget(score: number): Challenge {
  const id = `float_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const modes = [
    { subType: 'pop_bubbles', title: 'POP THE BUBBLES', instruction: 'POP THE GREEN BUBBLE!', targetIcon: '🫧', hazardIcon: '⚪', desc: 'Pop green target bubble' },
    { subType: 'balloon_burst', title: 'BALLOON BURST', instruction: 'POP THE RED BALLOON!', targetIcon: '🎈', hazardIcon: '🔵', desc: 'Pop red balloon' },
    { subType: 'moving_target', title: 'MOVING TARGET', instruction: 'HIT MOVING CROSSHAIR!', targetIcon: '🎯', hazardIcon: '🔘', desc: 'Tap crosshair target' },
    { subType: 'final_target', title: 'FINAL TARGET', instruction: 'SURVIVE AND HIT TARGET!', targetIcon: '🎪', hazardIcon: '◽', desc: 'Tap the final target' },
    { subType: 'avoid_bomb', title: 'AVOID THE BOMB', instruction: 'TAP GEM, AVOID BOMB!', targetIcon: '💎', hazardIcon: '💣', desc: 'Tap gem, never bomb!' },
    { subType: 'spot_crack', title: 'SPOT THE CRACK', instruction: 'TAP THE CRACKED SHELL 🐣!', targetIcon: '🐣', hazardIcon: '🥚', desc: 'Tap cracked item' },
  ];

  const picked = modes[Math.floor(Math.random() * modes.length)];

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

  const durationMs = getDynamicDuration(3300, score, 950);

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
function generateChoiceHazard(score: number): Challenge {
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
      options: [
        { id: 'opt_m_north', title: 'NORTH (+)', icon: '🧲', isCorrect: true },
        { id: 'opt_m_south', title: 'SOUTH (-)', icon: '🧲', isCorrect: false },
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

  const picked = scenarios[Math.floor(Math.random() * scenarios.length)];
  const shuffledOptions = shuffle(picked.options);
  const durationMs = getDynamicDuration(3300, score, 950);

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
function generateWireSwitch(score: number): Challenge {
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

  const picked = switchModes[Math.floor(Math.random() * switchModes.length)];
  const durationMs = getDynamicDuration(3200, score, 900);

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
function generateCodePuzzle(score: number): Challenge {
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

  const picked = puzzleModes[Math.floor(Math.random() * puzzleModes.length)];
  const shuffledOptions = shuffle(picked.options);
  const durationMs = getDynamicDuration(3400, score, 1000);

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
  'lane_action',
  'tension_meter',
  'floating_target',
  'choice_hazard',
  'wire_switch',
  'code_puzzle',
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
    case 'lane_action':
      return generateLaneAction(score);
    case 'tension_meter':
      return generateTensionMeter(score);
    case 'floating_target':
      return generateFloatingTarget(score);
    case 'choice_hazard':
      return generateChoiceHazard(score);
    case 'wire_switch':
      return generateWireSwitch(score);
    case 'code_puzzle':
      return generateCodePuzzle(score);
    default:
      return generateLaneAction(score);
  }
}
