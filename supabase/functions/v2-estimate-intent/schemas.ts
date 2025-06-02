
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

// Updated schemas to match the exact template structure
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

export const PDFContentSchema = z.object({
  coverPage: z.object({
    title: z.string(),
    clientName: z.string(),
    projectAddress: z.string(),
    estimateDate: z.string(),
    estimateNumber: z.string(),
    proposalNumber: z.string(),
    estimatorName: z.string(),
    estimatorEmail: z.string(),
    estimatorPhone: z.string(),
    clientPhone: z.string(),
    clientEmail: z.string()
  }),
  introductionLetter: z.object({
    greeting: z.string(),
    thankYouMessage: z.string(),
    valueProposition: z.string(),
    qualityCommitment: z.string(),
    collaborationMessage: z.string(),
    bookingInstructions: z.string(),
    closing: z.string(),
    ownerName: z.string(),
    companyName: z.string(),
    website: z.string()
  }),
  projectDescription: z.object({
    powerWashing: z.object({
      description: z.string(),
      areas: z.array(z.string()),
      notes: z.array(z.string())
    }),
    surfacePreparation: z.object({
      includes: z.array(z.string())
    }),
    paintApplication: z.object({
      description: z.string(),
      notes: z.array(z.string())
    }),
    inclusions: z.array(z.string()),
    exclusions: z.array(z.string()),
    safetyAndCleanup: z.array(z.string()),
    specialConsiderations: z.string()
  }),
  pricing: z.object({
    subtotal: z.number(),
    tax: z.number(),
    total: z.number()
  }),
  colorApprovals: z.array(ColorApprovalSchema),
  addOns: z.object({
    totalPrice: z.number(),
    validityDays: z.number(),
    depositPercent: z.number(),
    optionalUpgrades: z.array(OptionalUpgradeSchema),
    projectAcceptance: z.object({
      clientNameLine: z.string(),
      dateLine: z.string(),
      signatureLine: z.string(),
      agreementText: z.string()
    })
  })
});

export type PDFContent = z.infer<typeof PDFContentSchema>;
export type ColorApproval = z.infer<typeof ColorApprovalSchema>;
export type OptionalUpgrade = z.infer<typeof OptionalUpgradeSchema>;
