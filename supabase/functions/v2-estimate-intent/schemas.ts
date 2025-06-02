
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

// Cover page information schema
export const CoverPageSchema = z.object({
  estimateDate: z.string(),
  estimateNumber: z.string(),
  proposalNumber: z.string(),
  clientName: z.string(),
  clientPhone: z.string(),
  clientEmail: z.string(),
  projectAddress: z.string(),
  estimatorName: z.string(),
  estimatorEmail: z.string(),
  estimatorPhone: z.string()
});

// Line item schema
export const LineItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unit: z.string(),
  unitPrice: z.number(),
  total: z.number()
});

// Add-on schema
export const AddOnSchema = z.object({
  description: z.string(),
  price: z.number(),
  selected: z.boolean()
});

// Pricing summary schema
export const PricingSchema = z.object({
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  taxRate: z.string()
});

// Company information schema
export const CompanyInfoSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  website: z.string().optional()
});

// Signatures section schema
export const SignaturesSchema = z.object({
  clientSignatureRequired: z.boolean(),
  warrantyInfo: z.string()
});

// Updated comprehensive PDF content schema - matches the 9-section structure from the prompt template
export const PDFContentSchema = z.object({
  coverPage: CoverPageSchema,
  projectOverview: z.string(),
  scopeOfWork: z.string(),
  lineItems: z.array(LineItemSchema),
  addOns: z.array(AddOnSchema),
  pricing: PricingSchema,
  termsAndConditions: z.string(),
  companyInfo: CompanyInfoSchema,
  signatures: SignaturesSchema
});

// Legacy schemas for backwards compatibility
export const ColorApprovalSchema = z.object({
  colorCode: z.string(),
  colorName: z.string(),
  surfaces: z.string(),
  approved: z.boolean().default(false)
});

export const OptionalUpgradeSchema = z.object({
  selected: z.boolean().default(false),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  lineTotal: z.number()
});

export type PDFContent = z.infer<typeof PDFContentSchema>;
export type CoverPage = z.infer<typeof CoverPageSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type AddOn = z.infer<typeof AddOnSchema>;
export type Pricing = z.infer<typeof PricingSchema>;
export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;
export type Signatures = z.infer<typeof SignaturesSchema>;
export type ColorApproval = z.infer<typeof ColorApprovalSchema>;
export type OptionalUpgrade = z.infer<typeof OptionalUpgradeSchema>;
