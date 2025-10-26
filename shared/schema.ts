import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "nanoid";

export const fieldTypes = [
  "text",
  "textarea",
  "checkbox",
  "radio",
  "dropdown",
  "date",
  "signature",
  "image",
] as const;

export type FieldType = typeof fieldTypes[number];

// Drizzle ORM Table Definitions
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  pdfFileName: varchar("pdf_file_name", { length: 255 }).notNull(),
  pdfFileSize: integer("pdf_file_size").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const fields = pgTable("fields", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  templateId: varchar("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  fontSize: integer("font_size").notNull().default(12),
  required: boolean("required").notNull().default(false),
  placeholder: text("placeholder"),
  defaultValue: text("default_value"),
  options: jsonb("options").$type<string[]>(),
  validation: jsonb("validation").$type<{
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }>(),
});

export const fieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(fieldTypes),
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(10),
  height: z.number().min(10),
  fontSize: z.number().min(8).max(72).default(12),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation: z.object({
    pattern: z.string().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
});

export type Field = z.infer<typeof fieldSchema>;

// Drizzle insert schemas
export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export const insertFieldSchema = createInsertSchema(fields).omit({
  id: true,
  templateId: true,
});
export type InsertField = z.infer<typeof insertFieldSchema>;

// Template type with fields (for API responses)
export const templateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  pdfFileName: z.string(),
  pdfFileSize: z.number(),
  fields: z.array(fieldSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Template = z.infer<typeof templateSchema>;

export const updateTemplateSchema = insertTemplateSchema.partial();
export type UpdateTemplate = z.infer<typeof updateTemplateSchema>;

export const formDataSchema = z.record(z.string(), z.any());
export type TemplateFormData = z.infer<typeof formDataSchema>;
