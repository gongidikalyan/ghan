export type ChallengeType = 
  | 'color_tap' 
  | 'dont_touch' 
  | 'find_odd' 
  | 'memory_position' 
  | 'stop_target'
  | 'swipe_direction'
  | 'quick_math'
  | 'tap_count'
  | 'rock_paper_scissors'
  | 'shape_match'
  | 'order_sequence'
  // 50 Speed n Tension Extended Engines
  | 'lane_action'
  | 'tension_meter'
  | 'floating_target'
  | 'choice_hazard'
  | 'wire_switch'
  | 'code_puzzle';

export type GameScreen = 
  | 'SPLASH' 
  | 'HOME' 
  | 'COUNTDOWN' 
  | 'PLAYING' 
  | 'GAME_OVER';

export interface BaseChallenge {
  id: string;
  type: ChallengeType;
  mechanicIndex?: number;
  mechanicName?: string;
  mechanicIcon?: string;
  title: string;
  instruction: string;
  durationMs: number;
}

export interface ColorTapItem {
  id: string;
  colorName: string;
  hex: string;
  label?: string;
  labelColorHex?: string;
  isCorrect: boolean;
}

export interface ColorTapPayload {
  items: ColorTapItem[];
  targetColorName: string;
  targetColorHex: string;
  isStroop?: boolean;
}

export interface DontTouchItem {
  id: string;
  iconName: string;
  label: string;
  isForbidden: boolean;
}

export interface DontTouchPayload {
  items: DontTouchItem[];
  forbiddenLabel: string;
  forbiddenIconName: string;
}

export interface FindOddItem {
  id: string;
  content: string;
  colorHex?: string;
  isOdd: boolean;
  rotation?: number;
}

export interface FindOddPayload {
  items: FindOddItem[];
  gridCols: number;
  oddDescription: string;
}

export interface MemoryPositionPayload {
  gridSize: number;
  targetIndices: number[];
  targetIcon: string;
  flashDurationMs: number;
}

export interface StopTargetPayload {
  targetZoneStartPercent: number;
  targetZoneWidthPercent: number;
  speedMs: number;
}

export type Direction = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

export interface SwipeDirectionPayload {
  promptDirection: Direction;
  targetDirection: Direction;
  isOppositeRule?: boolean;
}

export interface QuickMathOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface QuickMathPayload {
  question: string;
  options: QuickMathOption[];
  explanation: string;
}

export interface TapCountPayload {
  targetCount: number;
}

export type RPSChoice = 'ROCK' | 'PAPER' | 'SCISSORS';

export interface RPSPayload {
  opponentChoice: RPSChoice;
  targetChoice: RPSChoice;
  goal: 'WIN' | 'LOSE';
}

export interface ShapeItem {
  id: string;
  shapeKey: 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'heart' | 'hexagon' | 'pentagon';
  label: string;
  isCorrect: boolean;
}

export interface ShapeMatchPayload {
  targetShapeKey: string;
  targetShapeLabel: string;
  items: ShapeItem[];
}

export interface OrderItem {
  id: string;
  label: string;
  stepNumber: number;
}

export interface OrderSequencePayload {
  items: OrderItem[];
  totalSteps: number;
}

// 1. Lane Action (Knife Dodge, Meteor Dodge, Catch Star, Coin Catch, Laser Dodge, Magnetic Maze, Falling Object, Shadow Follow)
export interface LaneActionPayload {
  mode: 'dodge' | 'catch';
  playerIcon: string;
  targetIcon: string;
  hazardIcon?: string;
  laneCount: number; // 3 or 4
  initialPlayerLane: number;
  hazardLanes: number[]; // lanes with hazards
  targetLane: number; // lane with target to catch
  hint: string;
}

// 2. Tension Meter (Bullseye, Rocket Launch/Landing, Knife Throw, Bottle Flip, Power Charge, Tug of War, Temperature, Balance, Wind)
export interface TensionMeterPayload {
  meterType: 'timing_stop' | 'rapid_mash' | 'balance_hold';
  subType: string;
  centerIcon: string;
  targetZoneStartPercent: number;
  targetZoneWidthPercent: number;
  speedMs: number;
  mashTargetTaps?: number; // for tug of war
  label: string;
}

// 3. Floating Target (Pop Bubbles, Balloon Burst, Moving Target, Final Target, Avoid Bomb, Spot Crack)
export interface FloatingItem {
  id: string;
  icon: string;
  label?: string;
  isTarget: boolean;
  xPercent: number; // 10 to 80
  yPercent: number; // 15 to 75
  sizePx: number;
}

export interface FloatingTargetPayload {
  subType: string;
  items: FloatingItem[];
  requiredPops: number;
  targetDescription: string;
  penaltyOnWrong: boolean;
}

// 4. Choice Hazard (Which Door?, Trap Door, Safe Tile, Floor Is Lava, Portal Match, Teleport Choice, Key & Lock, Escape Box, Shadow Match, Color Pour, Magnet Match)
export interface ChoiceOption {
  id: string;
  title: string;
  icon: string;
  subLabel?: string;
  isCorrect: boolean;
  colorHex?: string;
}

export interface ChoiceHazardPayload {
  subType: string;
  question: string;
  options: ChoiceOption[];
  clue?: string;
}

// 5. Wire Switch (Bomb Defuse, Wire Connect, Light Switch, Train Switch, Traffic Control, Pipe Connect, Gear Match, Shape Rotation)
export interface WireSwitchItem {
  id: string;
  label: string;
  icon: string;
  isTargetAction: boolean;
  state: 'inactive' | 'active';
  colorHex?: string;
}

export interface WireSwitchPayload {
  subType: string;
  prompt: string;
  items: WireSwitchItem[];
}

// 6. Code Puzzle (Unlock Code, Code Sequence, Disappearing Path, Mirror Match, Rapid Sort, Object Swap, Moving Puzzle)
export interface CodePuzzlePayload {
  subType: string;
  displayCode?: string;
  flashMs: number;
  sequenceSteps?: string[];
  options: { id: string; label: string; isCorrect: boolean }[];
}

export type ChallengePayload = 
  | { type: 'color_tap'; data: ColorTapPayload }
  | { type: 'dont_touch'; data: DontTouchPayload }
  | { type: 'find_odd'; data: FindOddPayload }
  | { type: 'memory_position'; data: MemoryPositionPayload }
  | { type: 'stop_target'; data: StopTargetPayload }
  | { type: 'swipe_direction'; data: SwipeDirectionPayload }
  | { type: 'quick_math'; data: QuickMathPayload }
  | { type: 'tap_count'; data: TapCountPayload }
  | { type: 'rock_paper_scissors'; data: RPSPayload }
  | { type: 'shape_match'; data: ShapeMatchPayload }
  | { type: 'order_sequence'; data: OrderSequencePayload }
  | { type: 'lane_action'; data: LaneActionPayload }
  | { type: 'tension_meter'; data: TensionMeterPayload }
  | { type: 'floating_target'; data: FloatingTargetPayload }
  | { type: 'choice_hazard'; data: ChoiceHazardPayload }
  | { type: 'wire_switch'; data: WireSwitchPayload }
  | { type: 'code_puzzle'; data: CodePuzzlePayload };

export interface Challenge extends BaseChallenge {
  payload: ChallengePayload;
}

export interface UserStats {
  bestScore: number;
  gamesPlayed: number;
  totalScore: number;
  bestCombo: number;
  challengesCompleted: Record<string, number>;
}

export type ColorMode = 'light' | 'dark';

export type ThemeId = 'crimson' | 'amber' | 'indigo' | 'emerald' | 'mono';

export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  volume: number;
  quickCountdown: boolean;
  colorMode: ColorMode;
  theme: ThemeId;
}
