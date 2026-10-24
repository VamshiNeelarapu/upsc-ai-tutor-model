export const SAMPLE_PROMPTS = [
  "Teach me the Indus Valley Civilization for UPSC",
  "Explain the Indian Constitution's fundamental rights",
  "What is monetary policy and RBI's role?",
  "Explain biodiversity hotspots in India",
];

export function topicStudyPrompt(topicName: string, chapterName?: string, subjectName?: string): string {
  const where = [chapterName && `chapter: ${chapterName}`, subjectName && `subject: ${subjectName}`]
    .filter(Boolean)
    .join(", ");
  return `I want to study "${topicName}"${where ? ` (${where})` : ""} for UPSC. Explain it in detail covering key facts, historical significance, Prelims points and Mains analytical dimensions.`;
}
