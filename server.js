const express = require('express');
const path = require('path');
const os = require('os');
const { readData, writeData } = require('./lib/store');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function calcProgress(chapters) {
  if (!chapters || chapters.length === 0) return 0;
  const done = chapters.filter((c) => c.completed).length;
  return Math.round((done / chapters.length) * 100);
}

function enrichClass(classData) {
  const subjects = {};
  let totalChapters = 0;
  let completedChapters = 0;

  for (const [name, subject] of Object.entries(classData.subjects)) {
    const progress = calcProgress(subject.chapters);
    subjects[name] = { ...subject, progress };
    totalChapters += subject.chapters.length;
    completedChapters += subject.chapters.filter((c) => c.completed).length;
  }

  return {
    subjects,
    progress: totalChapters === 0 ? 0 : Math.round((completedChapters / totalChapters) * 100),
  };
}

app.get('/api/progress', async (_req, res) => {
  try {
    const data = await readData();
    const result = { classes: {} };

    for (const [classId, classData] of Object.entries(data.classes)) {
      result.classes[classId] = enrichClass(classData);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

app.get('/api/classes/:classId', async (req, res) => {
  try {
    const data = await readData();
    const classData = data.classes[req.params.classId];

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(enrichClass(classData));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load class' });
  }
});

app.get('/api/classes/:classId/subjects/:subjectName', async (req, res) => {
  try {
    const data = await readData();
    const classData = data.classes[req.params.classId];

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const subject = classData.subjects[req.params.subjectName];
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({
      ...subject,
      progress: calcProgress(subject.chapters),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load subject' });
  }
});

app.patch('/api/classes/:classId/subjects/:subjectName/chapters/:index', async (req, res) => {
  try {
    const data = await readData();
    const classData = data.classes[req.params.classId];

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const subject = classData.subjects[req.params.subjectName];
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const index = parseInt(req.params.index, 10);
    if (index < 0 || index >= subject.chapters.length) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    if (typeof req.body.completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }

    subject.chapters[index].completed = req.body.completed;
    await writeData(data);

    res.json({
      chapter: subject.chapters[index],
      progress: calcProgress(subject.chapters),
      classProgress: enrichClass(classData).progress,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

function getLocalIp() {
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

app.listen(PORT, HOST, () => {
  console.log(`UPSC Tracker running at http://localhost:${PORT}`);
  const ip = getLocalIp();
  if (ip) {
    console.log(`On your phone (same Wi-Fi): http://${ip}:${PORT}`);
  }
  if (process.env.MONGODB_URI) {
    console.log('Using MongoDB for persistent storage');
  }
});
