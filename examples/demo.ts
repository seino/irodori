/**
 * irodori デモスクリプト
 *
 * README 用のスクリーンショット撮影に使用する。
 * 実行: npx tsx examples/demo.ts
 */
import { Console, Table, Panel, Progress } from '../src/index.js';

const con = new Console({ forceTerminal: true, width: 80 });

// ── Markup ──────────────────────────────────────────────────
con.rule('Markup');
con.print('[bold]Bold[/]  [italic]Italic[/]  [underline]Underline[/]  [strikethrough]Strikethrough[/]');
con.print('[red]Red[/]  [green]Green[/]  [blue]Blue[/]  [yellow]Yellow[/]  [magenta]Magenta[/]  [cyan]Cyan[/]');
con.print('[bold #ff8800]Hex Color[/]  [italic bright_cyan]Bright Cyan[/]  [bold green on black] Highlighted [/]');
con.print('[link=https://github.com/seino/irodori]irodori on GitHub :rocket:[/]');
con.line();

// ── Table ───────────────────────────────────────────────────
con.rule('Table');

const table = new Table({
  title: 'Star Framework Comparison',
  border: 'rounded',
  headerStyle: 'bold cyan',
});
table.addColumn('Framework', { minWidth: 12 });
table.addColumn('Language', { justify: 'center' });
table.addColumn('Stars', { justify: 'right' });
table.addColumn('Description');

table.addRow('irodori', 'TypeScript', '⭐ New', 'Beautiful terminal UI for Node.js');
table.addRow('Rich', 'Python', '50k+', 'Rich text in the terminal');
table.addRow('Ink', 'TypeScript', '27k+', 'React for CLIs');
table.addRow('Chalk', 'TypeScript', '22k+', 'Terminal string styling');

con.print(table);
con.line();

// ── Panel ───────────────────────────────────────────────────
con.rule('Panel');

const panel = new Panel(
  '[bold green]irodori[/] is a terminal UI library for Node.js,\ninspired by Python\'s Rich library.\n\n✨ Zero dependencies — no runtime deps\n🎨 Auto color detection — TrueColor / 256 / Basic / None\n⚡ Fast rendering — flicker-free live updates',
  {
    title: 'About irodori',
    subtitle: 'v0.1.0',
    border: 'rounded',
  },
);

con.print(panel);
con.line();

// ── Progress ────────────────────────────────────────────────
con.rule('Progress');
con.print('[dim]* Progress bars animate in real-time[/]');
con.line();

await Progress.run(async (progress) => {
  const task1 = progress.addTask('Downloading assets...', { total: 100 });
  const task2 = progress.addTask('Building project...', { total: 50 });
  const task3 = progress.addTask('Running tests...', { total: 200 });

  for (let i = 0; i < 200; i++) {
    await new Promise((r) => setTimeout(r, 30));
    if (i < 100) progress.advance(task1);
    if (i < 50) progress.advance(task2);
    progress.advance(task3);
  }
});

con.line();
con.print('[bold green]:white_check_mark: All done![/]');
