import { type Project } from '../domain/model';
export interface RecoverySnapshot { project: Project; sourcePath: string | null; capturedAt: string }
export function shouldOfferRecovery(candidate: RecoverySnapshot, disk: Project | null): boolean {
  if (!disk) return true;
  if (candidate.project.id !== disk.id) return true;
  return JSON.stringify(candidate.project) !== JSON.stringify(disk) &&
    Date.parse(candidate.capturedAt) > Date.parse(disk.updatedAt);
}
export class RecoveryQueue {
  private epoch = 0;
  private pending: Promise<void> = Promise.resolve();
  constructor(private write: (snapshot: RecoverySnapshot) => Promise<void>) {}
  invalidate() { this.epoch++; }
  enqueue(snapshot: RecoverySnapshot): Promise<void> {
    const epoch = this.epoch;
    const result = this.pending.catch(() => {}).then(async () => {
      if (epoch === this.epoch) await this.write(snapshot);
    });
    this.pending = result;
    return result;
  }
  async settled() { await this.pending.catch(() => {}); }
}
