const SUBJECTS = [
  'History',
  'Geography',
  'Polity',
  'Economics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Environment & Ecology',
  'Art & Culture',
  'Sociology',
];

const CHAPTER_COUNTS = {
  History: 12,
  Geography: 12,
  Polity: 10,
  Economics: 8,
  Science: 12,
  Physics: 11,
  Chemistry: 10,
  Biology: 12,
  'Environment & Ecology': 9,
  'Art & Culture': 10,
  Sociology: 8,
};

function createChapters(subject, count) {
  return Array.from({ length: count }, (_, i) => ({
    name: `${subject} - Chapter ${i + 1}`,
    completed: false,
  }));
}

function buildData() {
  const classes = {};

  for (let classNum = 6; classNum <= 12; classNum++) {
    const subjects = {};

    for (const subject of SUBJECTS) {
      const chapterCount = CHAPTER_COUNTS[subject] || 12;
      subjects[subject] = {
        chapters: createChapters(subject, chapterCount),
      };
    }

    classes[String(classNum)] = { subjects };
  }

  return { classes };
}

module.exports = { buildData };
