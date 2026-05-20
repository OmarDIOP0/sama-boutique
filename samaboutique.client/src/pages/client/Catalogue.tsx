import { useState, useCallback, useMemo, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
    Search, Package, SlidersHorizontal, X, ChevronDown, ChevronUp,
    ShoppingCart, Heart, ArrowRight, ArrowUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import { useAuthStore } from "@/stores/auth.store";
import { formatPrice, cn, debounce } from "@/lib/utils";
import type { Product } from "@/types";

/* ── Sort options ──────────────────────────────────────────────────────────── */
const SORT_OPTIONS = [
    { value: "pertinence", label: "Pertinence" },
    { value: "prix_asc", label: "Prix croissant" },
    { value: "prix_desc", label: "Prix décroissant" },
    { value: "nom_asc", label: "A → Z" },
    { value: "nom_desc", label: "Z → A" },
    { value: "stock", label: "Disponibilité" },
];

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
function ProductSkeleton() {
    return (
        <div className="space-y-3">
            <div className="sama-skeleton aspect-[3/4]" />
            <div className="sama-skeleton h-3 w-2/3 rounded-full" />
            <div className="sama-skeleton h-3 w-1/2 rounded-full" />
        </div>
    );
}

/* ── Filter section (collapsible) ──────────────────────────────────────────── */
function FilterSection({
    title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="pb-4 mb-4 last:border-0 last:pb-0 last:mb-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <button onClick={() => setOpen((v) => !v)} className="flex items-center justify-between w-full mb-3">
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sama-warm-muted, #9A8A7A)" }}>
                    {title}
                </span>
                {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color: "var(--sama-warm-muted)" }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--sama-warm-muted)" }} />}
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── Price input ───────────────────────────────────────────────────────────── */
function PriceInput({ value, onChange, placeholder }: { value: number | ""; onChange: (v: number | "") => void; placeholder: string }) {
    const [local, setLocal] = useState(String(value === "" ? "" : value));
    return (
        <input
            type="number" min={0} placeholder={placeholder} value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full h-9 px-3 rounded-xl border bg-background text-[13px] outline-none focus:border-[var(--sama-terra)] transition-colors"
            style={{ borderColor: "rgba(0,0,0,0.1)" }}
        />
    );
}

/* ── Product card ──────────────────────────────────────────────────────────── */
function ProductCard({ product, index }: { product: Product; index: number }) {
    const navigate = useNavigate();
    const addItem = useCartStore((s) => s.addItem);
    const { user } = useAuthStore();
    const wishlist = useWishlistStore();
    const isFav = wishlist.isFavorite(product.id);
    const heartRef = useRef<SVGSVGElement>(null);

    const stockTotal = product.variants.reduce((s, v) => s + v.stockActuel, 0);
    const price = (product.variants[0]?.prix && product.variants[0].prix > 0) ? product.variants[0].prix : product.prixVente;
    const inStock = stockTotal > 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        const v = product.variants.find((v) => v.stockActuel > 0);
        if (!v) return;
        addItem({
            variantId: v.id, productId: product.id, productNom: product.nom,
            variantInfo: [v.taille, v.couleur].filter(Boolean).join(" / ") || "Standard",
            imageUrl: product.photos[0] ?? undefined,
            prixUnitaire: v.prix > 0 ? v.prix : product.prixVente,
            quantite: 1, remise: 0,
        });
        toast.success(`${product.nom} ajouté au panier`, { duration: 2000 });
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) {
            toast.error("Connectez-vous pour enregistrer des favoris", {
                action: { label: "Se connecter", onClick: () => navigate("/login") }, duration: 3500,
            });
            return;
        }
        wishlist.toggle(product.id);
        heartRef.current?.classList.remove("heart-pop");
        void heartRef.current?.offsetWidth;
        heartRef.current?.classList.add("heart-pop");
        if (!isFav) toast.success("Ajouté aux favoris", { duration: 1800 });
    };

    return (
        <Link to={`/produit/${product.id}`} className="sama-card block group">
            {/* Image */}
            <div className="relative overflow-hidden" style={{ borderRadius: 14, background: "#F2EDE6", aspectRatio: "5/4" }}>
                {product.photos[0] ? (
                    <img
                        src={product.photos[0]}
                        alt={product.nom}
                        loading="lazy"
                        className="sama-product-img w-full h-full"
                        style={{ objectFit: "cover", objectPosition: "center center" }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10" style={{ color: "rgba(0,0,0,0.08)" }} />
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.2), transparent)" }} />

                {/* Category badge */}
                {product.categoryNom && (
                    <div
                        className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase"
                        style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(6px)", color: "var(--sama-terra, #B84D22)", letterSpacing: "0.08em" }}
                    >
                        {product.categoryNom}
                    </div>
                )}

                {/* Out of stock */}
                {!inStock && (
                    <div
                        className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase"
                        style={{ background: "rgba(0,0,0,0.75)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}
                    >
                        Épuisé
                    </div>
                )}

                {/* Wishlist */}
                <button
                    onClick={handleWishlist}
                    className={cn("sama-wishlist-btn absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center", isFav && "active")}
                    style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}
                >
                    <Heart ref={heartRef} className="w-4 h-4" style={{ color: isFav ? "#ef4444" : "rgba(0,0,0,0.4)", fill: isFav ? "#ef4444" : "none" }} />
                </button>

                {/* Hover actions */}
                <div className="sama-cart-btn absolute bottom-2.5 inset-x-2.5 flex items-center gap-1.5">
                    {inStock && (
                        <button
                            onClick={handleAddToCart}
                            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform flex-shrink-0"
                            style={{ background: "var(--sama-terra, #B84D22)", color: "white" }}
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/produit/${product.id}`); }}
                        className="flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 text-[12px] font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all"
                        style={{ background: "rgba(15,12,10,0.85)", backdropFilter: "blur(8px)", color: "white" }}
                    >
                        <ArrowRight className="w-3.5 h-3.5" /> Voir plus
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="mt-3 px-0.5 space-y-1">
                <p className="text-foreground leading-snug line-clamp-1 font-semibold" style={{ fontSize: 14.5 }}>
                    {product.nom}
                </p>
                <div className="flex items-center justify-between">
                    <span className={cn("font-bold", !inStock && "line-through opacity-40")} style={{ fontSize: 15.5, color: "var(--sama-terra, #B84D22)" }}>
                        {formatPrice(price)}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: inStock ? "#22C55E" : "#EF4444" }} />
                        <span style={{ fontSize: 11.5, color: "var(--sama-warm-muted, #9A8A7A)" }}>
                            {inStock ? "En stock" : "Épuisé"}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* ── Scroll to top ─────────────────────────────────────────────────────────── */
function ScrollToTop() {
    const [visible, setVisible] = useState(false);
    useState(() => {
        const fn = () => setVisible(window.scrollY > 400);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    });
    if (!visible) return null;
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            style={{ background: "var(--sama-terra, #B84D22)", color: "white" }}
        >
            <ArrowUp className="w-5 h-5" />
        </button>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CATALOGUE PAGE                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Catalogue() {
    const [searchParams] = useSearchParams();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryId, setCategoryId] = useState<string | undefined>(searchParams.get("cat") ?? undefined);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 24;

    const [priceMin, setPriceMin] = useState<number | "">("");
    const [priceMax, setPriceMax] = useState<number | "">("");
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sort, setSort] = useState("pertinence");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const { data, isLoading } = useProducts({
        page, pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        categoryId, statut: "Actif",
    });
    const { data: categories = [] } = useCategories();

    const handleSearch = useCallback(
        debounce((val: string) => { setDebouncedSearch(val); setPage(1); }, 300), []
    );

    const availableSizes = useMemo(() => {
        const set = new Set<string>();
        (data?.data ?? []).forEach((p) => p.variants.forEach((v) => { if (v.taille) set.add(v.taille); }));
        return Array.from(set).sort();
    }, [data?.data]);

    /* ── Client-side filter + sort ────────────────────────────────────────── */
    const filtered = useMemo(() => {
        let list = data?.data ?? [];
        if (priceMin !== "") list = list.filter((p) => {
            const pr = (p.variants[0]?.prix && p.variants[0].prix > 0) ? p.variants[0].prix : p.prixVente;
            return pr >= (priceMin as number);
        });
        if (priceMax !== "") list = list.filter((p) => {
            const pr = (p.variants[0]?.prix && p.variants[0].prix > 0) ? p.variants[0].prix : p.prixVente;
            return pr <= (priceMax as number);
        });
        if (selectedSizes.length > 0)
            list = list.filter((p) => p.variants.some((v) => v.taille && selectedSizes.includes(v.taille)));
        if (inStockOnly)
            list = list.filter((p) => p.variants.reduce((s, v) => s + v.stockActuel, 0) > 0);

        list = [...list];
        switch (sort) {
            case "prix_asc": list.sort((a, b) => a.prixVente - b.prixVente); break;
            case "prix_desc": list.sort((a, b) => b.prixVente - a.prixVente); break;
            case "nom_asc": list.sort((a, b) => a.nom.localeCompare(b.nom)); break;
            case "nom_desc": list.sort((a, b) => b.nom.localeCompare(a.nom)); break;
            case "stock": list.sort((a, b) => {
                const sa = a.variants.reduce((s, v) => s + v.stockActuel, 0);
                const sb = b.variants.reduce((s, v) => s + v.stockActuel, 0);
                return sb - sa;
            }); break;
        }
        return list;
    }, [data?.data, priceMin, priceMax, selectedSizes, inStockOnly, sort]);

    const hasActiveFilters = priceMin !== "" || priceMax !== "" || selectedSizes.length > 0 || inStockOnly || !!categoryId;

    const resetFilters = () => {
        setPriceMin(""); setPriceMax(""); setSelectedSizes([]);
        setInStockOnly(false); setCategoryId(undefined); setPage(1);
        setSearch(""); setDebouncedSearch("");
    };

    const toggleSize = (s: string) =>
        setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

    /* ── Sidebar content (shared desktop + mobile) ───────────────────────── */
    const SidebarContent = () => (
        <div>
            {/* Search */}
            <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sama-warm-muted)" }} />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); handleSearch(e.target.value); setPage(1); }}
                        placeholder="Chercher un produit…"
                        className="w-full h-10 pl-10 pr-3 rounded-xl border bg-background outline-none focus:border-[var(--sama-terra)] transition-colors"
                        style={{ fontSize: 14, borderColor: "rgba(0,0,0,0.1)" }}
                    />
                    {search && (
                        <button
                            onClick={() => { setSearch(""); setDebouncedSearch(""); setPage(1); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                            style={{ color: "var(--sama-warm-muted)" }}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <FilterSection title="Catégorie">
                <div className="space-y-2.5">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: !categoryId ? "var(--sama-terra)" : "rgba(0,0,0,0.15)", background: !categoryId ? "var(--sama-terra)" : "transparent" }}
                        >
                            {!categoryId && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <input type="radio" name="cat" checked={!categoryId} onChange={() => { setCategoryId(undefined); setPage(1); }} className="sr-only" />
                        <span style={{ fontSize: 14 }}>Toutes</span>
                    </label>
                    {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                            <div
                                className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                                style={{ borderColor: categoryId === cat.id ? "var(--sama-terra)" : "rgba(0,0,0,0.15)", background: categoryId === cat.id ? "var(--sama-terra)" : "transparent" }}
                            >
                                {categoryId === cat.id && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <input type="radio" name="cat" checked={categoryId === cat.id} onChange={() => { setCategoryId(cat.id); setPage(1); }} className="sr-only" />
                            <span className="flex-1" style={{ fontSize: 14 }}>{cat.nom}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(0,0,0,0.05)", color: "var(--sama-warm-muted)" }}>
                                {cat.nbProduits}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Price */}
            <FilterSection title="Prix (F CFA)">
                <div className="flex items-center gap-2.5">
                    <PriceInput value={priceMin} onChange={(v) => { setPriceMin(v); setPage(1); }} placeholder="Min" />
                    <span style={{ fontSize: 13, color: "var(--sama-warm-muted)" }}>–</span>
                    <PriceInput value={priceMax} onChange={(v) => { setPriceMax(v); setPage(1); }} placeholder="Max" />
                </div>
            </FilterSection>

            {/* Sizes */}
            {availableSizes.length > 0 && (
                <FilterSection title="Taille">
                    <div className="flex flex-wrap gap-2">
                        {availableSizes.map((s) => (
                            <button
                                key={s} onClick={() => toggleSize(s)}
                                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                                style={{
                                    border: selectedSizes.includes(s) ? "1.5px solid var(--sama-terra)" : "1.5px solid rgba(0,0,0,0.1)",
                                    background: selectedSizes.includes(s) ? "rgba(184,77,34,0.08)" : "transparent",
                                    color: selectedSizes.includes(s) ? "var(--sama-terra)" : "var(--sama-warm-muted)",
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* Stock */}
            <FilterSection title="Disponibilité" defaultOpen={false}>
                <label className="flex items-center gap-3 cursor-pointer">
                    <div
                        className="w-10 h-[22px] rounded-full relative transition-all cursor-pointer"
                        style={{ background: inStockOnly ? "var(--sama-terra)" : "rgba(0,0,0,0.1)" }}
                        onClick={() => { setInStockOnly((v) => !v); setPage(1); }}
                    >
                        <div className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all" style={{ left: inStockOnly ? "calc(100% - 19px)" : "3px" }} />
                    </div>
                    <span style={{ fontSize: 14 }}>En stock uniquement</span>
                </label>
            </FilterSection>

            {hasActiveFilters && (
                <button
                    onClick={resetFilters}
                    className="w-full mt-2 h-9 rounded-xl text-[13px] font-semibold transition-all"
                    style={{ border: "1.5px solid rgba(184,77,34,0.25)", color: "var(--sama-terra)", background: "rgba(184,77,34,0.04)" }}
                >
                    Réinitialiser les filtres
                </button>
            )}
        </div>
    );

    return (
        <>
            {/* Inline styles (sama design tokens) */}
            <style>{`
        :root {
          --sama-terra: #B84D22;
          --sama-terra-light: #D97B50;
          --sama-gold: #C8912A;
          --sama-dark: #0F0C0A;
          --sama-cream: #FAF6EF;
          --sama-warm-muted: #9A8A7A;
        }
        @keyframes shimmer {
          from { background-position: 200% center; }
          to   { background-position: -200% center; }
        }
        .sama-skeleton {
          background: linear-gradient(90deg, #F0EBE4 25%, #E5DDD4 50%, #F0EBE4 75%);
          background-size: 400% 100%;
          animation: shimmer 1.6s ease infinite;
          border-radius: 14px;
        }
        .sama-product-img { transition: transform 0.55s cubic-bezier(.4,0,.2,1); }
        .sama-card:hover .sama-product-img { transform: scale(1.05); }
        .sama-cart-btn {
          transform: translateY(8px); opacity: 0;
          transition: transform 0.25s cubic-bezier(.4,0,.2,1), opacity 0.25s;
        }
        .sama-card:hover .sama-cart-btn { transform: translateY(0); opacity: 1; }
        .sama-wishlist-btn {
          opacity: 0; transform: scale(0.8);
          transition: opacity 0.2s, transform 0.2s;
        }
        .sama-card:hover .sama-wishlist-btn, .sama-wishlist-btn.active { opacity: 1; transform: scale(1); }
        .sama-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 100px;
          font-size: 12px; font-weight: 500;
          background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.55);
          border: 1px solid rgba(0,0,0,0.06);
        }
        @keyframes heartPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        .heart-pop { animation: heartPop 0.3s ease; }
      `}</style>

            <div
                className="min-h-screen"
                style={{
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(184,77,34,0.025) 8px, rgba(184,77,34,0.025) 9px)",
                }}
            >
                {/* ── Page header ──────────────────────────────────────────────────── */}
                <div className="px-5 xl:px-10 pt-8 pb-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-1 h-6 rounded-full" style={{ background: "var(--sama-terra)" }} />
                        <h1
                            style={{
                                fontSize: 22, fontWeight: 700,
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontStyle: "italic",
                            }}
                        >
                            Catalogue
                        </h1>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--sama-warm-muted)", marginLeft: 16 }}>
                        Explorez notre sélection de produits
                    </p>
                </div>

                <div className="flex">
                    {/* ── Desktop sidebar ────────────────────────────────────────────── */}
                    <aside
                        className="hidden lg:block w-60 xl:w-64 shrink-0 sticky self-start overflow-y-auto px-5 py-6"
                        style={{ top: 70, height: "calc(100vh - 70px)", borderRight: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sama-warm-muted)" }}>
                                Filtres
                            </span>
                            {hasActiveFilters && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--sama-terra)" }} />}
                        </div>
                        <SidebarContent />
                    </aside>

                    {/* ── Main content ───────────────────────────────────────────────── */}
                    <div className="flex-1 min-w-0 px-5 sm:px-6 py-6">

                        {/* Topbar */}
                        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Mobile filter trigger */}
                                <button
                                    onClick={() => setMobileFiltersOpen(true)}
                                    className="lg:hidden flex items-center gap-2 h-9 px-4 rounded-full text-[13px] font-medium transition-all"
                                    style={{ border: "1.5px solid rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.6)" }}
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filtres
                                    {hasActiveFilters && <span className="w-2 h-2 rounded-full" style={{ background: "var(--sama-terra)" }} />}
                                </button>

                                {/* Count */}
                                <p style={{ fontSize: 14, color: "var(--sama-warm-muted)" }}>
                                    <span className="font-bold text-foreground" style={{ fontSize: 15 }}>{filtered.length}</span>{" "}
                                    {filtered.length === 1 ? "produit" : "produits"}
                                    {data?.pagination && data.pagination.totalCount > PAGE_SIZE && (
                                        <span> sur {data.pagination.totalCount}</span>
                                    )}
                                </p>

                                {/* Active chips */}
                                <div className="hidden sm:flex items-center gap-2 flex-wrap">
                                    {categoryId && (
                                        <span className="sama-chip">
                                            {categories.find((c) => c.id === categoryId)?.nom}
                                            <button onClick={() => setCategoryId(undefined)}><X className="w-3.5 h-3.5" /></button>
                                        </span>
                                    )}
                                    {(priceMin !== "" || priceMax !== "") && (
                                        <span className="sama-chip">
                                            {priceMin !== "" && priceMax !== ""
                                                ? `${formatPrice(priceMin as number)} – ${formatPrice(priceMax as number)}`
                                                : priceMin !== "" ? `≥ ${formatPrice(priceMin as number)}` : `≤ ${formatPrice(priceMax as number)}`}
                                            <button onClick={() => { setPriceMin(""); setPriceMax(""); }}><X className="w-3.5 h-3.5" /></button>
                                        </span>
                                    )}
                                    {selectedSizes.map((s) => (
                                        <span key={s} className="sama-chip">{s}<button onClick={() => toggleSize(s)}><X className="w-3.5 h-3.5" /></button></span>
                                    ))}
                                    {inStockOnly && (
                                        <span className="sama-chip">En stock<button onClick={() => setInStockOnly(false)}><X className="w-3.5 h-3.5" /></button></span>
                                    )}
                                </div>
                            </div>

                            {/* Sort */}
                            <select
                                value={sort} onChange={(e) => setSort(e.target.value)}
                                className="h-9 pl-3.5 pr-8 rounded-full border bg-background outline-none appearance-none cursor-pointer shrink-0"
                                style={{ fontSize: 13, fontWeight: 500, borderColor: "rgba(0,0,0,0.1)" }}
                            >
                                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        {/* ── Product grid ─────────────────────────────────────────────── */}
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
                                {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-28 text-center">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(184,77,34,0.08)" }}>
                                    <Package className="w-7 h-7" style={{ color: "var(--sama-terra)" }} />
                                </div>
                                <p className="font-bold text-foreground mb-1.5" style={{ fontSize: 16 }}>Aucun produit trouvé</p>
                                <p className="mb-5" style={{ fontSize: 14, color: "var(--sama-warm-muted)" }}>Modifiez vos filtres ou votre recherche</p>
                                {hasActiveFilters && (
                                    <button onClick={resetFilters} className="px-6 py-2.5 rounded-full text-[14px] font-semibold" style={{ border: "1.5px solid rgba(184,77,34,0.3)", color: "var(--sama-terra)" }}>
                                        Réinitialiser
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
                                    <AnimatePresence mode="popLayout">
                                        {filtered.map((product, i) => (
                                            <motion.div
                                                key={product.id} layout
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.96 }}
                                                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3), ease: [0.4, 0, 0.2, 1] }}
                                            >
                                                <ProductCard product={product} index={i} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Pagination */}
                                {data?.pagination && data.pagination.totalPages > 1 && (
                                    <div className="mt-12 flex items-center justify-center gap-2">
                                        {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                                className="w-10 h-10 rounded-full text-[13px] font-semibold transition-all"
                                                style={{
                                                    background: p === page ? "var(--sama-terra)" : "transparent",
                                                    color: p === page ? "white" : "var(--sama-warm-muted)",
                                                    border: p === page ? "none" : "1.5px solid rgba(0,0,0,0.08)",
                                                }}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
            <AnimatePresence>
                {mobileFiltersOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0"
                            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                            onClick={() => setMobileFiltersOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            className="absolute left-0 top-0 bottom-0 w-72 overflow-y-auto px-5 py-6 shadow-2xl"
                            style={{ background: "var(--sama-cream, #FAF6EF)" }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sama-warm-muted)" }}>
                                    Filtres
                                </span>
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: "rgba(0,0,0,0.05)" }}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <SidebarContent />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ScrollToTop />
        </>
    );
}