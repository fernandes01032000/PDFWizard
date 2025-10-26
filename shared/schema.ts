import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fieldTypes = [
  "text",
  "textarea",
  "checkbox",
  "radio",
  "dropdown",
  "date",
  "signature",
] as const;

export type FieldType = typeof fieldTypes[number];

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

export const insertFieldSchema = fieldSchema.omit({ id: true });
export type InsertField = z.infer<typeof insertFieldSchema>;

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

export const insertTemplateSchema = templateSchema.omit({ 
  id: true, 
  fields: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export const updateTemplateSchema = insertTemplateSchema.partial();
export type UpdateTemplate = z.infer<typeof updateTemplateSchema>;

export const formDataSchema = z.record(z.string(), z.any());
export type TemplateFormData = z.infer<typeof formDataSchema>;
