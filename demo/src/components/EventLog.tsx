import type { LogEntry } from '../app/log';
import { SectionLabel } from './SectionLabel';

function LogLine({ entry }: { entry: LogEntry }) {
  const colorClass =
    entry.level === 'success'
      ? 'text-demo-log-ok'
      : entry.level === 'error'
        ? 'text-demo-log-err'
        : 'text-demo-log-slate';
  return (
    <div className="flex gap-2 leading-normal">
      <span className="shrink-0 text-demo-log-muted">{entry.ts.toLocaleTimeString([], { hour12: false })}</span>
      <span className={`break-words ${colorClass}`}>{entry.msg}</span>
    </div>
  );
}

export function EventLog({ entries }: { entries: LogEntry[] }) {
  return (
    <aside>
      <SectionLabel>Event Log</SectionLabel>
      <div className="max-h-[28rem] min-h-64 overflow-y-auto rounded-[0.875rem] border border-demo-border bg-demo-log-bg px-[1.125rem] py-4 font-mono text-xs">
        {entries.length === 0 ? (
          <div className="py-6 text-center text-demo-log-muted">Events will appear here once you interact with the widget.</div>
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
