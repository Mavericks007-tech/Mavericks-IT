'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Upload, FileText, Trash2 } from 'lucide-react';

import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/Toast';
import { API_BASE } from '@/lib/api';

interface PortalProject {
  id: string;
  name: string;
  code: string;
  stage: string;
}

interface PortalFile {
  id: string;
  filename: string;
  file_url: string;
  size_bytes: number;
  source: 'agency' | 'client';
  uploaded_by_name: string | null;
  note: string;
  created_at: string;
}

function fmtSize(b: number): string {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function PortalFiles() {
  const router = useRouter();
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [files, setFiles] = useState<PortalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reload, setReload] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    if (!token) { router.push('/portal/login'); return; }
    fetch(`${API_BASE}/portal/projects/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        const list = (d.results ?? d ?? []) as PortalProject[];
        setProjects(list);
        if (list.length && !selectedProject) setSelectedProject(list[0].id);
      })
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedProject) return;
    const token = localStorage.getItem('portal_token') || '';
    fetch(`${API_BASE}/portal/files/?project=${selectedProject}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setFiles(d.results ?? d ?? []))
      .catch(() => {});
  }, [selectedProject, reload]);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !selectedProject) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('portal_token') || '';
      const fd = new FormData();
      fd.append('project', selectedProject);
      fd.append('file', f);
      const res = await fetch(`${API_BASE}/portal/files/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      toast.success('Uploaded', f.name);
      setReload((k) => k + 1);
    } catch (err) {
      toast.error('Upload failed', (err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function remove(file: PortalFile) {
    if (!confirm(`Delete ${file.filename}?`)) return;
    try {
      const token = localStorage.getItem('portal_token') || '';
      const res = await fetch(`${API_BASE}/portal/files/${file.id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReload((k) => k + 1);
    } catch (e) {
      toast.error('Delete failed', (e as Error).message);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Files" title="Project Files & Documents">
        <a href="/portal/dashboard" className="text-soft-gray hover:text-electric-cyan inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </a>
      </PageHeader>

      <Section className="pt-0">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            {loading ? (
              <p className="text-soft-gray text-center">Loading…</p>
            ) : projects.length === 0 ? (
              <p className="text-soft-gray text-center">No projects yet.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-soft-gray text-sm">Project</label>
                  <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
                          className="glass px-3 py-2 rounded-lg text-sm text-white">
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                  </select>

                  <label className="ml-auto inline-flex items-center gap-2 px-3 py-2 bg-electric-cyan/15 hover:bg-electric-cyan/25 border border-electric-cyan/40 text-electric-cyan rounded-md text-sm font-medium cursor-pointer">
                    <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload file'}
                    <input type="file" hidden onChange={upload} disabled={uploading} />
                  </label>
                </div>

                {files.length === 0 ? (
                  <div className="glass rounded-2xl p-10 text-center">
                    <FileText size={32} className="mx-auto text-soft-gray mb-2" />
                    <p className="text-soft-gray text-sm">No files for this project yet.</p>
                  </div>
                ) : (
                  <div className="glass rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/5 text-soft-gray text-xs uppercase tracking-wider">
                          <th className="p-3 text-left">File</th>
                          <th className="p-3 text-left">From</th>
                          <th className="p-3 text-left">Size</th>
                          <th className="p-3 text-left">Date</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map((f) => (
                          <tr key={f.id} className="border-t border-white/5">
                            <td className="p-3 text-white">
                              {f.filename}
                              {f.note && <p className="text-xs text-soft-gray">{f.note}</p>}
                            </td>
                            <td className="p-3 text-soft-gray text-xs">{f.source === 'agency' ? 'Mavericks' : 'You'}</td>
                            <td className="p-3 text-soft-gray text-xs">{fmtSize(f.size_bytes)}</td>
                            <td className="p-3 text-soft-gray text-xs">{new Date(f.created_at).toLocaleDateString()}</td>
                            <td className="p-3 text-right">
                              <a href={f.file_url} target="_blank" rel="noreferrer"
                                 className="inline-flex items-center gap-1 text-electric-cyan text-xs hover:underline mr-3">
                                <Download size={12} /> Download
                              </a>
                              {f.source === 'client' && (
                                <button onClick={() => remove(f)} className="inline-flex items-center gap-1 text-crimson-red text-xs hover:underline">
                                  <Trash2 size={12} /> Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
