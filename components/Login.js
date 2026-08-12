'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [msg, setMsg] = useState({ text: '', kind: '' });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg({ text: '', kind: '' });
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg({ text: 'Account created. Check your email to confirm, then sign in. A team owner also needs to add your user id to team_members before you can see any data — see README.', kind: 'ok' });
      }
    } catch (err) {
      setMsg({ text: err.message || 'Something went wrong.', kind: 'err' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>Legacy Compliance</h1>
        <p className="sub">{mode === 'signin' ? 'Sign in to your dashboard.' : 'Create your account.'}</p>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
        <p className={`login-msg ${msg.kind}`}>{msg.text}</p>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: 6, fontSize: 12.5 }}
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg({ text: '', kind: '' }); }}
        >
          {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
