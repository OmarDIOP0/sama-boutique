// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  message?: string;
}

export interface Pagination {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = 'SuperAdmin' | 'Admin' | 'Caissier' | 'Vendeur' | 'Client';

export interface User {
  id: string;
  clientId?: string;
  nom: string;
  email: string;
  role: string;
  telephone?: string;
  permissions?: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  password: string;
  telephone?: string;
  adresse?: string;
  dateNaissance?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export interface Category {
  id: string;         // Guid
  nom: string;
  parentId?: string;
  parentNom?: string;
  ordre: number;
  nbProduits: number;
  subCategories: Category[];
}

export interface CategoryCreateRequest {
  nom: string;
  parentId?: string;  // Guid
  ordre?: number;
}

// ─── Products ────────────────────────────────────────────────────────────────

export type ProductStatus = 'Actif' | 'Inactif' | 'Archivé';

export interface ProductVariant {
  id: string;             // Guid
  taille?: string;
  couleur?: string;
  stockActuel: number;
  stockMinimum: number;
  prix: number;
  isStockCritical: boolean;
  isRupture: boolean;
}

export interface Product {
  id: string;             // Guid
  nom: string;
  description?: string;
  codeBarres?: string;
  categoryId: string;     // Guid
  categoryNom: string;
  prixAchat: number;
  prixVente: number;
  marge: number;
  statut: string;
  photos: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  prixPromo?: number | null;
  enPromo?: boolean;
  remisePct?: number;
}

export interface VariantCreateRequest {
  taille?: string;
  couleur?: string;
  stockActuel: number;
  stockMinimum: number;
  prixOverride?: number;
}

export interface ProductCreateRequest {
  nom: string;
  description?: string;
  codeBarres?: string;
  categoryId: string;     // Guid
  prixAchat: number;
  prixVente: number;
  statut?: string;
  variants: VariantCreateRequest[];
}

export interface ProductUpdateRequest {
  nom: string;
  description?: string;
  codeBarres?: string;
  categoryId: string;     // Guid
  prixAchat: number;
  prixVente: number;
  prixPromo?: number | null;
  statut?: string;
}

export interface ProductsFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  statut?: string;
  categoryId?: string;    // Guid
}

export interface StockAlert {
  variantId: string;      // Guid
  productId: string;      // Guid
  productNom: string;
  variante?: string;
  stockActuel: number;
  stockMinimum: number;
  niveauAlerte: string;   // 'Critique' | 'Rupture'
}

// ─── Stock ───────────────────────────────────────────────────────────────────

export interface StockMovement {
  id: string;             // Guid
  variantId: string;      // Guid
  productNom: string;
  variante?: string;
  type: string;           // 'Entrée' | 'Sortie' | 'Ajustement'
  quantite: number;
  stockAvant: number;
  stockApres: number;
  motif?: string;
  userNom: string;
  date: string;
}

export interface StockMovementRequest {
  variantId: string;      // Guid
  type: string;           // 'Entrée' | 'Sortie' | 'Ajustement'
  quantite: number;
  motif?: string;
}

export interface StockMovementsFilters {
  page?: number;
  pageSize?: number;
  variantId?: string;
  type?: string;
}

// ─── Sales / POS ─────────────────────────────────────────────────────────────

export type PaymentMode = 'Especes' | 'CarteBancaire' | 'MobileMoney' | 'Cheque' | 'Mixte';
export type SaleStatus = 'Completee' | 'Annulee' | 'Remboursee';

export interface SaleItem {
  id: string;             // Guid
  variantId: string;      // Guid
  productNom: string;
  variante?: string;
  quantite: number;
  prixUnitaire: number;
  remisePct: number;
  sousTotal: number;
}

export interface Sale {
  id: string;             // Guid
  userId: string;         // Guid
  userNom: string;
  clientId?: string;      // Guid
  clientNom?: string;
  totalHT: number;
  totalTTC: number;
  remiseGlobale: number;
  modePaiement: string;
  montantRecu: number;
  monnaieRendue: number;
  statut: string;
  items: SaleItem[];
  date: string;
}

export interface SaleCreateRequest {
  clientId?: string;      // Guid
  remiseGlobale: number;
  modePaiement: string;
  montantRecu: number;
  items: {
    variantId: string;    // Guid
    quantite: number;
    prixUnitaire: number;
    remisePct: number;
  }[];
}

export interface SalesFilters {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  statut?: string;
  modePaiement?: string;
  userId?: string;
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export type ClientSegment = 'Nouveau' | 'Regulier' | 'VIP' | 'Inactif';

export interface Client {
  id: string;             // Guid
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  pointsFidelite: number;
  segment: string;
  soldeCredit: number;
  nbCommandes: number;
  nbAchats: number;
  totalDepense: number;
  createdAt: string;
}

export interface ClientCreateRequest {
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  dateNaissance?: string;
}

export interface ClientUpdateRequest {
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  dateNaissance?: string;
}

export interface ClientsFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  segment?: string;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'EnAttente'
  | 'Confirmee'
  | 'EnPreparation'
  | 'Expediee'
  | 'Livree'
  | 'Annulee'
  | 'Retournee';

export interface OrderItem {
  id: string;             // Guid
  variantId: string;      // Guid
  productNom: string;
  variante?: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface Order {
  id: string;             // Guid
  clientId: string;       // Guid
  clientNom: string;
  statut: string;
  totalHT: number;
  totalTTC: number;
  adresseLivraison?: string;
  modePaiement?: string;
  numeroFacture?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderCreateRequest {
  clientId: string;       // Guid
  adresseLivraison?: string;
  modePaiement?: string;
  items: {
    variantId: string;    // Guid
    quantite: number;
    prixUnitaire: number;
  }[];
}

export interface OrdersFilters {
  page?: number;
  pageSize?: number;
  statut?: string;
  clientId?: string;      // Guid
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface KPIs {
  caJour: number;
  caSemaine: number;
  caMois: number;
  caAnnee: number;
  nbVentesJour: number;
  nbVentesMois: number;
  panierMoyen: number;
  produitsEnAlerte: number;
  produitsEnRupture: number;
  nbClientsActifs: number;
  evolutionCaPct: number;
  evolutionVentesPct: number;
}

export interface TopProduct {
  id: string;
  nom: string;
  categoryNom: string;
  qtéVendue: number;
  caGenere: number;
  marge: number;
}

export interface TopClient {
  id: string;
  nom: string;
  email?: string;
  segment: string;
  nbAchats: number;
  totalDepense: number;
  pointsFidelite: number;
}

export interface SalesChartPoint {
  periode: string;
  montant: number;
  nbVentes: number;
  panierMoyen: number;
}

export interface PaymentBreakdown {
  modePaiement: string;
  nbVentes: number;
  montant: number;
  pourcentage: number;
}

// ─── Cart (POS) ───────────────────────────────────────────────────────────────

export interface CartItem {
  variantId: string;      // Guid
  productId: string;      // Guid
  productNom: string;
  variantInfo: string;
  prixUnitaire: number;
  quantite: number;
  remise: number;         // % discount (display only; converted to remisePct on submit)
  imageUrl?: string;
}

// ─── Offline Queue ────────────────────────────────────────────────────────────

export interface OfflineQueueItem {
  id: string;
  type: 'sale';
  payload: SaleCreateRequest;
  createdAt: string;
  retries: number;
}

// ─── Delivery Zones ───────────────────────────────────────────────────────────
export interface DeliveryZone {
  id: string;
  nom: string;
  region?: string;
  communes: string[];
  tarif: number;
  delaiMinH: number;
  delaiMaxH: number;
  isActive: boolean;
  description?: string;
  freeFrom?: number | null;
  ordre: number;
}

export interface DeliveryZoneRequest {
  nom: string;
  region?: string;
  communes: string[];
  tarif: number;
  delaiMinH: number;
  delaiMaxH: number;
  isActive: boolean;
  description?: string;
  freeFrom?: number | null;
  ordre: number;
}
