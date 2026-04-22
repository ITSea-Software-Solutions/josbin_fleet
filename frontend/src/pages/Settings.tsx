import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell, Mail, MessageCircle, Shield, Save, Send,
  CheckCircle, AlertTriangle, Eye, EyeOff, Settings as SettingsIcon,
} from 'lucide-react';
import api from '../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingEntry {
  value: string | boolean | null;
  label: string;
  group: string;
  type: 'text' | 'boolean' | 'password' | 'number';
}
type SettingsMap = Record<string, SettingEntry>;

// ─── Helper components ────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-slate-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

function Field({
  label, value, type = 'text', onChange, placeholder,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={isPassword && !show ? 'password' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon size={16} className="text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg shadow-lg ${
      type === 'success'
        ? 'bg-green-50 border border-green-200 text-green-800'
        : 'bg-red-50 border border-red-200 text-red-700'
    }`}>
      {type === 'success'
        ? <CheckCircle size={16} className="text-green-500 shrink-0" />
        : <AlertTriangle size={16} className="text-red-500 shrink-0" />}
      {msg}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Settings() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [testLoading, setTestLoading] = useState<'email' | 'whatsapp' | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch settings
  const { data: settings, isLoading } = useQuery<SettingsMap>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
  });

  // Local editable state (synced from server on load)
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [initialised, setInitialised] = useState(false);

  if (settings && !initialised) {
    const initial: Record<string, string | boolean> = {};
    Object.entries(settings).forEach(([k, v]) => {
      initial[k] = v.type === 'boolean' ? Boolean(v.value) : String(v.value ?? '');
    });
    setForm(initial);
    setInitialised(true);
  }

  const str  = (key: string) => String(form[key] ?? '');
  const bool = (key: string) => Boolean(form[key]);
  const set  = (key: string, val: string | boolean) => setForm(f => ({ ...f, [key]: val }));

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, string> = {};
      Object.entries(form).forEach(([k, v]) => {
        payload[k] = String(v);
      });
      return api.put('/settings', { settings: payload });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      showToast('Settings saved successfully.');
    },
    onError: (e: any) => showToast(e?.response?.data?.message ?? 'Failed to save.', 'error'),
  });

  const testEmail = async () => {
    setTestLoading('email');
    try {
      const r = await api.post('/settings/test-email');
      showToast(r.data.message);
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Test email failed.', 'error');
    } finally {
      setTestLoading(null);
    }
  };

  const testWhatsApp = async () => {
    setTestLoading('whatsapp');
    try {
      const r = await api.post('/settings/test-whatsapp');
      showToast(r.data.message);
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Test WhatsApp failed.', 'error');
    } finally {
      setTestLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notification Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure who receives alerts and how they are delivered.</p>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          <Save size={15} />
          {saveMutation.isPending ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Recipients ──────────────────────────────────────────────────────── */}
      <SectionCard title="Notification Recipients" icon={Bell}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Admin Email Address" value={str('admin_email')} onChange={v => set('admin_email', v)} placeholder="admin@josbin.sr" />
          <Field label="Admin WhatsApp Number" value={str('admin_whatsapp')} onChange={v => set('admin_whatsapp', v)} placeholder="+597XXXXXXXX" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Email Notifications</p>
              <p className="text-xs text-slate-400">Send alerts via SMTP email</p>
            </div>
            <Toggle checked={bool('notify_email_enabled')} onChange={v => set('notify_email_enabled', v)} />
          </div>
          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">WhatsApp Notifications</p>
              <p className="text-xs text-slate-400">Send alerts via Twilio WhatsApp</p>
            </div>
            <Toggle checked={bool('notify_whatsapp_enabled')} onChange={v => set('notify_whatsapp_enabled', v)} />
          </div>
        </div>
      </SectionCard>

      {/* ── Alert Rules ─────────────────────────────────────────────────────── */}
      <SectionCard title="Alert Rules" icon={SettingsIcon}>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Alert Days Before Expiry</label>
          <input
            type="text"
            value={str('alert_days')}
            onChange={e => set('alert_days', e.target.value)}
            placeholder="30,14,7"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
          />
          <p className="text-xs text-slate-400 mt-1.5">Comma-separated days — e.g. <code className="bg-slate-100 px-1 rounded">30,14,7</code> sends alerts 30, 14, and 7 days before a deadline.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          {[
            { key: 'alert_service',    label: 'Service Due Alerts',        desc: 'Next scheduled service date' },
            { key: 'alert_insurance',  label: 'Insurance Expiry Alerts',   desc: 'Vehicle insurance policy expiry' },
            { key: 'alert_inspection', label: 'Inspection Due Alerts',     desc: 'Vehicle inspection due date' },
            { key: 'alert_license',    label: 'Driver License Alerts',     desc: "Driver's license expiry date" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <Toggle checked={bool(key)} onChange={v => set(key, v)} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Email (SMTP) ─────────────────────────────────────────────────────── */}
      <SectionCard title="Email (SMTP)" icon={Mail}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="SMTP Host"     value={str('mail_host')}     onChange={v => set('mail_host', v)}     placeholder="smtp.mailtrap.io" />
          <Field label="SMTP Port"     value={str('mail_port')}     onChange={v => set('mail_port', v)}     placeholder="2525" type="number" />
          <Field label="SMTP Username" value={str('mail_username')} onChange={v => set('mail_username', v)} placeholder="your_username" />
          <Field label="SMTP Password" value={str('mail_password')} onChange={v => set('mail_password', v)} placeholder="••••••••" type="password" />
          <div className="sm:col-span-2">
            <Field label="From Address" value={str('mail_from')} onChange={v => set('mail_from', v)} placeholder="noreply@josbin.sr" />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Use <a href="https://mailtrap.io" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Mailtrap</a> for testing, or your SMTP provider for production.
          </p>
          <button
            type="button"
            onClick={testEmail}
            disabled={testLoading === 'email'}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-60"
          >
            <Send size={13} />
            {testLoading === 'email' ? 'Sending…' : 'Send Test Email'}
          </button>
        </div>
      </SectionCard>

      {/* ── WhatsApp (Twilio) ────────────────────────────────────────────────── */}
      <SectionCard title="WhatsApp via Twilio" icon={MessageCircle}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Twilio Account SID" value={str('twilio_sid')} onChange={v => set('twilio_sid', v)} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <Field label="Twilio Auth Token"      value={str('twilio_token')} onChange={v => set('twilio_token', v)} placeholder="••••••••••••••••" type="password" />
          <Field label="Twilio WhatsApp Number" value={str('twilio_from')} onChange={v => set('twilio_from', v)} placeholder="+14155238886" />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <strong>Twilio Sandbox:</strong> The recipient must first send <code className="bg-amber-100 px-1 rounded">join &lt;sandbox-code&gt;</code> to <strong>+1 415 523 8886</strong> to opt in.
          For production, use an approved WhatsApp sender number.
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={testWhatsApp}
            disabled={testLoading === 'whatsapp'}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-60"
          >
            <Send size={13} />
            {testLoading === 'whatsapp' ? 'Sending…' : 'Send Test WhatsApp'}
          </button>
        </div>
      </SectionCard>

      {/* ── Security note ────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
        <Shield size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <span>
          Credentials are stored securely in the database and never exposed in the frontend after saving.
          Notifications run automatically every day at <strong>08:00</strong> via the Laravel scheduler.
          You can also trigger them manually: <code className="bg-slate-100 px-1 rounded text-slate-600">docker exec josbin_fleet_ms_backend php artisan fleet:notify</code>
        </span>
      </div>

      {/* Sticky save bar on scroll */}
      <div className="flex justify-end pb-4">
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          <Save size={15} />
          {saveMutation.isPending ? 'Saving…' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
