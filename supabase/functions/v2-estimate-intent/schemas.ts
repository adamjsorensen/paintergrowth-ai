
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

// Schema definitions
export const UpsellItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  selected: z.boolean().default(false)
});

export const ColorApprovalSchema = z.object({
  room: z.string(),
  colorName: z.string(),
  approved: z.boolean().default(false),
  signatureRequired: z.boolean().default(true)
});

export const PDFContentSchema = z.object({
  coverPage: z.object({
    title: z.string(),
    clientName: z.string(),
    projectAddress: z.string(),
    estimateDate: z.string(),
    estimateNumber: z.string(),
    validUntil: z.string()
  }),
  introductionLetter: z.object({
    greeting: z.string(),
    projectOverview: z.string(),
    whyChooseUs: z.array(z.string()),
    nextSteps: z.string(),
    closing: z.string()
  }),
  scopeOfWork: z.object({
    preparation: z.array(z.string()),
    painting: z.array(z.string()),
    cleanup: z.array(z.string()),
    timeline: z.string()
  }),
  pricingSummary: z.object({
    subtotal: z.number(),
    tax: z.number(),
    discount: z.number().optional(),
    total: z.number(),
    paymentTerms: z.string()
  }),
  upsells: z.array(UpsellItemSchema),
  colorApprovals: z.array(ColorApprovalSchema),
  termsAndConditions: z.object({
    warranty: z.string(),
    materials: z.string(),
    scheduling: z.string(),
    changes: z.string()
  }),
  companyInfo: z.object({
    businessName: z.string(),
    contactInfo: z.string(),
    license: z.string(),
    insurance: z.string()
  })
});

export type PDFContent = z.infer<typeof PDFContentSchema>;
export type UpsellItem = z.infer<typeof UpsellItemSchema>;
export type ColorApproval = z.infer<typeof ColorApprovalSchema>;
