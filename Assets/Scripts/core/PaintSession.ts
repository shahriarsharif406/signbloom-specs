import { P2, foldPoint } from "./Symmetry";

export const FOLD_OPTIONS: readonly number[] = [4, 6, 8, 12];

export type PaintPoint = { x: number; y: number; brush: number };

export type PaintConfig = {
  /** Minimum distance between ink dots (scene units). */
  spacing: number;
  /** Hard cap on dots on screen (protects frame rate). */
  maxDots: number;
  brushCount: number;
  /** Index into FOLD_OPTIONS to start with (default: 8-fold). */
  startFoldIndex: number;
};

export const DEFAULT_PAINT: PaintConfig = { spacing: 0.6, maxDots: 1500, brushCount: 7, startFoldIndex: 2 };

type Stroke = { dots: number };

/**
 * PaintSession — logic for "Alpona Air" free drawing.
 *
 * It decides which symmetric points to ink (respecting spacing and the dot
 * budget) and keeps a per-stroke dot count so undo can remove exactly one stroke.
 * The Lens component owns the actual scene objects; it mirrors this stack.
 */
export class PaintSession {
  private foldIndex: number;
  private brush = 0;
  private strokes: Stroke[] = [];
  private current: Stroke | null = null;
  private last: P2 | null = null;
  private dotTotal = 0;

  constructor(private readonly cfg: PaintConfig = DEFAULT_PAINT) {
    this.foldIndex = Math.max(0, Math.min(FOLD_OPTIONS.length - 1, cfg.startFoldIndex));
  }

  get folds(): number {
    return FOLD_OPTIONS[this.foldIndex];
  }
  get brushIndex(): number {
    return this.brush;
  }
  get strokeCount(): number {
    return this.strokes.length;
  }
  get dots(): number {
    return this.dotTotal;
  }

  cycleFolds(): number {
    this.foldIndex = (this.foldIndex + 1) % FOLD_OPTIONS.length;
    return this.folds;
  }

  cycleBrush(): number {
    this.brush = (this.brush + 1) % Math.max(1, this.cfg.brushCount);
    return this.brush;
  }

  /**
   * Add a fingertip sample. Returns the symmetric points to ink, or null when the
   * sample is too close to the last one or the dot budget is spent.
   */
  add(p: P2): PaintPoint[] | null {
    if (this.last && Math.hypot(p.x - this.last.x, p.y - this.last.y) < this.cfg.spacing) return null;
    const pts = foldPoint(p, this.folds, true);
    if (this.dotTotal + pts.length > this.cfg.maxDots) return null;

    if (!this.current) {
      this.current = { dots: 0 };
      this.strokes.push(this.current);
    }
    this.current.dots += pts.length;
    this.dotTotal += pts.length;
    this.last = p;
    return pts.map((q) => ({ x: q.x, y: q.y, brush: this.brush }));
  }

  endStroke(): void {
    this.current = null;
    this.last = null;
  }

  /** Remove the most recent stroke. Returns how many dots it contained (0 if nothing to undo). */
  undo(): number {
    this.endStroke();
    const s = this.strokes.pop();
    if (!s) return 0;
    this.dotTotal -= s.dots;
    return s.dots;
  }

  clear(): void {
    this.strokes = [];
    this.current = null;
    this.last = null;
    this.dotTotal = 0;
  }
}
