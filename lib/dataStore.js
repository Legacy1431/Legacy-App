import { supabase } from './supabaseClient';

// ---------- clients: DB row (snake_case) <-> app object (camelCase) ----------
function clientFromRow(r) {
  return {
    id: r.id, name: r.name, type: r.type, entityType: r.entity_type || '',
    usdot: r.usdot || '', mc: r.mc || '', ein: r.ein || '', ubi: r.ubi || '',
    ifta: r.ifta || '', oregon: r.oregon || '',
    formed: r.formed || '', irp: r.irp || '', ins: r.ins || '',
    units: r.units || '', drivers: r.drivers || '',
    contact: r.contact || '', phone: r.phone || '', email: r.email || '',
    insCarrier: r.ins_carrier || '', consortium: r.consortium || '', eld: r.eld || '',
    notes: r.notes || '',
    services: Array.isArray(r.services) ? r.services : ['trucking'],
    exciseFrequency: r.excise_frequency || 'quarterly',
  };
}
function clientToRow(c) {
  return {
    name: c.name, type: c.type, entity_type: c.entityType || '',
    usdot: c.usdot || '', mc: c.mc || '', ein: c.ein || '', ubi: c.ubi || '',
    ifta: c.ifta || '', oregon: c.oregon || '',
    formed: c.formed || null, irp: c.irp || null, ins: c.ins || null,
    units: c.units || '', drivers: c.drivers || '',
    contact: c.contact || '', phone: c.phone || '', email: c.email || '',
    ins_carrier: c.insCarrier || '', consortium: c.consortium || '', eld: c.eld || '',
    notes: c.notes || '',
    services: Array.isArray(c.services) ? c.services : [],
    excise_frequency: c.exciseFrequency || 'quarterly',
  };
}

// Loads everything and reshapes it into the same nested-state shape the UI expects:
//   { clients: [...], setupStatus: {clientId:{itemKey:{done,na,date}}},
//     recurStatus: {clientId:{itemKey:{doneKey,date}}}, hidden: {clientId:[itemKey,...]} }
export async function loadAll() {
  const [{ data: clientRows, error: e1 }, { data: setupRows, error: e2 },
    { data: recurRows, error: e3 }, { data: hiddenRows, error: e4 },
    { data: taskRows, error: e5 }] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: true }),
      supabase.from('setup_status').select('*'),
      supabase.from('recur_status').select('*'),
      supabase.from('hidden_items').select('*'),
      supabase.from('custom_tasks').select('*').order('created_at', { ascending: true }),
    ]);
  if (e1 || e2 || e3 || e4 || e5) throw (e1 || e2 || e3 || e4 || e5);

  const setupStatus = {};
  (setupRows || []).forEach((r) => {
    if (!setupStatus[r.client_id]) setupStatus[r.client_id] = {};
    setupStatus[r.client_id][r.item_key] = { done: r.done, na: r.na, date: r.completed_at };
  });
  const recurStatus = {};
  (recurRows || []).forEach((r) => {
    if (!recurStatus[r.client_id]) recurStatus[r.client_id] = {};
    recurStatus[r.client_id][r.item_key] = { doneKey: r.done_period, date: r.completed_at, expiresOn: r.expires_on || '' };
  });
  const hidden = {};
  (hiddenRows || []).forEach((r) => {
    if (!hidden[r.client_id]) hidden[r.client_id] = [];
    hidden[r.client_id].push(r.item_key);
  });
  const customTasks = {};
  (taskRows || []).forEach((r) => {
    if (!customTasks[r.client_id]) customTasks[r.client_id] = [];
    customTasks[r.client_id].push({ id: r.id, label: r.label, due: r.due || '', status: r.status || 'Not Started', notes: r.notes || '' });
  });

  return {
    clients: (clientRows || []).map(clientFromRow),
    setupStatus, recurStatus, hidden, customTasks,
  };
}

export async function saveClient(client) {
  const row = clientToRow(client);
  if (client.id) {
    const { error } = await supabase.from('clients').update(row).eq('id', client.id);
    if (error) throw error;
    return client.id;
  } else {
    const { data, error } = await supabase.from('clients').insert(row).select('id').single();
    if (error) throw error;
    return data.id;
  }
}

export async function deleteClientRow(clientId) {
  const { error } = await supabase.from('clients').delete().eq('id', clientId);
  if (error) throw error;
}

export async function setSetupItem(clientId, itemKey, patch) {
  const { error } = await supabase.from('setup_status').upsert({
    client_id: clientId, item_key: itemKey,
    done: !!patch.done, na: !!patch.na,
    completed_at: patch.date || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function setRecurItem(clientId, itemKey, patch) {
  const row = {
    client_id: clientId, item_key: itemKey,
    done_period: patch.doneKey || null,
    completed_at: patch.date || null,
    updated_at: new Date().toISOString(),
  };
  if ('expiresOn' in patch) row.expires_on = patch.expiresOn || null;
  const { error } = await supabase.from('recur_status').upsert(row);
  if (error) throw error;
}

export async function hideItemRow(clientId, itemKey) {
  const { error } = await supabase.from('hidden_items').upsert({ client_id: clientId, item_key: itemKey });
  if (error) throw error;
}
export async function unhideItemRow(clientId, itemKey) {
  const { error } = await supabase.from('hidden_items').delete().eq('client_id', clientId).eq('item_key', itemKey);
  if (error) throw error;
}

export async function addCustomTaskRow(clientId, task) {
  const { data, error } = await supabase.from('custom_tasks').insert({
    client_id: clientId, label: task.label, due: task.due || null, status: task.status || 'Not Started', notes: task.notes || '',
  }).select('id').single();
  if (error) throw error;
  return data.id;
}
export async function updateCustomTaskRow(taskId, patch) {
  const row = {};
  if ('label' in patch) row.label = patch.label;
  if ('due' in patch) row.due = patch.due || null;
  if ('status' in patch) row.status = patch.status;
  if ('notes' in patch) row.notes = patch.notes;
  const { error } = await supabase.from('custom_tasks').update(row).eq('id', taskId);
  if (error) throw error;
}
export async function deleteCustomTaskRow(taskId) {
  const { error } = await supabase.from('custom_tasks').delete().eq('id', taskId);
  if (error) throw error;
}

// Replaces everything in the database with the contents of a backup export.
// Client ids in the backup won't match Supabase's ids, so we insert fresh
// clients and remap old-id -> new-id for the status tables.
export async function bulkRestore(backup) {
  const { data: existing } = await supabase.from('clients').select('id');
  if (existing && existing.length) {
    await supabase.from('clients').delete().in('id', existing.map((r) => r.id));
  }
  const idMap = {};
  for (const c of backup.clients || []) {
    const newId = await saveClient({ ...c, id: undefined });
    idMap[c.id] = newId;
  }
  const setupRows = [];
  Object.entries(backup.setupStatus || {}).forEach(([oldId, items]) => {
    const newId = idMap[oldId]; if (!newId) return;
    Object.entries(items).forEach(([itemKey, v]) => {
      setupRows.push({ client_id: newId, item_key: itemKey, done: !!v.done, na: !!v.na, completed_at: v.date || null });
    });
  });
  if (setupRows.length) await supabase.from('setup_status').upsert(setupRows);

  const recurRows = [];
  Object.entries(backup.recurStatus || {}).forEach(([oldId, items]) => {
    const newId = idMap[oldId]; if (!newId) return;
    Object.entries(items).forEach(([itemKey, v]) => {
      recurRows.push({ client_id: newId, item_key: itemKey, done_period: v.doneKey || null, completed_at: v.date || null, expires_on: v.expiresOn || null });
    });
  });
  if (recurRows.length) await supabase.from('recur_status').upsert(recurRows);

  const hiddenRows = [];
  Object.entries(backup.hidden || {}).forEach(([oldId, keys]) => {
    const newId = idMap[oldId]; if (!newId) return;
    (keys || []).forEach((k) => hiddenRows.push({ client_id: newId, item_key: k }));
  });
  if (hiddenRows.length) await supabase.from('hidden_items').upsert(hiddenRows);

  const taskRows = [];
  Object.entries(backup.customTasks || {}).forEach(([oldId, tasks]) => {
    const newId = idMap[oldId]; if (!newId) return;
    (tasks || []).forEach((t) => taskRows.push({ client_id: newId, label: t.label, due: t.due || null, status: t.status || 'Not Started', notes: t.notes || '' }));
  });
  if (taskRows.length) await supabase.from('custom_tasks').insert(taskRows);
}
