'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  rows, columns, rowHref, empty = 'No records.',
}: {
  rows: T[];
  columns: Column<T>[];
  rowHref?: (row: T) => string;
  empty?: string;
}) {
  if (!rows.length) {
    return <div className="glass rounded-2xl p-12 text-center text-soft-gray">{empty}</div>;
  }
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/5 text-left">
            <tr className="text-xs font-mono uppercase tracking-wider text-soft-gray">
              {columns.map((c) => (
                <th key={c.key} className={'p-3 ' + (c.className || '')}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const href = rowHref?.(row);
              const cells = columns.map((c) => {
                const val = c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key] as ReactNode);
                return <td key={c.key} className={'p-3 ' + (c.className || '')}>{val ?? '—'}</td>;
              });
              return href ? (
                <tr
                  key={i}
                  onClick={() => (window.location.href = href)}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer"
                >
                  {cells}
                </tr>
              ) : (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">{cells}</tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
