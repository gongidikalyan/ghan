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
  | 'order_sequence';

export type GameScreen = 
  | 'SPLASH' 
  | 'HOME' 
  | 'COUNTDOWN' 
  | 'PLAYING' 
  | 'GAME_OVER';

export interface BaseChallenge {
  id: string;
  type: ChallengeType;
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
  | { type: 'order_sequence'; data: OrderSequencePayload };

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  instruction: string;
  durationMs: number;
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
