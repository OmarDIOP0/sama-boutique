import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// Login client par numéro de téléphone sénégalais
export const phoneLoginSchema = z.object({
  phone: z
    .string()
    .min(9, "Numéro trop court")
    .regex(/^(70|75|76|77|78)\d{7}$/, "Numéro invalide — ex : 77 123 45 67"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type PhoneLoginFormData = z.infer<typeof phoneLoginSchema>;

export const registerSchema = z.object({
  nom: z.string().min(2, "Nom trop court (min 2 caractères)"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Mot de passe trop court (min 8 caractères)")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z
    .string()
    .min(8, "Min 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
  confirmNewPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmNewPassword"],
});

// ─── Product ──────────────────────────────────────────────────────────────────

export const productVariantSchema = z.object({
  taille: z.string().optional(),
  couleur: z.string().optional(),
  stockActuel: z.number({ coerce: true }).int().min(0, "Stock invalide"),
  stockMinimum: z.number({ coerce: true }).int().min(0, "Minimum invalide"),
  prixOverride: z.number({ coerce: true }).min(0).optional(),
});

// Full create schema (includes variants + both price fields)
export const productCreateSchema = z.object({
  nom: z.string().min(2, "Nom trop court"),
  description: z.string().optional(),
  codeBarres: z.string().optional(),
  categoryId: z.string().min(1, "Catégorie requise"),
  prixAchat: z.number({ coerce: true }).min(0, "Prix d'achat invalide"),
  prixVente: z.number({ coerce: true }).positive("Prix de vente invalide"),
  statut: z.enum(["Actif", "Inactif", "Archivé"]).default("Actif"),
  variants: z.array(productVariantSchema).optional().default([]),
});

// Update schema (no variants — managed separately)
export const productUpdateSchema = z.object({
  nom: z.string().min(2, "Nom trop court"),
  description: z.string().optional(),
  codeBarres: z.string().optional(),
  categoryId: z.string().min(1, "Catégorie requise"),
  prixAchat: z.number({ coerce: true }).min(0, "Prix d'achat invalide"),
  prixVente: z.number({ coerce: true }).positive("Prix de vente invalide"),
  prixPromo: z.number({ coerce: true }).min(0).optional(),
  statut: z.enum(["Actif", "Inactif", "Archivé"]).default("Actif"),
});

// Legacy alias kept for backward compat with any remaining references
export const productSchema = productCreateSchema;

export const categorySchema = z.object({
  nom: z.string().min(2, "Nom trop court"),
  ordre: z.number({ coerce: true }).int().min(0).default(0),
});

// ─── Stock ────────────────────────────────────────────────────────────────────

export const stockMovementSchema = z.object({
  variantId: z.string().min(1, "Variante requise"),
  type: z.enum(["Entrée", "Sortie", "Ajustement"]),
  quantite: z.number({ coerce: true }).int().positive("Quantité invalide"),
  motif: z.string().optional(),
});

// ─── Client ───────────────────────────────────────────────────────────────────

export const clientSchema = z.object({
  nom: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
});

// ─── Order ────────────────────────────────────────────────────────────────────

export const orderSchema = z.object({
  adresseLivraison: z.string().min(5, "Adresse requise"),
  notes: z.string().optional(),
});

// ─── Checkout ─────────────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  nom: z.string().min(2, "Nom requis"),
  region: z.string().min(1, "Région requise"),
  departement: z.string().optional(),
  adresse: z.string().min(5, "Adresse requise"),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProductCreateFormData = z.infer<typeof productCreateSchema>;
export type ProductUpdateFormData = z.infer<typeof productUpdateSchema>;
/** @deprecated Use ProductCreateFormData or ProductUpdateFormData */
export type ProductFormData = z.infer<typeof productCreateSchema>;
export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type StockMovementFormData = z.infer<typeof stockMovementSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
