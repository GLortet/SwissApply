import { z } from "zod";

export const evidencedStringSchema=z.object({value:z.string().min(1),sectionLabel:z.string().min(1),quote:z.string().min(1),confidence:z.number().min(0).max(1),uncertaintyReason:z.string().nullable()}).strict();
const achievementSchema=z.object({localRef:z.string().min(1),context:evidencedStringSchema.nullable(),action:evidencedStringSchema.nullable(),result:evidencedStringSchema.nullable(),metrics:z.array(evidencedStringSchema)}).strict();
const experienceSchema=z.object({localRef:z.string().min(1),company:evidencedStringSchema.nullable(),role:evidencedStringSchema.nullable(),location:evidencedStringSchema.nullable(),startDate:evidencedStringSchema.nullable(),endDate:evidencedStringSchema.nullable(),responsibilities:z.array(evidencedStringSchema),achievements:z.array(achievementSchema),skills:z.array(evidencedStringSchema)}).strict();
export const professionalExtractionSchema=z.object({identity:z.array(z.object({field:z.enum(["fullName","email","phone","address","nationality"]),data:evidencedStringSchema}).strict()),experiences:z.array(experienceSchema),skills:z.array(evidencedStringSchema),education:z.array(evidencedStringSchema),languages:z.array(evidencedStringSchema),ambiguities:z.array(z.object({category:z.enum(["IDENTITY","EXPERIENCE","ACHIEVEMENT","SKILL","EDUCATION","LANGUAGE"]),field:z.string().min(1),data:evidencedStringSchema,experienceRef:z.string().nullable()}).strict())}).strict();
export type ProfessionalExtraction=z.infer<typeof professionalExtractionSchema>;
export type EvidencedString=z.infer<typeof evidencedStringSchema>;
