/**
 * TextColumn — Text display column with template placeholder support.
 * Supports `{task.description}`, `{task.completed}`, and `{task.total}` placeholders.
 */
import type { Task } from '../task.js';

/**
 * Renders task information using a template string.
 * Placeholders: `{task.description}`, `{task.completed}`, `{task.total}`.
 * When `total` is null, it renders as "?".
 */
export class TextColumn {
  private readonly template: string;

  constructor(template = '{task.description}') {
    this.template = template;
  }

  render(task: Task): string {
    return this.template
      .replace('{task.description}', task.description)
      .replace('{task.completed}', String(task.completed))
      .replace('{task.total}', String(task.total ?? '?'));
  }
}
