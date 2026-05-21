import type { LogEntry } from '../app/log';
import { SectionLabel } from './SectionLabel';

function LogLine({ entry }: { entry: LogEntry }) {
  const colorClass =
    entry.level === 'success'
      ? 'text-success'
      : entry.level === 'error'
        ? 'text-error'
        : 'text-canvas/75';
  return (
    <div className="flex gap-2 leading-normal">
      <span className="shrink-0 tabular-nums text-canvas/50">
        {entry.ts.toLocaleTimeString([], { hour12: false })}
      </span>
      <span className={`break-words ${colorClass}`}>{entry.msg}</span>
    </div>
  );
}

/**
 * Inverted (dark-on-canvas-text-color) event panel. Colors are tied to the
 * library's tokens — `bg-fg` becomes whatever `--epoch-color-text` resolves
 * to, so the log automatically inverts with theme changes.
 */
export function EventLog({ entries }: { entries: LogEntry[] }) {
  return (
    <aside>
      <SectionLabel>Event Log</SectionLabel>
      <div className="max-h-[28rem] min-h-64 overflow-y-auto rounded-md border border-line bg-fg px-4 py-3 font-mono text-[12px] text-canvas">
        {entries.length === 0 ? (
          <div className="py-6 text-center text-canvas/55">
            Events will appear here once you interact with the widget.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {entries.map((entry, i) => (
              <LogLine key={i} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
