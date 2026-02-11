/**
 * SyncConflictDiff Component
 * Sprint 3 - Offline Improvements
 *
 * Side-by-side comparison of local vs server data with color-coded changes.
 */

import { cn } from '@/lib/utils';

interface SyncConflictDiffProps {
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(empty)';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

export function SyncConflictDiff({ localData, serverData }: SyncConflictDiffProps) {
  // Collect all unique keys from both sides
  const allKeys = Array.from(
    new Set([...Object.keys(localData), ...Object.keys(serverData)])
  ).sort();

  // Skip internal/meta keys
  const filteredKeys = allKeys.filter(
    (k) => !k.startsWith('_') && k !== 'conflictRule'
  );

  if (filteredKeys.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No data available for comparison
      </p>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-3 bg-muted text-xs font-medium">
        <div className="px-3 py-2 border-r">Field</div>
        <div className="px-3 py-2 border-r text-blue-700">Local</div>
        <div className="px-3 py-2 text-green-700">Server</div>
      </div>

      {/* Data rows */}
      {filteredKeys.map((key) => {
        const localVal = localData[key];
        const serverVal = serverData[key];
        const isDifferent = JSON.stringify(localVal) !== JSON.stringify(serverVal);

        return (
          <div
            key={key}
            className={cn(
              'grid grid-cols-3 text-xs border-t',
              isDifferent && 'bg-orange-50'
            )}
          >
            <div className="px-3 py-1.5 border-r font-medium truncate" title={key}>
              {key}
            </div>
            <div
              className={cn(
                'px-3 py-1.5 border-r break-all',
                isDifferent && 'text-blue-700 font-medium'
              )}
            >
              <pre className="whitespace-pre-wrap font-mono text-[11px]">
                {formatValue(localVal)}
              </pre>
            </div>
            <div
              className={cn(
                'px-3 py-1.5 break-all',
                isDifferent && 'text-green-700 font-medium'
              )}
            >
              <pre className="whitespace-pre-wrap font-mono text-[11px]">
                {formatValue(serverVal)}
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}
