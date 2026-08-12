'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { isoKey, SERVICES } from '@/lib/complianceLogic';
import * as store from '@/lib/dataStore';
import Login from './Login';
import Sidebar from './Sidebar';
import Overview from './Overview';
import CategoryPage from './CategoryPage';
import SetupPage from './SetupPage';
import ServicePage from './ServicePage';
import CompanyPage from './CompanyPage';
import OtherTasksPage from './OtherTasksPage';
import ClientModal from './ClientModal';
import BackupModal from './BackupModal';

const EMPTY_STATE = { clients: [], setupStatus: {}, recurStatus: {}, hidden: {}, customTasks: {} };

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = signed out
  const [isTeamMember, setIsTeamMember] = useState(null);
  const [state, setState] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [currentView, setCurrentView] = useState('overview');
  const [modalClient, setModalClient] = useState(undefined); // undefined = closed, null = "add new"
  const [showBackup, setShowBackup] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await store.loadAll();
      setState(data);
      setIsTeamMember(true);
    } catch (err) {
      // Most likely cause: RLS blocked reads because this user isn't in team_members yet.
      setIsTeamMember(false);
      setLoadError(err.message || 'Could not load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (session) refresh(); }, [session, refresh]);

  if (session === undefined) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!session) return <Login />;

  if (isTeamMember === false) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>Almost there</h1>
          <p className="sub">You&rsquo;re signed in, but your account hasn&rsquo;t been added as a team member yet — that&rsquo;s a one-time step in Supabase. See README.md &ldquo;Adding a team member&rdquo;, or ask whoever set this up to add you.</p>
          <p className="login-msg err">{loadError}</p>
          <button className="btn btn-primary" onClick={refresh}>Try again</button>
          <button className="signout-btn" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>
    );
  }

  async function onToggleRecur(client, item) {
    const due = item.due(client);
    const curKey = due ? isoKey(due) : null;
    const bucket = (state.recurStatus[client.id] || {})[item.key] || {};
    const nowDone = bucket.doneKey === curKey;
    const patch = nowDone
      ? { doneKey: null, date: null }
      : { doneKey: curKey, date: new Date().toISOString().slice(0, 10), expiresOn: bucket.expiresOn || '' };
    // optimistic update
    setState((s) => ({ ...s, recurStatus: { ...s.recurStatus, [client.id]: { ...(s.recurStatus[client.id] || {}), [item.key]: patch } } }));
    try { await store.setRecurItem(client.id, item.key, patch); } catch (e) { console.error(e); refresh(); }
  }

  async function onSetExpiry(clientId, itemKey, expiresOn) {
    const bucket = (state.recurStatus[clientId] || {})[itemKey] || {};
    const patch = { ...bucket, expiresOn };
    setState((s) => ({ ...s, recurStatus: { ...s.recurStatus, [clientId]: { ...(s.recurStatus[clientId] || {}), [itemKey]: patch } } }));
    try { await store.setRecurItem(clientId, itemKey, patch); } catch (e) { console.error(e); refresh(); }
  }

  async function onToggleSetupDone(clientId, itemKey) {
    const bucket = (state.setupStatus[clientId] || {})[itemKey] || {};
    const patch = bucket.done ? { done: false, na: false, date: null } : { done: true, na: false, date: new Date().toISOString().slice(0, 10) };
    setState((s) => ({ ...s, setupStatus: { ...s.setupStatus, [clientId]: { ...(s.setupStatus[clientId] || {}), [itemKey]: patch } } }));
    try { await store.setSetupItem(clientId, itemKey, patch); } catch (e) { console.error(e); refresh(); }
  }
  async function onToggleSetupNA(clientId, itemKey) {
    const bucket = (state.setupStatus[clientId] || {})[itemKey] || {};
    const patch = bucket.na ? { done: false, na: false, date: null } : { done: false, na: true, date: bucket.date || null };
    setState((s) => ({ ...s, setupStatus: { ...s.setupStatus, [clientId]: { ...(s.setupStatus[clientId] || {}), [itemKey]: patch } } }));
    try { await store.setSetupItem(clientId, itemKey, patch); } catch (e) { console.error(e); refresh(); }
  }

  async function onHide(clientId, itemKey) {
    setState((s) => ({ ...s, hidden: { ...s.hidden, [clientId]: [...(s.hidden[clientId] || []), itemKey] } }));
    try { await store.hideItemRow(clientId, itemKey); } catch (e) { console.error(e); refresh(); }
  }
  async function onUnhide(clientId, itemKey) {
    setState((s) => ({ ...s, hidden: { ...s.hidden, [clientId]: (s.hidden[clientId] || []).filter((k) => k !== itemKey) } }));
    try { await store.unhideItemRow(clientId, itemKey); } catch (e) { console.error(e); refresh(); }
  }

  async function onAddTask(clientId, task) {
    try {
      const id = await store.addCustomTaskRow(clientId, task);
      setState((s) => ({ ...s, customTasks: { ...s.customTasks, [clientId]: [...(s.customTasks[clientId] || []), { id, ...task, status: 'Not Started' }] } }));
    } catch (e) { alert('Could not add task: ' + e.message); }
  }
  async function onToggleTask(clientId, task) {
    const newStatus = task.status === 'Complete' ? 'Not Started' : 'Complete';
    setState((s) => ({
      ...s,
      customTasks: { ...s.customTasks, [clientId]: (s.customTasks[clientId] || []).map((t) => t.id === task.id ? { ...t, status: newStatus } : t) },
    }));
    try { await store.updateCustomTaskRow(task.id, { status: newStatus }); } catch (e) { console.error(e); refresh(); }
  }
  async function onDeleteTask(clientId, taskId) {
    setState((s) => ({ ...s, customTasks: { ...s.customTasks, [clientId]: (s.customTasks[clientId] || []).filter((t) => t.id !== taskId) } }));
    try { await store.deleteCustomTaskRow(taskId); } catch (e) { console.error(e); refresh(); }
  }

  async function onSaveClient(form) {
    try {
      const newId = await store.saveClient(form);
      await refresh();
      setModalClient(undefined);
      if (!form.id) setCurrentView(newId);
    } catch (e) { alert('Could not save: ' + e.message); }
  }
  async function onDeleteClient(id) {
    const c = state.clients.find((c) => c.id === id);
    if (!confirm(`Remove ${c ? c.name : 'this company'} and all its tracked compliance data? This can\u2019t be undone.`)) return;
    try {
      await store.deleteClientRow(id);
      await refresh();
      setModalClient(undefined);
      setCurrentView('overview');
    } catch (e) { alert('Could not delete: ' + e.message); }
  }
  async function onRestore(backup) {
    try {
      await store.bulkRestore(backup);
      await refresh();
      setCurrentView('overview');
      setShowBackup(false);
    } catch (e) { alert('Restore failed: ' + e.message); }
  }

  const catViews = { monthly: 1, quarterly: 1, yearly: 1 };
  const svcViews = { trucking: 1, bookkeeping: 1, payroll: 1, excise: 1, immigration: 1 };
  const client = state.clients.find((c) => c.id === currentView);
  let body;
  if (loading) body = <div style={{ padding: 20, color: 'var(--muted)' }}>Loading your data…</div>;
  else if (currentView === 'overview') body = <Overview state={state} onToggleRecur={onToggleRecur} onToggleTask={onToggleTask} onSetExpiry={onSetExpiry} goToClient={setCurrentView} />;
  else if (currentView === 'setup') body = <SetupPage state={state} onToggleDone={onToggleSetupDone} onToggleNA={onToggleSetupNA} />;
  else if (currentView === 'other') body = <OtherTasksPage state={state} onAdd={onAddTask} onToggle={onToggleTask} onDelete={onDeleteTask} />;
  else if (catViews[currentView]) body = <CategoryPage freq={currentView} state={state} onToggleRecur={onToggleRecur} onSetExpiry={onSetExpiry} />;
  else if (svcViews[currentView]) {
    const svc = SERVICES.find((s) => s.key === currentView);
    body = <ServicePage service={currentView} serviceLabel={svc ? svc.label : currentView} state={state}
      onToggleRecur={onToggleRecur} onToggleSetupDone={onToggleSetupDone} onToggleSetupNA={onToggleSetupNA} onSetExpiry={onSetExpiry} />;
  }
  else if (client) {
    body = (
      <CompanyPage client={client} state={state} onEdit={() => setModalClient(client)}
        onToggleRecur={onToggleRecur} onToggleSetupDone={onToggleSetupDone} onToggleSetupNA={onToggleSetupNA}
        onHide={onHide} onUnhide={onUnhide} onAddTask={onAddTask} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} onSetExpiry={onSetExpiry} />
    );
  } else { body = <Overview state={state} onToggleRecur={onToggleRecur} onToggleTask={onToggleTask} onSetExpiry={onSetExpiry} goToClient={setCurrentView} />; }

  return (
    <div className="app">
      <Sidebar state={state} currentView={currentView} setCurrentView={setCurrentView}
        onAddCompany={() => setModalClient(null)} onBackup={() => setShowBackup(true)}
        onSignOut={() => supabase.auth.signOut()} />
      <div className="main">{body}</div>
      {modalClient !== undefined && (
        <ClientModal client={modalClient} onSave={onSaveClient} onDelete={onDeleteClient} onClose={() => setModalClient(undefined)} />
      )}
      {showBackup && <BackupModal state={state} onRestore={onRestore} onClose={() => setShowBackup(false)} />}
    </div>
  );
}
