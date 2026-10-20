let appData = null;
let currentView = { type: 'home' };

const main = document.getElementById('main');
const breadcrumb = document.getElementById('breadcrumb');
const loading = document.getElementById('loading');

async function fetchProgress() {
  const res = await fetch('/api/progress');
  appData = await res.json();
  return appData;
}

function progressClass(pct) {
  if (pct >= 75) return 'high';
  if (pct >= 25) return 'mid';
  return 'low';
}

function renderProgressBadge(pct) {
  return `<span class="card-progress ${progressClass(pct)}">${pct}%</span>`;
}

function updateBreadcrumb() {
  const parts = [{ label: 'Home', view: { type: 'home' } }];

  if (currentView.type === 'class' || currentView.type === 'subject') {
    parts.push({ label: `Class ${currentView.classId}`, view: { type: 'class', classId: currentView.classId } });
  }

  if (currentView.type === 'subject') {
    parts.push({ label: currentView.subjectName, view: currentView });
  }

  breadcrumb.innerHTML = parts
    .map((part, i) => {
      const isLast = i === parts.length - 1;
      const sep = i > 0 ? '<span class="breadcrumb-sep">/</span>' : '';
      const cls = isLast ? 'breadcrumb-item active' : 'breadcrumb-item';
      const data = JSON.stringify(part.view).replace(/"/g, '&quot;');
      return `${sep}<button class="${cls}" data-view="${data}">${part.label}</button>`;
    })
    .join('');

  breadcrumb.querySelectorAll('.breadcrumb-item').forEach((btn) => {
    if (!btn.classList.contains('active')) {
      btn.addEventListener('click', () => {
        const view = JSON.parse(btn.dataset.view);
        navigate(view);
      });
    }
  });
}

function navigate(view) {
  currentView = view;
  updateBreadcrumb();

  if (view.type === 'home') renderHome();
  else if (view.type === 'class') renderClass(view.classId);
  else if (view.type === 'subject') renderSubject(view.classId, view.subjectName);
}

function renderHome() {
  const classes = Object.entries(appData.classes).sort(([a], [b]) => Number(a) - Number(b));

  main.innerHTML = `
    <h2 class="page-title">Select a Class</h2>
    <div class="grid">
      ${classes
        .map(
          ([id, data]) => `
        <div class="card" data-class="${id}">
          <div>
            <div class="card-title">Class ${id}</div>
            <div class="card-subtitle">${Object.keys(data.subjects).length} subjects</div>
          </div>
          ${renderProgressBadge(data.progress)}
        </div>`
        )
        .join('')}
    </div>`;

  main.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      navigate({ type: 'class', classId: card.dataset.class });
    });
  });
}

function renderClass(classId) {
  const classData = appData.classes[classId];
  const subjects = Object.entries(classData.subjects).sort(([a], [b]) => a.localeCompare(b));

  main.innerHTML = `
    <h2 class="page-title">Class ${classId} — Subjects</h2>
    <div class="grid">
      ${subjects
        .map(
          ([name, data]) => `
        <div class="card" data-subject="${name}">
          <div>
            <div class="card-title">${name}</div>
            <div class="card-subtitle">${data.chapters.length} chapters</div>
          </div>
          ${renderProgressBadge(data.progress)}
        </div>`
        )
        .join('')}
    </div>`;

  main.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      navigate({ type: 'subject', classId, subjectName: card.dataset.subject });
    });
  });
}

function renderSubject(classId, subjectName) {
  const subject = appData.classes[classId].subjects[subjectName];

  main.innerHTML = `
    <div class="subject-header">
      <h2 class="page-title" style="margin:0">${subjectName}</h2>
      <span class="subject-progress-badge ${subject.progress === 100 ? 'complete' : ''}">${subject.progress}% complete</span>
    </div>
    <div class="chapter-list" id="chapter-list">
      ${subject.chapters
        .map(
          (ch, i) => `
        <label class="chapter-item ${ch.completed ? 'completed' : ''}" data-index="${i}">
          <input type="checkbox" class="chapter-checkbox" ${ch.completed ? 'checked' : ''} data-index="${i}">
          <span class="chapter-name">${ch.name}</span>
        </label>`
        )
        .join('')}
    </div>`;

  main.querySelectorAll('.chapter-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', async (e) => {
      e.stopPropagation();
      const index = parseInt(checkbox.dataset.index, 10);
      await toggleChapter(classId, subjectName, index, checkbox.checked);
    });
  });
}

async function toggleChapter(classId, subjectName, index, completed) {
  const res = await fetch(
    `/api/classes/${encodeURIComponent(classId)}/subjects/${encodeURIComponent(subjectName)}/chapters/${index}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    }
  );

  if (!res.ok) return;

  const result = await res.json();

  appData.classes[classId].subjects[subjectName].chapters[index].completed = completed;
  appData.classes[classId].subjects[subjectName].progress = result.progress;

  const classSubjects = appData.classes[classId].subjects;
  let total = 0;
  let done = 0;
  for (const sub of Object.values(classSubjects)) {
    total += sub.chapters.length;
    done += sub.chapters.filter((c) => c.completed).length;
  }
  appData.classes[classId].progress = total === 0 ? 0 : Math.round((done / total) * 100);

  const item = main.querySelector(`.chapter-item[data-index="${index}"]`);
  if (item) {
    item.classList.toggle('completed', completed);
  }

  const badge = main.querySelector('.subject-progress-badge');
  if (badge) {
    badge.textContent = `${result.progress}% complete`;
    badge.classList.toggle('complete', result.progress === 100);
  }
}

async function init() {
  try {
    await fetchProgress();
    loading.style.display = 'none';
    navigate({ type: 'home' });
  } catch {
    main.innerHTML = '<p class="loading">Failed to load data. Make sure the server is running.</p>';
  }
}

init();
