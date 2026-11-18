const $ = s => document.querySelector(s);
const KEY = 'markdown-notes';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

let notes = load();
let current = notes[0]?.id ?? null;
let filter = null;

const save = () => localStorage.setItem(KEY, JSON.stringify(notes));
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const titleOf = n => (n.body.split('\n').find(l => l.trim()) || '').replace(/^#+\s*/, '').trim() || 'Untitled';
const tagsOf = body => [...new Set(body.match(/#[\w-]+/g) || [])].map(t => t.slice(1));
const allTags = () => [...new Set(notes.flatMap(n => tagsOf(n.body)))];
const currentNote = () => notes.find(n => n.id === current);

function md(src) {
  const inline = s => s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  const out = [];
  let list = [];
  const flush = () => {
    if (list.length) out.push('<ul>' + list.map(li => '<li>' + inline(li) + '</li>').join('') + '</ul>');
    list = [];
  };

  for (const line of esc(src).split('\n')) {
    const h = line.match(/^(#{1,6}) (.+)$/);
    const li = line.match(/^[-*] (.+)$/);
    if (h) {
      flush();
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
    } else if (li) {
      list.push(li[1]);
    } else if (/^---+$/.test(line)) {
      flush();
      out.push('<hr>');
    } else if (/^&gt; /.test(line)) {
      flush();
      out.push('<blockquote>' + inline(line.slice(5)) + '</blockquote>');
    } else if (!line.trim()) {
      flush();
    } else {
      flush();
      out.push('<p>' + inline(line) + '</p>');
    }
  }
  flush();
  return out.join('');
}

function renderTags() {
  const tags = allTags();
  if (filter && !tags.includes(filter)) filter = null;
  $('#tags').innerHTML =
    `<button data-tag="" class="${filter === null ? 'on' : ''}">All</button>` +
    tags.map(t => `<button data-tag="${t}" class="${filter === t ? 'on' : ''}">#${t}</button>`).join('');
}

function renderList() {
  renderTags();
  const list = filter ? notes.filter(n => tagsOf(n.body).includes(filter)) : notes;
  $('#notes').innerHTML = list.map(n => `
    <button class="note ${n.id === current ? 'active' : ''}" data-id="${n.id}">
      <strong>${esc(titleOf(n))}</strong>
      <small>${tagsOf(n.body).map(t => '#' + t).join(' ') || 'no tags'}</small>
    </button>`).join('') || '<p class="empty">No notes</p>';
}

function renderEditor() {
  const note = currentNote();
  $('#editor').value = note ? note.body : '';
  $('#editor').disabled = !note;
  $('#preview').innerHTML = note && note.body.trim()
    ? md(note.body)
    : '<p class="empty">Nothing to preview yet.</p>';
}

function select(id) {
  current = id;
  renderList();
  renderEditor();
}

$('#new').onclick = () => {
  const note = { id: uid(), body: '' };
  notes.unshift(note);
  filter = null;
  save();
  select(note.id);
  $('#editor').focus();
};

$('#editor').oninput = e => {
  const note = currentNote();
  if (!note) return;
  note.body = e.target.value;
  save();
  $('#preview').innerHTML = note.body.trim() ? md(note.body) : '<p class="empty">Nothing to preview yet.</p>';
  renderList();
};

$('#notes').onclick = e => {
  const btn = e.target.closest('.note');
  if (btn) select(btn.dataset.id);
};

$('#tags').onclick = e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  filter = btn.dataset.tag || null;
  renderList();
};

$('#delete').onclick = () => {
  const note = currentNote();
  if (!note || !confirm('Delete this note?')) return;
  notes = notes.filter(n => n.id !== note.id);
  filter = null;
  save();
  select(notes[0]?.id ?? null);
};

$('#export').onclick = () => {
  const note = currentNote();
  if (!note) return;
  const url = URL.createObjectURL(new Blob([note.body], { type: 'text/markdown' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = (titleOf(note).replace(/[^\w\- ]+/g, '').trim() || 'note') + '.md';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

select(current);
