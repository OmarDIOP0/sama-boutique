import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { toast } from "sonner";
import {
    Search, Package, SlidersHorizontal, X, ChevronDown, ChevronUp,
    ShoppingCart, Heart, ArrowRight, ArrowUp, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import { useAuthStore } from "@/stores/auth.store";
import { formatPrice, cn, debounce } from "@/lib/utils";
import type { Product } from "@/types";

// ─── Styles ────────────────────────────────────────────────────────────────────
const SAMA_STYLES = `
  :root {
    --sama-terra: #C7932D;
    --sama-terra-light: #d4a545;
    --sama-gold: #C7932D;
    --sama-gold-light: #d4a545;
    --sama-dark: #513102;
    --sama-cream: #FFF8EE;
    --sama-warm-muted: rgba(81,49,2,0.55);
  }

  @keyframes shimmer {
    from { background-position: 200% center; }
    to   { background-position: -200% center; }
  }
  .sama-skeleton {
    background: linear-gradient(90deg, #F5F0E8 25%, #EDE7DC 50%, #F5F0E8 75%);
    background-size: 400% 100%;
    animation: shimmer 1.6s ease infinite;
    border-radius: 10px;
  }

  .sama-product-img { transition: transform 0.5s cubic-bezier(.4,0,.2,1); }
  .sama-card:hover .sama-product-img { transform: scale(1.06); }

  .sama-cart-btn {
    transform: translateY(6px); opacity: 0;
    transition: transform 0.22s cubic-bezier(.4,0,.2,1), opacity 0.22s;
  }
  .sama-card:hover .sama-cart-btn { transform: translateY(0); opacity: 1; }

  .sama-wishlist-btn {
    opacity: 0; transform: scale(0.85);
    transition: opacity 0.2s, transform 0.2s;
  }
  .sama-card:hover .sama-wishlist-btn, .sama-wishlist-btn.active { opacity: 1; transform: scale(1); }

  .sama-filter-section { border-bottom: 1px solid rgba(81,49,2,0.07); }

  .sama-chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 100px;
    font-size: 11.5px; font-weight: 500;
    background: rgba(81,49,2,0.05); color: rgba(81,49,2,0.65);
    border: 1px solid rgba(199,147,45,0.18);
  }

  .sama-pattern-bg {
    background-color: #FFF8EE;
    background-image: linear-gradient(#51310208 1px, transparent 1px), linear-gradient(90deg, #51310208 1px, transparent 1px);
    background-size: 4rem 4rem;
  }

  @keyframes heartPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.35); }
    100% { transform: scale(1); }
  }
  .heart-pop { animation: heartPop 0.3s ease; }

  /* Hero slider dots */
  .hero-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(255,255,255,0.4);
    transition: all 0.3s;
    cursor: pointer;
  }
  .hero-dot.active {
    background: white;
    width: 24px; border-radius: 4px;
  }

  /* Category card hover */
  .cat-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
  .cat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(81,49,2,0.10); }
`;

const SORT_OPTIONS = [
    { value: "pertinence", label: "Pertinence" },
    { value: "prix_asc", label: "Prix ↑" },
    { value: "prix_desc", label: "Prix ↓" },
    { value: "nom_asc", label: "A → Z" },
    { value: "nom_desc", label: "Z → A" },
    { value: "stock", label: "Disponibilité" },
];

// Soft category colors
const CAT_COLORS = [
    { bg: "#FFF0E6", accent: "#E8814D" },
    { bg: "#E8F5E9", accent: "#4CAF50" },
    { bg: "#FFF8E1", accent: "#F9A825" },
    { bg: "#E3F2FD", accent: "#42A5F5" },
    { bg: "#F3E5F5", accent: "#AB47BC" },
    { bg: "#FBE9E7", accent: "#FF7043" },
    { bg: "#E0F7FA", accent: "#26C6DA" },
    { bg: "#FFF3E0", accent: "#FFA726" },
];

// Hero slide backgrounds
// Couleurs chaudes en harmonie avec le design Wurus (ivoire/or/brun)
const HERO_COLORS = [
    "linear-gradient(135deg, #FFF0DC 0%, #F5D5A0 100%)",  // or doux
    "linear-gradient(135deg, #FAF0E8 0%, #E8C9A0 100%)",  // crème ambré
    "linear-gradient(135deg, #F5E6D3 0%, #D4A574 100%)",  // terre caramel
    "linear-gradient(135deg, #FDF5E6 0%, #E8B87E 100%)",  // sable doré
    "linear-gradient(135deg, #F7EDE2 0%, #C9956A 100%)",  // terracotta doux
];

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function ProductSkeleton() {
    return (
        <div className="space-y-2">
            <div className="sama-skeleton aspect-square" />
            <div className="sama-skeleton h-2.5 w-2/3 rounded-full" />
            <div className="sama-skeleton h-2.5 w-1/2 rounded-full" />
        </div>
    );
}

// ─── Product card (compact) ────────────────────────────────────────────────────
export function ProductCard({ product, index }: { product: Product; index: number }) {
    const navigate = useNavigate();
    const addItem = useCartStore((s) => s.addItem);
    const { user } = useAuthStore();
    const wishlist = useWishlistStore();
    const isFav = wishlist.isFavorite(product.id);
    const heartRef = useRef<SVGSVGElement>(null);

    const stockTotal = product.variants.reduce((s, v) => s + v.stockActuel, 0);
    const price = (product.variants[0]?.prix && product.variants[0].prix > 0)
        ? product.variants[0].prix : product.prixVente;
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
        <Link to={`/produit/${product.id}`} className="sama-card block group wurus-card hover:-translate-y-1 transition-all duration-300">
            <div className="relative overflow-hidden" style={{ borderRadius: "16px 16px 0 0", background: "#F5F0EA", aspectRatio: "1/1" }}>
                {product.photos[0] ? (
                    <img
                        src={product.photos[0]} alt={product.nom} loading="lazy"
                        className="sama-product-img w-full h-full"
                        style={{ objectFit: "cover", objectPosition: "center center" }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-7 h-7" style={{ color: "rgba(81,49,2,0.10)" }} />
                    </div>
                )}

                {/* Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-14 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(81,49,2,0.10), transparent)" }} />

                {/* Category */}
                {product.categoryNom && (
                    <div
                        className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase"
                        style={{ background: "rgba(199,147,45,0.15)", backdropFilter: "blur(6px)", color: "#513102", letterSpacing: "0.08em" }}
                    >
                        {product.categoryNom}
                    </div>
                )}

                {!inStock && (
                    <div
                        className="absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                        style={{ background: "rgba(81,49,2,0.72)", color: "rgba(255,248,238,0.9)" }}
                    >
                        Épuisé
                    </div>
                )}

                {/* Wishlist */}
                <button
                    onClick={handleWishlist}
                    className={cn("sama-wishlist-btn absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center", isFav && "active")}
                    style={{ background: "rgba(255,248,238,0.92)", backdropFilter: "blur(8px)" }}
                >
                    <Heart ref={heartRef} className="w-3.5 h-3.5" style={{ color: isFav ? "#ef4444" : "rgba(81,49,2,0.45)", fill: isFav ? "#ef4444" : "none" }} />
                </button>

                {/* Actions */}
                <div className="sama-cart-btn absolute bottom-2 inset-x-2 flex items-center gap-1">
                    {inStock && (
                        <button
                            onClick={handleAddToCart}
                            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform flex-shrink-0 wurus-btn-primary"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/produit/${product.id}`); }}
                        className="flex-1 h-7 rounded-full flex items-center justify-center gap-1 text-[10px] font-semibold shadow-md"
                        style={{ background: "rgba(81,49,2,0.82)", backdropFilter: "blur(8px)", color: "#FFF8EE" }}
                    >
                        <ArrowRight className="w-2.5 h-2.5" /> Voir
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="mt-2 px-3 pb-3">
                <p className="leading-snug line-clamp-1 font-medium" style={{ fontSize: 12.5, color: "#513102" }}>
                    {product.nom}
                </p>
                <div className="flex items-center justify-between mt-1">
                    <span className={cn("font-bold", !inStock && "line-through opacity-40")} style={{ fontSize: 13, color: "#C7932D", fontWeight: 700 }}>
                        {formatPrice(price)}
                    </span>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: inStock ? "#22C55E" : "#EF4444" }} />
                        <span style={{ fontSize: 9.5, color: "rgba(81,49,2,0.55)" }}>
                            {inStock ? "En stock" : "Épuisé"}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─── Hero Slider ───────────────────────────────────────────────────────────────
// ─── Hero Slider (1 produit par slide, image large) ────────────────────────────
function HeroSlider({ products }: { products: Product[] }) {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval>>();
    const navigate = useNavigate();

    const slides = useMemo(() => {
        return products.slice(0, 6).map((p, i) => {
            const price = (p.variants[0]?.prix && p.variants[0].prix > 0) ? p.variants[0].prix : p.prixVente;
            const inStock = p.variants.reduce((s, v) => s + v.stockActuel, 0) > 0;
            return { ...p, displayPrice: price, inStock, bg: HERO_COLORS[i % HERO_COLORS.length] };
        });
    }, [products]);

    useEffect(() => {
        if (slides.length <= 1) return;
        timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4500);
        return () => clearInterval(timerRef.current);
    }, [slides.length]);

    const goTo = (idx: number) => {
        setCurrent(idx);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4500);
    };

    const prev = () => goTo((current - 1 + slides.length) % slides.length);
    const next = () => goTo((current + 1) % slides.length);

    if (slides.length === 0) return null;
    const slide = slides[current];

    return (
        <section className="relative overflow-hidden" style={{ height: "clamp(320px, 50vh, 440px)" }}>
            {/* Background */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                    style={{ background: slide.bg }}
                />
            </AnimatePresence>

            {/* Decorative circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>

            <div className="relative z-10 h-full max-w-[1400px] mx-auto px-6 xl:px-12 flex items-center">
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 w-full">

                    {/* ── Text side ── */}
                    <div className="flex-1 min-w-0 sm:max-w-[45%]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={slide.id}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            >
                                {/* Category pill */}
                                {slide.categoryNom && (
                                    <span
                                        className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3"
                                        style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)", color: "rgba(0,0,0,0.6)" }}
                                    >
                                        {slide.categoryNom}
                                    </span>
                                )}

                                {/* Product name */}
                                <h2
                                    className="line-clamp-2"
                                    style={{
                                        fontSize: "clamp(22px, 4vw, 36px)",
                                        fontWeight: 700,
                                        lineHeight: 1.1,
                                        fontFamily: "'Playfair Display', Georgia, serif",
                                        color: "rgba(0,0,0,0.82)",
                                    }}
                                >
                                    {slide.nom}
                                </h2>

                                {/* Price */}
                                <p className="mt-3" style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: "rgba(0,0,0,0.7)" }}>
                                    {formatPrice(slide.displayPrice)}
                                </p>

                                {/* Stock indicator */}
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: slide.inStock ? "#22C55E" : "#EF4444" }} />
                                    <span className="text-[12px] font-medium" style={{ color: "rgba(0,0,0,0.5)" }}>
                                        {slide.inStock ? "En stock" : "Épuisé"}
                                    </span>
                                </div>

                                {/* CTA */}
                                <div className="flex items-center gap-3 mt-5">
                                    <button
                                        onClick={() => navigate(`/produit/${slide.id}`)}
                                        className="h-11 px-7 rounded-full text-[13px] font-semibold transition-all hover:scale-[1.03] active:scale-95"
                                        style={{ background: "rgba(0,0,0,0.82)", color: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                                    >
                                        Voir le produit
                                        <ArrowRight className="w-4 h-4 inline-block ml-2" />
                                    </button>
                                    {slide.inStock && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const v = slide.variants.find((v) => v.stockActuel > 0);
                                                if (!v) return;
                                                useCartStore.getState().addItem({
                                                    variantId: v.id, productId: slide.id, productNom: slide.nom,
                                                    variantInfo: [v.taille, v.couleur].filter(Boolean).join(" / ") || "Standard",
                                                    imageUrl: slide.photos[0] ?? undefined,
                                                    prixUnitaire: v.prix > 0 ? v.prix : slide.prixVente,
                                                    quantite: 1, remise: 0,
                                                });
                                                toast.success(`${slide.nom} ajouté au panier`);
                                            }}
                                            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                                            style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", color: "rgba(0,0,0,0.7)" }}
                                            title="Ajouter au panier"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── Image side ── */}
                    <div className="flex-1 flex justify-center sm:justify-end">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={slide.id}
                                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: -20 }}
                                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                                className="relative"
                            >
                                {/* Shadow under image */}
                                <div
                                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full"
                                    style={{ width: "70%", height: 20, background: "rgba(0,0,0,0.08)", filter: "blur(12px)" }}
                                />

                                {/* Product image */}
                                <div
                                    className="relative overflow-hidden"
                                    style={{
                                        width: "clamp(200px, 32vw, 340px)",
                                        height: "clamp(200px, 32vw, 340px)",
                                        borderRadius: 24,
                                        boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.08)",
                                        background: "white",
                                    }}
                                >
                                    {slide.photos[0] ? (
                                        <img
                                            src={slide.photos[0]}
                                            alt={slide.nom}
                                            className="w-full h-full"
                                            style={{ objectFit: "cover", objectPosition: "center" }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center" style={{ background: "#F2EDE6" }}>
                                            <Package className="w-12 h-12" style={{ color: "rgba(0,0,0,0.08)" }} />
                                        </div>
                                    )}
                                </div>

                                {/* Floating price tag */}
                                <div
                                    className="absolute -bottom-2 -left-3 px-4 py-2 rounded-2xl"
                                    style={{
                                        background: "white",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <span className="text-[10px] font-medium block" style={{ color: "var(--sama-warm-muted)" }}>À partir de</span>
                                    <span className="text-[17px] font-bold block" style={{ color: "var(--sama-terra)" }}>{formatPrice(slide.displayPrice)}</span>
                                </div>

                                {/* Floating category tag */}
                                {slide.categoryNom && (
                                    <div
                                        className="absolute -top-2 -right-3 px-3 py-1.5 rounded-xl"
                                        style={{
                                            background: "white",
                                            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--sama-terra)" }}>
                                            {slide.categoryNom}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Navigation arrows ── */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(10px)", color: "rgba(0,0,0,0.55)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(10px)", color: "rgba(0,0,0,0.55)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* ── Dots + counter ── */}
            {slides.length > 1 && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                    <span className="text-[11px] font-semibold" style={{ color: "rgba(0,0,0,0.35)" }}>
                        {String(current + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
                    </span>
                    <div className="flex items-center gap-1.5">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={cn("hero-dot", i === current && "active")}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Progress bar ── */}
            {slides.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] z-20" style={{ background: "rgba(0,0,0,0.06)" }}>
                    <motion.div
                        key={current}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4.5, ease: "linear" }}
                        className="h-full rounded-full"
                        style={{ background: "rgba(0,0,0,0.2)" }}
                    />
                </div>
            )}
        </section>
    );
}

// ─── Category Cards ────────────────────────────────────────────────────────────
function CategoryCards({ categories, onSelect }: {
    categories: { id: string; nom: string; nbProduits: number }[];
    onSelect: (id: string | undefined) => void;
}) {
    if (categories.length === 0) return null;

    return (
        <section className="px-5 xl:px-10 py-6 wurus-bg" style={{ borderBottom: "1px solid rgba(81,49,2,0.06)" }}>
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ background: "#C7932D" }} />
                <h2 style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "#513102" }}>
                    Catégories
                </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                {/* All */}
                <button
                    onClick={() => onSelect(undefined)}
                    className="cat-card flex-none px-5 py-3 rounded-xl text-center"
                    style={{ background: "#513102", border: "1.5px solid #513102", minWidth: 90 }}
                >
                    <span className="block text-[12px] font-bold" style={{ color: "#FFF8EE" }}>Tout</span>
                    <span className="text-[10px]" style={{ color: "rgba(255,248,238,0.70)" }}>voir</span>
                </button>
                {categories.map((cat, i) => {
                    const color = CAT_COLORS[i % CAT_COLORS.length];
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className="cat-card flex-none px-5 py-3 rounded-xl text-center"
                            style={{ background: "rgba(81,49,2,0.05)", border: "1.5px solid rgba(199,147,45,0.20)", minWidth: 100 }}
                        >
                            <span className="block text-[12px] font-bold" style={{ color: "#513102" }}>{cat.nom}</span>
                            <span className="text-[10px] font-medium" style={{ color: "rgba(81,49,2,0.55)" }}>
                                {cat.nbProduits} article{cat.nbProduits > 1 ? "s" : ""}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

// ─── New arrivals (small carousel) ─────────────────────────────────────────────
function NewArrivalsRow({ products }: { products: Product[] }) {
    const [emblaRef] = useEmblaCarousel(
        { loop: true, align: "start", slidesToScroll: 2 },
        [Autoplay({ delay: 3000, stopOnInteraction: false })]
    );

    if (products.length === 0) return null;

    return (
        <section className="px-5 xl:px-10 py-6 wurus-bg" style={{ borderBottom: "1px solid rgba(81,49,2,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-1 h-5 rounded-full" style={{ background: "#C7932D" }} />
                    <h2 style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "#513102" }}>
                        Nouveautés
                    </h2>
                </div>
                <Link to="/catalogue" className="flex items-center gap-1 text-[12px] font-medium hover:opacity-75 transition-opacity" style={{ color: "#C7932D" }}>
                    Tout voir <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-3">
                    {products.slice(0, 12).map((product) => {
                        const price = (product.variants[0]?.prix && product.variants[0].prix > 0) ? product.variants[0].prix : product.prixVente;
                        return (
                            <div key={product.id} className="flex-none w-28 sm:w-32">
                                <Link to={`/produit/${product.id}`} className="block group sama-card">
                                    <div className="relative overflow-hidden" style={{ borderRadius: 12, aspectRatio: "1/1", background: "#F5F0EA" }}>
                                        {product.photos[0] ? (
                                            <img src={product.photos[0]} alt={product.nom} loading="lazy" className="sama-product-img w-full h-full" style={{ objectFit: "cover", objectPosition: "center" }} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5" style={{ color: "rgba(81,49,2,0.10)" }} /></div>
                                        )}
                                        {product.categoryNom && (
                                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wide"
                                                style={{ background: "rgba(199,147,45,0.15)", backdropFilter: "blur(4px)", color: "#513102" }}>
                                                {product.categoryNom}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-1.5 px-0.5">
                                        <p className="font-medium line-clamp-1" style={{ fontSize: 11.5, color: "#513102" }}>{product.nom}</p>
                                        <p className="font-bold mt-0.5" style={{ fontSize: 12, color: "#C7932D" }}>{formatPrice(price)}</p>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ─── Filter section ────────────────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }: {
    title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="sama-filter-section pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <button onClick={() => setOpen((v) => !v)} className="flex items-center justify-between w-full mb-3">
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--sama-warm-muted)" }}>{title}</span>
                {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {open && children}
        </div>
    );
}

function PriceInput({ value, onChange, placeholder }: { value: number | ""; onChange: (v: number | "") => void; placeholder: string }) {
    const [local, setLocal] = useState(String(value === "" ? "" : value));
    useEffect(() => { setLocal(String(value === "" ? "" : value)); }, [value]);
    return (
        <input type="number" min={0} placeholder={placeholder} value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-primary transition-colors"
        />
    );
}

// ─── Scroll to top ─────────────────────────────────────────────────────────────
function ScrollToTop() {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const fn = () => setVisible(window.scrollY > 400);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);
    if (!visible) return null;
    return (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform wurus-btn-primary"
            >
            <ArrowUp className="w-4 h-4" />
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HOME PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryId, setCategoryId] = useState<string | undefined>();
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

    const handleSearch = useCallback(debounce((val: string) => { setDebouncedSearch(val); setPage(1); }, 300), []);

    const availableSizes = useMemo(() => {
        const set = new Set<string>();
        (data?.data ?? []).forEach((p) => p.variants.forEach((v) => { if (v.taille) set.add(v.taille); }));
        return Array.from(set).sort();
    }, [data?.data]);

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
        if (selectedSizes.length > 0) list = list.filter((p) => p.variants.some((v) => v.taille && selectedSizes.includes(v.taille)));
        if (inStockOnly) list = list.filter((p) => p.variants.reduce((s, v) => s + v.stockActuel, 0) > 0);

        list = [...list];
        switch (sort) {
            case "prix_asc": list.sort((a, b) => a.prixVente - b.prixVente); break;
            case "prix_desc": list.sort((a, b) => b.prixVente - a.prixVente); break;
            case "nom_asc": list.sort((a, b) => a.nom.localeCompare(b.nom)); break;
            case "nom_desc": list.sort((a, b) => b.nom.localeCompare(a.nom)); break;
            case "stock": list.sort((a, b) => {
                return b.variants.reduce((s, v) => s + v.stockActuel, 0) - a.variants.reduce((s, v) => s + v.stockActuel, 0);
            }); break;
        }
        return list;
    }, [data?.data, priceMin, priceMax, selectedSizes, inStockOnly, sort]);

    const hasActiveFilters = priceMin !== "" || priceMax !== "" || selectedSizes.length > 0 || inStockOnly || !!categoryId;

    const resetFilters = () => {
        setPriceMin(""); setPriceMax(""); setSelectedSizes([]); setInStockOnly(false); setCategoryId(undefined); setPage(1);
    };
    const toggleSize = (s: string) => setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

    const handleCategorySelect = (id: string | undefined) => { setCategoryId(id); setPage(1); };

    // ─── Sidebar ─────────────────────────────────────────────────────────────────
    const SidebarContent = () => (
        <div>
            <div className="pb-3.5 mb-3.5 sama-filter-section">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search}
                        onChange={(e) => { setSearch(e.target.value); handleSearch(e.target.value); setPage(1); }}
                        placeholder="Chercher…"
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-primary transition-colors"
                    />
                    {search && (
                        <button onClick={() => { setSearch(""); setDebouncedSearch(""); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            <FilterSection title="Catégorie">
                <div className="space-y-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: !categoryId ? "var(--sama-terra)" : "rgba(0,0,0,0.15)", background: !categoryId ? "var(--sama-terra)" : "transparent" }}>
                            {!categoryId && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <input type="radio" name="cat" checked={!categoryId} onChange={() => handleCategorySelect(undefined)} className="sr-only" />
                        <span style={{ fontSize: 14, color: "#513102" }}>Toutes</span>
                    </label>
                    {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer">
                            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                style={{ borderColor: categoryId === cat.id ? "var(--sama-terra)" : "rgba(0,0,0,0.15)", background: categoryId === cat.id ? "var(--sama-terra)" : "transparent" }}>
                                {categoryId === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <input type="radio" name="cat" checked={categoryId === cat.id} onChange={() => handleCategorySelect(cat.id)} className="sr-only" />
                            <span className="flex-1" style={{ fontSize: 14, color: "#513102" }}>{cat.nom}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(0,0,0,0.05)", color: "var(--sama-warm-muted)" }}>{cat.nbProduits}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Prix (F CFA)">
                <div className="flex items-center gap-2">
                    <PriceInput value={priceMin} onChange={(v) => { setPriceMin(v); setPage(1); }} placeholder="Min" />
                    <span className="text-muted-foreground text-xs">–</span>
                    <PriceInput value={priceMax} onChange={(v) => { setPriceMax(v); setPage(1); }} placeholder="Max" />
                </div>
            </FilterSection>

            {availableSizes.length > 0 && (
                <FilterSection title="Taille">
                    <div className="flex flex-wrap gap-2">
                        {availableSizes.map((s) => (
                            <button key={s} onClick={() => toggleSize(s)}
                                className="px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all"
                                style={{
                                    border: selectedSizes.includes(s) ? "1.5px solid var(--sama-terra)" : "1.5px solid rgba(0,0,0,0.1)",
                                    background: selectedSizes.includes(s) ? "rgba(184,77,34,0.08)" : "transparent",
                                    color: selectedSizes.includes(s) ? "var(--sama-terra)" : "var(--sama-warm-muted)",
                                }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            <FilterSection title="Disponibilité" defaultOpen={false}>
                <label className="flex items-center gap-2.5 cursor-pointer">
                    <div className="w-9 h-5 rounded-full relative transition-all flex-shrink-0" style={{ background: inStockOnly ? "var(--sama-terra)" : "rgba(0,0,0,0.1)" }}
                        onClick={() => { setInStockOnly((v) => !v); setPage(1); }}>
                        <div className="absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-all" style={{ left: inStockOnly ? "calc(100% - 18px)" : "2px" }} />
                    </div>
                    <span style={{ fontSize: 14, color: "#513102" }}>En stock</span>
                </label>
            </FilterSection>

            {hasActiveFilters && (
                <button onClick={resetFilters} className="w-full mt-1 h-7 rounded-lg text-[11px] font-semibold transition-all"
                    style={{ border: "1.5px solid rgba(199,147,45,0.30)", color: "var(--sama-terra)", background: "rgba(199,147,45,0.06)" }}>
                    Réinitialiser
                </button>
            )}
        </div>
    );

    const showHero = !debouncedSearch && !categoryId && !hasActiveFilters && page === 1;

    return (
        <>
            <style>{SAMA_STYLES}</style>

            {/* ── Hero Slider ── */}
            {showHero && <HeroSlider products={data?.data ?? []} />}

            {/* ── Category Cards ── */}
            {showHero && <CategoryCards categories={categories} onSelect={handleCategorySelect} />}

            {/* ── New arrivals ── */}
            {/* {showHero && <NewArrivalsRow products={data?.data ?? []} />} */}

            <div className="flex min-h-screen wurus-bg">
                {/* ── Desktop sidebar — compact ── */}
                <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky self-start overflow-y-auto px-5 py-6"
                    style={{ top: 70, height: "calc(100vh - 70px)", borderRight: "1px solid rgba(81,49,2,0.07)", background: "rgba(255,255,255,0.80)", backdropFilter: "blur(12px)" }}>
                    <div className="flex items-center justify-between mb-5">
                        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#513102" }}>Filtres</h2>
                        {hasActiveFilters && <div className="w-2 h-2 rounded-full" style={{ background: "var(--sama-terra)" }} />}
                    </div>
                    <SidebarContent />
                </aside>

                {/* ── Main content — sans padding excessif ── */}
                <div className="flex-1 min-w-0 px-3 sm:px-4 py-5">
                    {/* Topbar */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => setMobileFiltersOpen(true)}
                                className="lg:hidden flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-medium"
                                style={{ border: "1.5px solid rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.6)" }}>
                                <SlidersHorizontal className="w-3 h-3" /> Filtres
                                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--sama-terra)" }} />}
                            </button>

                            <p style={{ fontSize: 12.5, color: "var(--sama-warm-muted)" }}>
                                <span className="font-bold text-foreground">{filtered.length}</span>{" "}
                                {filtered.length === 1 ? "produit" : "produits"}
                                {data?.pagination && data.pagination.totalCount > PAGE_SIZE && <span> sur {data.pagination.totalCount}</span>}
                            </p>

                            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                                {categoryId && (
                                    <span className="sama-chip">
                                        {categories.find((c) => c.id === categoryId)?.nom}
                                        <button onClick={() => setCategoryId(undefined)}><X className="w-3 h-3" /></button>
                                    </span>
                                )}
                                {(priceMin !== "" || priceMax !== "") && (
                                    <span className="sama-chip">
                                        {priceMin !== "" && priceMax !== "" ? `${formatPrice(priceMin as number)} – ${formatPrice(priceMax as number)}`
                                            : priceMin !== "" ? `≥ ${formatPrice(priceMin as number)}` : `≤ ${formatPrice(priceMax as number)}`}
                                        <button onClick={() => { setPriceMin(""); setPriceMax(""); }}><X className="w-3 h-3" /></button>
                                    </span>
                                )}
                                {selectedSizes.map((s) => (
                                    <span key={s} className="sama-chip">{s}<button onClick={() => toggleSize(s)}><X className="w-3 h-3" /></button></span>
                                ))}
                                {inStockOnly && (
                                    <span className="sama-chip">En stock<button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button></span>
                                )}
                            </div>
                        </div>

                        <select value={sort} onChange={(e) => setSort(e.target.value)}
                            className="h-7 pl-2.5 pr-6 rounded-full border border-input bg-background outline-none appearance-none cursor-pointer shrink-0"
                            style={{ fontSize: 11, fontWeight: 500 }}>
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                            {Array.from({ length: 15 }).map((_, i) => <ProductSkeleton key={i} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(184,77,34,0.08)" }}>
                                <Package className="w-5 h-5" style={{ color: "var(--sama-terra)" }} />
                            </div>
                            <p className="font-bold text-foreground mb-1" style={{ fontSize: 14 }}>Aucun produit trouvé</p>
                            <p className="text-muted-foreground mb-4" style={{ fontSize: 12.5 }}>Modifiez vos filtres</p>
                            {hasActiveFilters && (
                                <button onClick={resetFilters} className="px-4 py-1.5 rounded-full text-[12px] font-semibold"
                                    style={{ border: "1.5px solid rgba(199,147,45,0.30)", color: "var(--sama-terra)" }}>
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filtered.map((product, i) => (
                                        <motion.div key={product.id} layout
                                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                                            transition={{ duration: 0.2, delay: Math.min(i * 0.025, 0.25), ease: [0.4, 0, 0.2, 1] }}>
                                            <ProductCard product={product} index={i} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {data?.pagination?.hasNext && (
                                <div className="mt-10 flex justify-center">
                                    <button onClick={() => setPage((p) => p + 1)}
                                        className="px-6 py-2 rounded-full text-[12px] font-semibold transition-all hover:opacity-75"
                                        style={{ border: "1.5px solid rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.6)" }}>
                                        Charger plus
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Mobile filter drawer */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setMobileFiltersOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-64 overflow-y-auto px-4 py-5 shadow-2xl" style={{ background: "#FFF8EE" }}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Filtres</h2>
                            <button onClick={() => setMobileFiltersOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.05)" }}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <SidebarContent />
                    </div>
                </div>
            )}

            <ScrollToTop />
        </>
    );
}