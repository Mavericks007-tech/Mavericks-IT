'use client';

import { useEffect, useState } from 'react';

import { ManageShell } from '@/components/manage/Shell';
import type { DRFPage } from '@/lib/manage-api';
import { cmsAdmin } from '@/lib/manage-api';

interface UserRow {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  groups: number[];
  group_names: string[];
  last_login: string | null;
}

interface GroupRow { id: number; name: string }

export default function UsersAdmin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      cmsAdmin.list<UserRow>('users'),
      cmsAdmin.list<GroupRow>('groups'),
    ])
      .then(([u, g]) => {
        setUsers(Array.isArray(u) ? u : (u as DRFPage<UserRow>).results);
        setGroups(Array.isArray(g) ? g : (g as DRFPage<GroupRow>).results);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function save(row: UserRow, patch: Partial<UserRow>) {
    setSaving(true);
    try {
      await cmsAdmin.update('users', row.id, patch as unknown as Record<string, unknown>);
      load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleGroup(row: UserRow, groupId: number) {
    const groups = row.groups.includes(groupId)
      ? row.groups.filter((g) => g !== groupId)
      : [...row.groups, groupId];
    await save(row, { groups });
  }

  return (
    <ManageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <header>
          <h1 className="font-display text-h2 text-white">Users &amp; Roles</h1>
          <p className="text-soft-gray text-sm mt-1">
            Toggle role checkboxes to grant or revoke RBAC groups. Changes audit-logged.
          </p>
        </header>

        {error && <div className="glass rounded-xl p-4 border border-crimson/40 text-crimson text-sm">{error}</div>}
        {loading && <div className="glass rounded-xl p-10 text-center text-soft-gray">Loading…</div>}

        {!loading && (
          <div className="glass rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-soft-gray text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center">Staff</th>
                  <th className="px-4 py-3 text-center">Super</th>
                  {groups.map((g) => (
                    <th key={g.id} className="px-3 py-3 text-center" title={g.name}>{g.name.replace(' ', ' ')}</th>
                  ))}
                  <th className="px-4 py-3 text-right">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">
                      <div>{u.username}</div>
                      <div className="text-soft-gray text-xs">{u.first_name} {u.last_name}</div>
                    </td>
                    <td className="px-4 py-3 text-soft-gray">{u.email || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" checked={u.is_active} disabled={saving}
                        onChange={() => save(u, { is_active: !u.is_active })}
                        className="accent-cyan" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" checked={u.is_staff} disabled={saving}
                        onChange={() => save(u, { is_staff: !u.is_staff })}
                        className="accent-cyan" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" checked={u.is_superuser} disabled={saving || u.username === 'admin'}
                        onChange={() => save(u, { is_superuser: !u.is_superuser })}
                        className="accent-crimson" />
                    </td>
                    {groups.map((g) => (
                      <td key={g.id} className="px-3 py-3 text-center">
                        <input type="checkbox" checked={u.groups.includes(g.id)} disabled={saving}
                          onChange={() => toggleGroup(u, g.id)}
                          className="accent-cyan" />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-soft-gray text-right text-xs">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ManageShell>
  );
}
