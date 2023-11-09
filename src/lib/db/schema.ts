import {
  integer,
  pgEnum,
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userAssistantEnum = pgEnum("user_assistant_enum", [
  "assistant",
  "user",
]);

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  // pdfName: text("pdf_name").notNull(),
  paperId: integer("paper_id")
    .references(() => papers.id)
    .notNull(),
  // paperTitle: text("paper_title").notNull(),
  // pdfUrl: text("pdf_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  // fileKey: text("file_key").notNull(),
});

export const papers = pgTable("papers", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id", { length: 256 }).notNull(),
  userName: varchar("user_name", { length: 256 }).notNull(),
  paperTitle: text("paper_title").notNull(),
  abstract: text("abstract").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  pdfUrl: text("pdf_url").notNull(),
  fileKey: text("file_key").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .references(() => chats.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: userAssistantEnum("role").notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id")
    .references(() => messages.id)
    .notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id"),
  feedbackMessageId: integer("feedback_message_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userName: varchar("user_name", { length: 256 }).notNull(),
});

export type DrizzleChat = typeof chats.$inferSelect;
export type DrizzleMessage = typeof messages.$inferSelect;
export type DrizzlePaper = typeof papers.$inferSelect;
export type DrizzleComment = typeof comments.$inferSelect;
export type DrizzleResponse = typeof responses.$inferSelect;

// drizzle-orm
// drizzle-kit
