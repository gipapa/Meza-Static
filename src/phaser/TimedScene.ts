import Phaser from 'phaser';

/**
 * Base scene with a cancellable timeline.
 *
 * Scenes use native setTimeout for their animation timelines (Phaser 3.90.0
 * timing bug workaround). Every timer scheduled through `at()` is tracked and
 * cleared when the scene shuts down or is destroyed, and PhaserContainer calls
 * `cancelTimers()` before destroying the game. This keeps callbacks — including
 * the final onComplete — from firing on a dead scene or an unmounted page.
 */
export default abstract class TimedScene extends Phaser.Scene {
  private timers = new Set<number>();
  private cancelled = false;

  /** Call at the start of create(). */
  protected initTimeline() {
    this.cancelled = false;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cancelTimers());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cancelTimers());
  }

  /** Run `fn` after `ms` milliseconds unless the scene is torn down first. */
  protected at(ms: number, fn: () => void) {
    if (this.cancelled) return;
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      if (!this.cancelled) fn();
    }, ms);
    this.timers.add(id);
  }

  cancelTimers() {
    this.cancelled = true;
    this.timers.forEach(id => window.clearTimeout(id));
    this.timers.clear();
  }
}
