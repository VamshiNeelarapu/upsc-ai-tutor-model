import mongoose, { Document, Model, Schema } from "mongoose";

export type RevisionStatus = "not_started" | "learning" | "needs_revision" | "revised";
export type ExamRelevance = "prelims" | "mains" | "csat" | "essay";

export interface ICoreConcept {
  heading: string;
  body: string;
}

export interface IMCQ {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  sourceStatus: "verified" | "unverified" | "generated";
}

export interface IMainsQuestion {
  question: string;
  directive?: string;
  answerFramework?: string[];
}

export interface IReference {
  title: string;
  url?: string;
  publisher?: string;
  verificationStatus: "verified" | "unverified";
}

export interface IStudyNoteContent {
  overview?: string;
  coreConcepts: ICoreConcept[];
  prelimsFacts: string[];
  mainsPoints: string[];
  revisionTips: string[];
  commonConfusions: string[];
  mcqs: IMCQ[];
  mainsQuestions: IMainsQuestion[];
  references: IReference[];
}

export interface IStudyNote extends Document {
  userId: string;
  title: string;
  subjectId?: string;
  sectionId?: string;
  topicId?: string;
  examRelevance: ExamRelevance[];
  content: IStudyNoteContent;
  revisionStatus: RevisionStatus;
  sourceConversationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CoreConceptSchema = new Schema<ICoreConcept>(
  {
    heading: { type: String, required: true },
    body: { type: String, required: true },
  },
  { _id: false }
);

const MCQSchema = new Schema<IMCQ>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctOptionIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
    sourceStatus: {
      type: String,
      enum: ["verified", "unverified", "generated"],
      default: "generated",
    },
  },
  { _id: false }
);

const MainsQuestionSchema = new Schema<IMainsQuestion>(
  {
    question: { type: String, required: true },
    directive: { type: String },
    answerFramework: { type: [String] },
  },
  { _id: false }
);

const ReferenceSchema = new Schema<IReference>(
  {
    title: { type: String, required: true },
    url: { type: String },
    publisher: { type: String },
    verificationStatus: {
      type: String,
      enum: ["verified", "unverified"],
      required: true,
    },
  },
  { _id: false }
);

const StudyNoteContentSchema = new Schema<IStudyNoteContent>(
  {
    overview: { type: String },
    coreConcepts: { type: [CoreConceptSchema], default: [] },
    prelimsFacts: { type: [String], default: [] },
    mainsPoints: { type: [String], default: [] },
    revisionTips: { type: [String], default: [] },
    commonConfusions: { type: [String], default: [] },
    mcqs: { type: [MCQSchema], default: [] },
    mainsQuestions: { type: [MainsQuestionSchema], default: [] },
    references: { type: [ReferenceSchema], default: [] },
  },
  { _id: false }
);

const StudyNoteSchema = new Schema<IStudyNote>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: String,
      ref: "SyllabusNode",
    },
    sectionId: {
      type: String,
      ref: "SyllabusNode",
    },
    topicId: {
      type: String,
      ref: "SyllabusNode",
    },
    examRelevance: {
      type: [String],
      enum: ["prelims", "mains", "csat", "essay"],
      default: ["prelims", "mains"],
    },
    content: {
      type: StudyNoteContentSchema,
      required: true,
    },
    revisionStatus: {
      type: String,
      enum: ["not_started", "learning", "needs_revision", "revised"],
      default: "not_started",
    },
    sourceConversationId: {
      type: String,
      ref: "Conversation",
    },
  },
  {
    timestamps: true,
  }
);

StudyNoteSchema.index({ userId: 1 });
StudyNoteSchema.index({ userId: 1, subjectId: 1 });
StudyNoteSchema.index({ userId: 1, revisionStatus: 1 });
StudyNoteSchema.index({ title: "text", "content.overview": "text" });

const StudyNote: Model<IStudyNote> =
  mongoose.models.StudyNote ||
  mongoose.model<IStudyNote>("StudyNote", StudyNoteSchema);

export default StudyNote;
