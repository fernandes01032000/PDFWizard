import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { 
  insertTemplateSchema, 
  updateTemplateSchema, 
  insertFieldSchema,
  fieldSchema,
  formDataSchema,
  type Field,
  type TemplateFormData,
} from "@shared/schema";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Configure multer for image uploads
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload image
  app.post("/api/upload-image", imageUpload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Convert image to base64 data URL
      const base64 = req.file.buffer.toString("base64");
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

      res.json({ 
        url: dataUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
    } catch (error) {
      console.error("Upload image error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Upload PDF and create template
  app.post("/api/upload-pdf", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file provided" });
      }

      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Template name is required" });
      }

      // Create template
      const template = await storage.createTemplate({
        name,
        description,
        pdfFileName: req.file.originalname,
        pdfFileSize: req.file.size,
      });

      // Store PDF file
      await storage.storePDFFile(template.id, req.file.buffer);

      res.json(template);
    } catch (error) {
      console.error("Upload PDF error:", error);
      res.status(500).json({ error: "Failed to upload PDF" });
    }
  });

  // Create template (without PDF upload)
  app.post("/api/templates", async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.json(template);
    } catch (error) {
      console.error("Create template error:", error);
      res.status(400).json({ error: "Invalid template data" });
    }
  });

  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Get templates error:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Get single template
  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Get template error:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  // Update template
  app.put("/api/templates/:id", async (req, res) => {
    try {
      const validatedData = updateTemplateSchema.parse(req.body);
      const template = await storage.updateTemplate(req.params.id, validatedData);
      
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Update template error:", error);
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  // Delete template
  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTemplate(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete template error:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // Duplicate template
  app.post("/api/templates/:id/duplicate", async (req, res) => {
    try {
      const original = await storage.getTemplate(req.params.id);
      
      if (!original) {
        return res.status(404).json({ error: "Template not found" });
      }

      const duplicated = await storage.duplicateTemplate(req.params.id);
      
      if (!duplicated) {
        return res.status(500).json({ error: "Failed to duplicate template" });
      }
      
      res.json(duplicated);
    } catch (error) {
      console.error("Duplicate template error:", error);
      res.status(500).json({ error: "Failed to duplicate template" });
    }
  });

  // Add field to template
  app.post("/api/templates/:id/fields", async (req, res) => {
    try {
      const validatedData = insertFieldSchema.parse(req.body);
      const field = await storage.addField(req.params.id, validatedData);
      
      if (!field) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      res.json(field);
    } catch (error) {
      console.error("Add field error:", error);
      res.status(400).json({ error: "Invalid field data" });
    }
  });

  // Update field
  app.put("/api/templates/:id/fields/:fieldId", async (req, res) => {
    try {
      const updates = fieldSchema.partial().parse(req.body);
      const field = await storage.updateField(req.params.id, req.params.fieldId, updates);
      
      if (!field) {
        return res.status(404).json({ error: "Template or field not found" });
      }
      
      res.json(field);
    } catch (error) {
      console.error("Update field error:", error);
      res.status(400).json({ error: "Invalid field data" });
    }
  });

  // Delete field
  app.delete("/api/templates/:id/fields/:fieldId", async (req, res) => {
    try {
      const deleted = await storage.deleteField(req.params.id, req.params.fieldId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Template or field not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete field error:", error);
      res.status(500).json({ error: "Failed to delete field" });
    }
  });

  // Generate filled PDF
  app.post("/api/generate-pdf", async (req, res) => {
    try {
      const { templateId, formData } = req.body;
      
      if (!templateId) {
        return res.status(400).json({ error: "Template ID is required" });
      }

      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const pdfBuffer = await storage.getPDFFile(templateId);
      if (!pdfBuffer) {
        return res.status(404).json({ error: "PDF file not found" });
      }

      // Validate form data
      const validatedFormData = formDataSchema.parse(formData || {});

      // Load the PDF
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();

      // Load font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Draw fields on PDF
      for (const field of template.fields) {
        const value = validatedFormData[field.id];
        if (!value) continue;

        // Convert coordinates (PDF coordinate system has origin at bottom-left)
        const pdfY = height - field.y - field.height;

        switch (field.type) {
          case "text":
          case "textarea":
          case "date":
            firstPage.drawText(String(value), {
              x: field.x,
              y: pdfY + field.height / 2 - field.fontSize / 2,
              size: field.fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
            break;

          case "checkbox":
            if (value === true || value === "true") {
              firstPage.drawText("✓", {
                x: field.x,
                y: pdfY,
                size: field.fontSize * 1.5,
                font: font,
                color: rgb(0, 0, 0),
              });
            }
            break;

          default:
            // For other field types, just draw the text value
            firstPage.drawText(String(value), {
              x: field.x,
              y: pdfY + field.height / 2 - field.fontSize / 2,
              size: field.fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
        }
      }

      // Save the PDF
      const filledPdfBytes = await pdfDoc.save();

      // Send the PDF as download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="filled_${template.pdfFileName}"`
      );
      res.send(Buffer.from(filledPdfBytes));
    } catch (error) {
      console.error("Generate PDF error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Get PDF file
  app.get("/api/templates/:id/pdf", async (req, res) => {
    try {
      const pdfBuffer = await storage.getPDFFile(req.params.id);
      
      if (!pdfBuffer) {
        return res.status(404).json({ error: "PDF file not found" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Get PDF error:", error);
      res.status(500).json({ error: "Failed to fetch PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
