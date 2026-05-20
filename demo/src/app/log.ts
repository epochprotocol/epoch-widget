export interface LogEntry {
  ts: Date;
  level: 'info' | 'success' | 'error';
  msg: string;
}
