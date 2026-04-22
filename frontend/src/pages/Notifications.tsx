import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Send, Mail, MessageCircle, CheckCircle, XCircle, Clock,
  PlayCircle, AlertTriangle, RefreshCw, Eye, PenSquare, X,
} from 'lucide-react';
import { notificationsApi } from '../api/client';
import type { NotificationLog } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewItem {
  type: 'service' | 'insurance' | 'inspection' | 'license';
  days_left: number;
  label: string;
  detail: string;
  vehicle_id?: number;
  driver_id?: number;
  plate?: string;
  driver?: string;
}

interface PreviewResponse {
  items: PreviewItem[];
  total: number;
  alert_days: string;
  email_on: boolean;
  whatsapp_on: boolean;
  admin_email: string;
  admin_whatsapp: string;
}

interface RunResponse {
  message: string;
  sent: number;
  failed: number;
  total: number;
  logs: NotificationLog[];
}

interface ManualForm {
  channel: 'email' | 'whatsapp';
  recipient: string;
  subject: string;
  message: string;
  type: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeColors: Record<string, string> = {
  service:    'bg-blue-100 text-blue-800',
  insurance:  'bg-purple-100 text-purple-800',
  inspection: 'bg-yellow-100 text-yellow-800',
  license:    'bg-orange-100 text-orange-800',
  manual:     'bg-slate-100 text-slate-700',
};

const urgencyColor = (days: number) =>
  days <= 7 ? 'text-red-600 font-semibold' : days <= 14 ? 'text-orange-500 font-medium' : 'text-slate-600';

const statusIcon: Record<string, React.ReactElement> = {
  sent:    <CheckCircle size={15} className="text-green-500" />,
  failed:  <XCircle    size={15} className="text-red-500" />,
  pending: <Clock      size={15} className="text-yellow-500" />,
};

// ─── Manual Send Modal ────────────────────────────────────────────────────────

function ManualModal({
  preview,
  onClose,
  onSent,
}: {
  preview?: PreviewResponse;
  onClose: () => void;
  onSent: () => void;
}) {
  const [form, setForm] = useState<ManualForm>({
    channel:   'email',
    recipient: preview?.admin_email ?? '',
    subject:   '',
    message:   '',
    type:      'manual',
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const set = (k: keyof ManualForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const switchChannel = (ch: 'email' | 'whatsapp') => {
    setForm(f => ({
      ...f,
      channel:   ch,
      recipient: ch === 'email'
        ? (preview?.admin_email ?? '')
        : (preview?.admin_whatsapp ?? ''),
    }));
  };

  const fillFromItem = (item: PreviewItem) => {
    const subject = item.label;
    const msg = `Josbin Fleet MS Alert: ${item.label}. ${item.detail}.`;
    setForm(f => ({ ...f, subject, message: msg, type: item.type }));
  };

  const handleSend = async () => {
    if (!form.recipient.trim() || !form.message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const r = await notificationsApi.manual({
        channel:   form.channel,
        recipient: form.recipient.trim(),
        subject:   form.subject.trim() || undefined,
        message:   form.message.trim(),
        type:      form.type,
      });
      setResult({ ok: true, msg: r.data.message });
      onSent();
    } catch (e: any) {
      setResult({ ok: false, msg: e?.response?.data?.message ?? 'Send failed.' });
    } finally {
      setSending(false);
    }
  };

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <PenSquare size={15} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Send Manual Notification</h2>
              <p className="text-xs text-slate-400">Compose and send a one-off alert to any recipient.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Channel selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Channel</label>
            <div className="flex gap-2">
              {(['email', 'whatsapp'] as const).map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => switchChannel(ch)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.channel === ch
                      ? ch === 'email'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {ch === 'email' ? <Mail size={14} /> : <MessageCircle size={14} />}
                  {ch.charAt(0).toUpperCase() + ch.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {form.channel === 'email' ? 'Email Address' : 'WhatsApp Number (e.g. +59712345678)'}
            </label>
            <input
              type="text"
              value={form.recipient}
              onChange={e => set('recipient', e.target.value)}
              placeholder={form.channel === 'email' ? 'admin@josbin.sr' : '+597XXXXXXXX'}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subject (email only) */}
          {form.channel === 'email' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={e => set('subject', e.target.value)}
                placeholder="Josbin Fleet MS Notification"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notification Type</label>
            <select
              value={form.type}
              onChange={e => set('type', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="manual">General / Manual</option>
              <option value="service">Service Due</option>
              <option value="insurance">Insurance Expiry</option>
              <option value="inspection">Inspection Due</option>
              <option value="license">License Expiry</option>
            </select>
          </div>

          {/* Quick-fill from upcoming items */}
          {preview && preview.items.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Quick-fill from upcoming deadlines
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-2">
                {preview.items.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => fillFromItem(item)}
                    className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${typeColors[item.type]}`}>
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-700 truncate">{item.label}</span>
                    </div>
                    <span className={`text-xs ml-2 shrink-0 ${urgencyColor(item.days_left)}`}>
                      {item.days_left === 0 ? 'Today' : `${item.days_left}d`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={e => set('message', e.target.value)}
              placeholder="Type your notification message here…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{form.message.length} / 2000</p>
          </div>

          {/* Result */}
          {result && (
            <div className={`flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm border ${
              result.ok
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {result.ok
                ? <CheckCircle size={15} className="shrink-0 mt-0.5 text-green-500" />
                : <XCircle     size={15} className="shrink-0 mt-0.5 text-red-500" />}
              {result.msg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            {result?.ok ? 'Close' : 'Cancel'}
          </button>
          {!result?.ok && (
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !form.recipient.trim() || !form.message.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {sending
                ? <><RefreshCw size={14} className="animate-spin" /> Sending…</>
                : <><Send size={14} /> Send Notification</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Notifications() {
  const qc = useQueryClient();
  const [filter, setFilter]       = useState<'all' | 'email' | 'whatsapp'>('all');
  const [running, setRunning]     = useState(false);
  const [runResult, setRunResult] = useState<RunResponse | null>(null);
  const [runError, setRunError]   = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Log history
  const { data: logsPage, isLoading: logsLoading } = useQuery<{ data: NotificationLog[] }>({
    queryKey: ['notification-logs'],
    queryFn: () => notificationsApi.list().then(r => r.data),
  });
  const logs: NotificationLog[] = logsPage?.data ?? [];

  // Preview upcoming deadlines
  const { data: preview, isLoading: previewLoading, refetch: refetchPreview } = useQuery<PreviewResponse>({
    queryKey: ['notifications-preview'],
    queryFn: () => notificationsApi.preview().then(r => r.data),
  });

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ['notification-logs'] });
    refetchPreview();
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    setRunError(null);
    try {
      const r = await notificationsApi.run();
      setRunResult(r.data);
      refreshAll();
    } catch (e: any) {
      setRunError(e?.response?.data?.message ?? 'Failed to run notifications.');
    } finally {
      setRunning(false);
    }
  };

  const filtered = filter === 'all' ? logs : logs.filter(l => l.channel === filter);

  const counts = {
    sent:     logs.filter(l => l.status === 'sent').length,
    failed:   logs.filter(l => l.status === 'failed').length,
    email:    logs.filter(l => l.channel === 'email').length,
    whatsapp: logs.filter(l => l.channel === 'whatsapp').length,
  };

  return (
    <div className="space-y-5">

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {showModal && (
        <ManualModal
          preview={preview}
          onClose={() => setShowModal(false)}
          onSent={refreshAll}
        />
      )}

      {/* ── Page header with manual send button ────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and send fleet alerts.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <PenSquare size={15} />
          Send Manual Notification
        </button>
      </div>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sent',         value: counts.sent,     color: 'bg-green-50 text-green-700'     },
          { label: 'Failed',       value: counts.failed,   color: 'bg-red-50 text-red-700'         },
          { label: 'Via Email',    value: counts.email,    color: 'bg-blue-50 text-blue-700'       },
          { label: 'Via WhatsApp', value: counts.whatsapp, color: 'bg-emerald-50 text-emerald-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color} border border-white shadow-sm`}>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="text-2xl font-bold mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Send on Demand ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <PlayCircle size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Scheduled Notification Check</h3>
            <p className="text-xs text-slate-400">Preview upcoming deadlines and trigger the scheduled alerts immediately.</p>
          </div>
          <button
            onClick={() => refetchPreview()}
            className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh preview"
          >
            <RefreshCw size={14} className={previewLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {previewLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : preview && preview.items.length > 0 ? (
            <>
              {/* Channel status */}
              <div className="flex flex-wrap gap-3">
                <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
                  preview.email_on
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                }`}>
                  <Mail size={12} />
                  {preview.email_on ? `Email → ${preview.admin_email || 'not set'}` : 'Email off'}
                </div>
                <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
                  preview.whatsapp_on
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                }`}>
                  <MessageCircle size={12} />
                  {preview.whatsapp_on ? `WhatsApp → ${preview.admin_whatsapp || 'not set'}` : 'WhatsApp off'}
                </div>
                <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500 ml-auto">
                  <Eye size={12} />
                  Alert thresholds: {preview.alert_days} days
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Type', 'Vehicle / Driver', 'Detail', 'Days Left'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[item.type]}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 font-medium">{item.plate ?? item.driver}</td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs">{item.detail}</td>
                        <td className={`px-4 py-2.5 text-sm ${urgencyColor(item.days_left)}`}>
                          {item.days_left === 0 ? 'Today' : `${item.days_left}d`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : preview ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
              <CheckCircle size={16} className="text-green-500" />
              No upcoming deadlines within the configured alert thresholds.
            </div>
          ) : null}

          {/* Run result */}
          {runResult && (
            <div className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm border ${
              runResult.failed > 0
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              {runResult.failed > 0
                ? <AlertTriangle size={16} className="shrink-0 mt-0.5 text-yellow-500" />
                : <CheckCircle   size={16} className="shrink-0 mt-0.5 text-green-500" />}
              <div>
                <p className="font-medium">{runResult.message}</p>
                {runResult.total > 0 && (
                  <p className="text-xs mt-0.5 opacity-80">
                    {runResult.sent} sent · {runResult.failed} failed · {runResult.total} total
                  </p>
                )}
              </div>
            </div>
          )}

          {runError && (
            <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700">
              <XCircle size={16} className="shrink-0" />
              {runError}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {running
                ? <><RefreshCw size={15} className="animate-spin" /> Running…</>
                : <><Send size={15} /> Run Notification Check</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Log history ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Notification History</span>
          <div className="ml-auto flex gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'email', 'whatsapp'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize flex items-center gap-1.5 ${
                  filter === f ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === 'email'    && <Mail          size={12} />}
                {f === 'whatsapp' && <MessageCircle size={12} />}
                {f === 'all'      && <Send          size={12} />}
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {logsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Type', 'Channel', 'Recipient', 'Subject / Message', 'Status', 'Sent At'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[log.type] ?? 'bg-slate-100 text-slate-700'}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        {log.channel === 'email' ? <Mail size={13} /> : <MessageCircle size={13} />}
                        <span className="capitalize">{log.channel}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{log.recipient}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                      {log.subject ? <strong>{log.subject}</strong> : log.message}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        {statusIcon[log.status] ?? statusIcon.pending}
                        <span className="capitalize text-xs">{log.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{log.sent_at ?? '—'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No notifications found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Info box ───────────────────────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Automatic notifications</strong> run daily at 08:00 via the Laravel scheduler.
        Use <em>Run Notification Check</em> to trigger scheduled alerts on demand, or <em>Send Manual Notification</em> to compose a custom message to any recipient.
        Configure recipients and thresholds in <a href="/settings" className="underline font-medium">Settings</a>.
      </div>
    </div>
  );
}
