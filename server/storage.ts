import { Template, InsertTemplate, UpdateTemplate, Field, InsertField, templates, fields } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { randomUUID } from "crypto";

export interface IStorage {
  // Template operations
  createTemplate(template: InsertTemplate): Promise<Template>;
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  updateTemplate(id: string, updates: UpdateTemplate): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;
  
  // Field operations
  addField(templateId: string, field: InsertField): Promise<Field | undefined>;
  updateField(templateId: string, fieldId: string, updates: Partial<Field>): Promise<Field | undefined>;
  deleteField(templateId: string, fieldId: string): Promise<boolean>;
  
  // PDF file storage
  storePDFFile(templateId: string, file: Buffer): Promise<void>;
  getPDFFile(templateId: string): Promise<Buffer | undefined>;
}

export class MemStorage implements IStorage {
  private templates: Map<string, Template>;
  private pdfFiles: Map<string, Buffer>;

  constructor() {
    this.templates = new Map();
    this.pdfFiles = new Map();
  }

  // Template operations
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const template: Template = {
      ...insertTemplate,
      id,
      fields: [],
      createdAt: now,
      updatedAt: now,
    };
    this.templates.set(id, template);
    return template;
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async updateTemplate(id: string, updates: UpdateTemplate): Promise<Template | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;

    const updated: Template = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.templates.set(id, updated);
    return updated;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.pdfFiles.delete(id);
    }
    return deleted;
  }

  // Field operations
  async addField(templateId: string, insertField: InsertField): Promise<Field | undefined> {
    const template = this.templates.get(templateId);
    if (!template) return undefined;

    const field: Field = {
      ...insertField,
      id: randomUUID(),
    };

    template.fields.push(field);
    template.updatedAt = new Date().toISOString();
    this.templates.set(templateId, template);
    
    return field;
  }

  async updateField(templateId: string, fieldId: string, updates: Partial<Field>): Promise<Field | undefined> {
    const template = this.templates.get(templateId);
    if (!template) return undefined;

    const fieldIndex = template.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return undefined;

    template.fields[fieldIndex] = { ...template.fields[fieldIndex], ...updates };
    template.updatedAt = new Date().toISOString();
    this.templates.set(templateId, template);

    return template.fields[fieldIndex];
  }

  async deleteField(templateId: string, fieldId: string): Promise<boolean> {
    const template = this.templates.get(templateId);
    if (!template) return false;

    const initialLength = template.fields.length;
    template.fields = template.fields.filter(f => f.id !== fieldId);
    
    if (template.fields.length < initialLength) {
      template.updatedAt = new Date().toISOString();
      this.templates.set(templateId, template);
      return true;
    }

    return false;
  }

  // PDF file storage
  async storePDFFile(templateId: string, file: Buffer): Promise<void> {
    this.pdfFiles.set(templateId, file);
  }

  async getPDFFile(templateId: string): Promise<Buffer | undefined> {
    return this.pdfFiles.get(templateId);
  }
}

export class DBStorage implements IStorage {
  private pdfFiles: Map<string, Buffer>;

  constructor() {
    this.pdfFiles = new Map();
  }

  // Template operations
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db.insert(templates).values(insertTemplate).returning();
    return {
      ...template,
      fields: [],
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    if (!template) return undefined;

    const templateFields = await db.select().from(fields).where(eq(fields.templateId, id));
    
    return {
      ...template,
      fields: templateFields.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type as any,
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        fontSize: f.fontSize,
        required: f.required,
        placeholder: f.placeholder || undefined,
        defaultValue: f.defaultValue || undefined,
        options: (f.options as string[]) || undefined,
        validation: (f.validation as any) || undefined,
      })),
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  async getAllTemplates(): Promise<Template[]> {
    const allTemplates = await db.select().from(templates).orderBy(desc(templates.updatedAt));
    
    const templatesWithFields = await Promise.all(
      allTemplates.map(async (template) => {
        const templateFields = await db.select().from(fields).where(eq(fields.templateId, template.id));
        return {
          ...template,
          fields: templateFields.map(f => ({
            id: f.id,
            name: f.name,
            type: f.type as any,
            x: f.x,
            y: f.y,
            width: f.width,
            height: f.height,
            fontSize: f.fontSize,
            required: f.required,
            placeholder: f.placeholder || undefined,
            defaultValue: f.defaultValue || undefined,
            options: (f.options as string[]) || undefined,
            validation: (f.validation as any) || undefined,
          })),
          createdAt: template.createdAt.toISOString(),
          updatedAt: template.updatedAt.toISOString(),
        };
      })
    );

    return templatesWithFields;
  }

  async updateTemplate(id: string, updates: UpdateTemplate): Promise<Template | undefined> {
    const [updated] = await db
      .update(templates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    
    if (!updated) return undefined;

    return this.getTemplate(id);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await db.delete(templates).where(eq(templates.id, id));
    this.pdfFiles.delete(id);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Field operations
  async addField(templateId: string, insertField: InsertField): Promise<Field | undefined> {
    const [field] = await db.insert(fields).values({
      ...insertField,
      templateId,
    }).returning();

    if (!field) return undefined;

    await db.update(templates).set({ updatedAt: new Date() }).where(eq(templates.id, templateId));

    return {
      id: field.id,
      name: field.name,
      type: field.type as any,
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height,
      fontSize: field.fontSize,
      required: field.required,
      placeholder: field.placeholder || undefined,
      defaultValue: field.defaultValue || undefined,
      options: (field.options as string[]) || undefined,
      validation: (field.validation as any) || undefined,
    };
  }

  async updateField(templateId: string, fieldId: string, updates: Partial<Field>): Promise<Field | undefined> {
    const [updated] = await db
      .update(fields)
      .set(updates)
      .where(and(eq(fields.id, fieldId), eq(fields.templateId, templateId)))
      .returning();

    if (!updated) return undefined;

    await db.update(templates).set({ updatedAt: new Date() }).where(eq(templates.id, templateId));

    return {
      id: updated.id,
      name: updated.name,
      type: updated.type as any,
      x: updated.x,
      y: updated.y,
      width: updated.width,
      height: updated.height,
      fontSize: updated.fontSize,
      required: updated.required,
      placeholder: updated.placeholder || undefined,
      defaultValue: updated.defaultValue || undefined,
      options: (updated.options as string[]) || undefined,
      validation: (updated.validation as any) || undefined,
    };
  }

  async deleteField(templateId: string, fieldId: string): Promise<boolean> {
    const result = await db.delete(fields).where(and(eq(fields.id, fieldId), eq(fields.templateId, templateId)));
    
    if (result.rowCount && result.rowCount > 0) {
      await db.update(templates).set({ updatedAt: new Date() }).where(eq(templates.id, templateId));
      return true;
    }

    return false;
  }

  // PDF file storage
  async storePDFFile(templateId: string, file: Buffer): Promise<void> {
    this.pdfFiles.set(templateId, file);
  }

  async getPDFFile(templateId: string): Promise<Buffer | undefined> {
    return this.pdfFiles.get(templateId);
  }
}

export const storage = new DBStorage();
