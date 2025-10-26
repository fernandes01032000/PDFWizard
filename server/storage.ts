import { Template, InsertTemplate, UpdateTemplate, Field, InsertField } from "@shared/schema";
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

export const storage = new MemStorage();
