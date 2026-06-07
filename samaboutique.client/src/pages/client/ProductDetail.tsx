import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ShoppingCart, ArrowLeft, Check, Package,
    Truck, Shield, Plus, Minus, ChevronLeft, ChevronRight,
    Heart, Share2, Tag,
} from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cart.store";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductVariant } from "@/types";

// ── Animation variants ─────────────────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};
const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};
const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4 } },
};

// ── Related product card ───────────────────────────────────────────────────────
function RelatedCard({ p, currentId, index }: { p: any; currentId?: string; index: number }) {
    const pPrice = (p.variants[0]?.prix && p.variants[0].prix > 0) ? p.variants[0].prix : p.prixVente;
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.06 }}
        >
            <Link to={`/produit/${p.id}`} className="group block">
                <div style={{ borderRadius: 16, overflow: "hidden", background: "#F5F0EA", aspectRatio: "3/4", position: "relative" }}>
                    {p.photos[0] ? (
                        <img
                            src={p.photos[0]} alt={p.nom} loading="lazy"
                            className="w-full h-full object-cover"
                            style={{ transition: "transform 0.55s cubic-bezier(.4,0,.2,1)" }}
                            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package style={{ width: 28, height: 28, color: "rgba(0,0,0,0.15)" }} />
                        </div>
                    )}
                </div>
                <div style={{ marginTop: 10, paddingLeft: 2 }}>
                    <p style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(81,49,2,0.55)", fontWeight: 600 }}>
                        {p.categoryNom}
                    </p>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "#513102", marginTop: 3, lineHeight: 1.4 }}
                        className="line-clamp-2">{p.nom}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#C7932D", marginTop: 5 }}>{formatPrice(pPrice)}</p>
                </div>
            </Link>
        </motion.div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: product, isLoading } = useProduct(id);
    const { data: relatedData } = useProducts({ pageSize: 8, statut: "Actif" });
    const cart = useCartStore();

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [thumbIndex, setThumbIndex] = useState(0);
    const relatedRef = useRef(null);

    const variant = selectedVariant ?? product?.variants?.[0] ?? null;
    const price = (variant?.prix && variant.prix > 0) ? variant.prix : (product?.prixVente ?? 0);
    const variantStock = variant?.stockActuel ?? 0;
    const stockTotal = product?.variants.reduce((s, v) => s + v.stockActuel, 0) ?? 0;
    const inStock = variantStock > 0 || stockTotal > 0;
    const photos = product?.photos ?? [];
    const currentPhoto = selectedPhoto ?? photos[0] ?? null;

    const addToCart = () => {
        if (!product || !variant) return;
        cart.addItem({
            variantId: variant.id,
            productId: product.id,
            productNom: product.nom,
            variantInfo: [variant.taille, variant.couleur].filter(Boolean).join(" / ") || "Standard",
            prixUnitaire: price,
            quantite: quantity,
            remise: 0,
            imageUrl: product.photos[0],
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2200);
    };

    // ── Loading ──────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 28px" }}>
                <LoadingSkeleton variant="page" />
            </div>
        );
    }
    if (!product) {
        return (
            <div style={{ padding: 64, textAlign: "center", color: "rgba(81,49,2,0.55)" }}>Produit introuvable</div>
        );
    }

    const THUMB_VISIBLE = 5;
    const visibleThumbs = photos.slice(thumbIndex, thumbIndex + THUMB_VISIBLE);

    return (
        <>
            <style>{`
        /* Wurus ProductDetail */
        .pd-root { font-family: 'Bricolage Grotesque', 'Instrument Sans', system-ui, sans-serif; }

        .pd-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500;
          color: rgba(81,49,2,0.55);
          transition: color 0.18s;
          padding: 6px 0;
        }
        .pd-back:hover { color: #513102; }

        /* Main image zoom */
        .pd-main-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.7s cubic-bezier(.4,0,.2,1);
        }
        .pd-img-wrap:hover .pd-main-img { transform: scale(1.04); }

        /* Thumbnail */
        .pd-thumb {
          border-radius: 10px; object-fit: cover;
          width: 64px; height: 64px; flex-shrink: 0;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .pd-thumb:hover { border-color: rgba(199,147,45,0.50); }
        .pd-thumb.active {
          border-color: #C7932D;
          box-shadow: 0 0 0 3px rgba(199,147,45,0.20);
        }

        /* Variant pill */
        .pd-variant {
          padding: 7px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 500;
          border: 1.5px solid rgba(81,49,2,0.14);
          background: white; color: rgba(81,49,2,0.70);
          cursor: pointer; transition: all 0.2s;
        }
        .pd-variant:hover:not(:disabled) {
          border-color: #C7932D;
          color: #C7932D;
          background: rgba(199,147,45,0.06);
        }
        .pd-variant.selected {
          border-color: #C7932D;
          background: rgba(199,147,45,0.08);
          color: #513102;
          font-weight: 600;
        }
        .pd-variant:disabled {
          opacity: 0.35; cursor: not-allowed;
          text-decoration: line-through;
        }

        /* Qty controls */
        .pd-qty-btn {
          width: 34px; height: 34px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: #F5F0EA; color: rgba(81,49,2,0.65);
          transition: all 0.18s; flex-shrink: 0;
        }
        .pd-qty-btn:hover { background: #EDE7DF; color: #513102; }

        /* Add to cart */
        .pd-atc {
          flex: 1; height: 50px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 14.5px; font-weight: 700;
          letter-spacing: 0.01em;
          transition: all 0.25s;
          position: relative; overflow: hidden;
        }
        .pd-atc.default {
          background: #513102; color: #FFF8EE;
        }
        .pd-atc.default:hover:not(:disabled) {
          background: #3d2509;
          box-shadow: 0 6px 24px rgba(81,49,2,0.35);
          transform: translateY(-1px);
        }
        .pd-atc.success { background: #2D7A4F; color: white; }
        .pd-atc:disabled { background: #EDE7DF; color: rgba(81,49,2,0.40); cursor: not-allowed; }

        /* Trust badges */
        .pd-trust {
          display: flex; align-items: center; gap: 8px;
          font-size: 12.5px; color: rgba(81,49,2,0.55);
          padding: 10px 14px; border-radius: 10px;
          background: #F5F0EA;
          flex: 1;
        }

        /* Sticky info panel */
        @media (min-width: 1024px) {
          .pd-info-sticky {
            position: sticky;
            top: 100px;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
            scrollbar-width: none;
          }
          .pd-info-sticky::-webkit-scrollbar { display: none; }
        }

        /* Related carousel scroll */
        .pd-related-scroll {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .pd-related-scroll { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .pd-related-scroll { grid-template-columns: repeat(2, 1fr); }
        }

        /* Main product grid */
        .pd-product-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          padding-bottom: 64px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .pd-product-grid {
            grid-template-columns: 480px 1fr;
            gap: 48px;
          }
        }
        @media (min-width: 1280px) {
          .pd-product-grid { grid-template-columns: 520px 1fr; }
        }
        .pd-gallery-col { width: 100%; }
        .pd-img-wrap-outer {
          width: 100%;
          height: 420px;
          max-height: 65vh;
          border-radius: 20px;
          background: #F5F0EA;
          overflow: hidden;
          position: relative;
        }
        @media (min-width: 1024px) {
          .pd-img-wrap-outer { height: 500px; max-height: 70vh; }
        }

        /* Section divider */
        .pd-divider {
          border: none; height: 1px;
          background: linear-gradient(to right, transparent, rgba(81,49,2,0.08) 30%, rgba(81,49,2,0.08) 70%, transparent);
          margin: 0;
        }

        /* Wishlist / share */
        .pd-action-icon {
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid rgba(81,49,2,0.12);
          background: white; color: rgba(81,49,2,0.55);
          transition: all 0.2s; flex-shrink: 0;
        }
        .pd-action-icon:hover {
          border-color: #C7932D;
          color: #C7932D;
          background: rgba(199,147,45,0.06);
        }
      `}</style>

            <div className="pd-root wurus-bg" style={{ minHeight: "100vh" }}>
                <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px" }}>

                    {/* ── Breadcrumb / back ──────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35 }}
                        style={{ paddingTop: 28, paddingBottom: 24 }}
                    >
                        <button onClick={() => navigate(-1)} className="pd-back">
                            <ArrowLeft style={{ width: 15, height: 15 }} />
                            Retour
                        </button>
                        <span style={{ margin: "0 8px", color: "rgba(81,49,2,0.25)", fontSize: 13 }}>·</span>
                        <span style={{ fontSize: 13, color: "rgba(81,49,2,0.55)" }}>{product.categoryNom}</span>
                        <span style={{ margin: "0 8px", color: "rgba(81,49,2,0.25)", fontSize: 13 }}>·</span>
                        <span style={{ fontSize: 13, color: "#513102", fontWeight: 500 }}
                            className="line-clamp-1">{product.nom}</span>
                    </motion.div>

                    {/* ── Main grid ─────────────────────────────────────────────────── */}
                    <div className="pd-product-grid">

                        {/* ── Left: Gallery ────────────────────────────────────────────── */}
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                            className="space-y-3 pd-gallery-col"
                        >
                            {/* Main image */}
                            <motion.div variants={fadeIn}>
                                <div className="pd-img-wrap-outer pd-img-wrap">
                                    <AnimatePresence mode="wait" initial={false}>
                                        {currentPhoto ? (
                                            <motion.img
                                                key={currentPhoto}
                                                src={currentPhoto}
                                                alt={product.nom}
                                                initial={{ opacity: 0, scale: 1.03 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                                                className="pd-main-img absolute inset-0"
                                            />
                                        ) : (
                                            <motion.div
                                                key="placeholder"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="w-full h-full flex items-center justify-center"
                                            >
                                                <Package style={{ width: 56, height: 56, color: "rgba(0,0,0,0.1)" }} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Out of stock overlay */}
                                    {!inStock && (
                                        <div style={{
                                            position: "absolute", inset: 0,
                                            background: "rgba(253,250,247,0.65)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <span style={{
                                                background: "#513102", color: "white",
                                                padding: "8px 20px", borderRadius: 10,
                                                fontSize: 13, fontWeight: 600, letterSpacing: "0.04em",
                                            }}>ÉPUISÉ</span>
                                        </div>
                                    )}

                                    {/* Top right actions */}
                                    <div style={{ position: "absolute", top: 14, right: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                                        <button className="pd-action-icon">
                                            <Heart style={{ width: 17, height: 17 }} />
                                        </button>
                                        <button className="pd-action-icon">
                                            <Share2 style={{ width: 17, height: 17 }} />
                                        </button>
                                    </div>

                                    {/* Category tag */}
                                    <div style={{
                                        position: "absolute", bottom: 14, left: 14,
                                        display: "flex", alignItems: "center", gap: 5,
                                        background: "rgba(253,250,247,0.92)", backdropFilter: "blur(8px)",
                                        padding: "5px 10px", borderRadius: 8,
                                    }}>
                                        <Tag style={{ width: 11, height: 11, color: "#C7932D" }} />
                                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(81,49,2,0.70)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                            {product.categoryNom}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Thumbnails */}
                            {photos.length > 1 && (
                                <motion.div variants={fadeUp} className="flex items-center gap-2">
                                    {thumbIndex > 0 && (
                                        <button onClick={() => setThumbIndex(i => i - 1)} className="pd-qty-btn flex-shrink-0">
                                            <ChevronLeft style={{ width: 14, height: 14 }} />
                                        </button>
                                    )}
                                    <div className="flex gap-2 flex-1 overflow-hidden">
                                        {visibleThumbs.map((url, i) => (
                                            <motion.img
                                                key={url}
                                                src={url}
                                                alt=""
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => setSelectedPhoto(url)}
                                                className={cn("pd-thumb", currentPhoto === url && "active")}
                                            />
                                        ))}
                                    </div>
                                    {thumbIndex + THUMB_VISIBLE < photos.length && (
                                        <button onClick={() => setThumbIndex(i => i + 1)} className="pd-qty-btn flex-shrink-0">
                                            <ChevronRight style={{ width: 14, height: 14 }} />
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>

                        {/* ── Right: Info ───────────────────────────────────────────────── */}
                        <div className="pd-info-sticky">
                            <motion.div
                                variants={stagger}
                                initial="hidden"
                                animate="show"
                                className="space-y-6"
                            >
                                {/* Header */}
                                <motion.div variants={fadeUp}>
                                    <p style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C7932D", marginBottom: 8 }}>
                                        {product.categoryNom}
                                    </p>
                                    <h1 style={{
                                        fontFamily: "'Playfair Display', Georgia, serif",
                                        fontSize: "clamp(28px, 3.5vw, 40px)",
                                        fontWeight: 700, lineHeight: 1.15,
                                        color: "#513102", marginBottom: 14,
                                    }}>
                                        {product.nom}
                                    </h1>

                                    {/* Price */}
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                                        <span style={{
                                            fontSize: 32, fontWeight: 800,
                                            color: "#513102", lineHeight: 1,
                                            fontFamily: "'Bricolage Grotesque', sans-serif",
                                        }}>
                                            {formatPrice(price)}
                                        </span>
                                    </div>
                                </motion.div>

                                <hr className="pd-divider" />

                                {/* Stock status */}
                                <motion.div variants={fadeUp}>
                                    <div style={{
                                        display: "inline-flex", alignItems: "center", gap: 7,
                                        padding: "7px 14px", borderRadius: 10,
                                        background: inStock ? "rgba(45,122,79,0.08)" : "rgba(184,50,50,0.08)",
                                        border: `1px solid ${inStock ? "rgba(45,122,79,0.18)" : "rgba(184,50,50,0.18)"}`,
                                    }}>
                                        <div style={{
                                            width: 7, height: 7, borderRadius: "50%",
                                            background: inStock ? "#2D7A4F" : "#B83232",
                                            boxShadow: inStock ? "0 0 0 3px rgba(45,122,79,0.2)" : "0 0 0 3px rgba(184,50,50,0.2)",
                                        }} />
                                        <span style={{
                                            fontSize: 13, fontWeight: 600,
                                            color: inStock ? "#2D7A4F" : "#B83232",
                                        }}>
                                            {inStock
                                                ? `En stock — ${variantStock > 0 ? variantStock : stockTotal} disponible(s)`
                                                : "Rupture de stock"}
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Description */}
                                {product.description && (
                                    <motion.p variants={fadeUp} style={{ fontSize: 14.5, lineHeight: 1.75, color: "#7A6A5A" }}>
                                        {product.description}
                                    </motion.p>
                                )}

                                {/* Variants */}
                                {product.variants.length > 1 && (
                                    <motion.div variants={fadeUp}>
                                        <p style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(81,49,2,0.70)", marginBottom: 10, letterSpacing: "0.04em" }}>
                                            Variante sélectionnée
                                            {variant && (
                                                <span style={{ marginLeft: 6, fontWeight: 400, color: "rgba(81,49,2,0.55)" }}>
                                                    — {[variant.taille, variant.couleur].filter(Boolean).join(" / ") || "Standard"}
                                                </span>
                                            )}
                                        </p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                            {product.variants.map((v) => (
                                                <motion.button
                                                    key={v.id}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setSelectedVariant(v)}
                                                    disabled={v.isRupture}
                                                    className={cn("pd-variant", variant?.id === v.id && "selected")}
                                                >
                                                    {[v.taille, v.couleur].filter(Boolean).join(" / ") || "Standard"}
                                                    {v.prix > 0 && v.prix !== product.prixVente && (
                                                        <span style={{ marginLeft: 6, opacity: 0.6 }}>— {formatPrice(v.prix)}</span>
                                                    )}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Quantity + Add to cart */}
                                <motion.div variants={fadeUp}>
                                    <p style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(81,49,2,0.70)", marginBottom: 10, letterSpacing: "0.04em" }}>
                                        Quantité
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        {/* Qty */}
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: 0,
                                            border: "1.5px solid rgba(90,74,58,0.12)",
                                            borderRadius: 12, background: "white", overflow: "hidden",
                                        }}>
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="pd-qty-btn"
                                                style={{ borderRadius: 0, background: "transparent" }}
                                            >
                                                <Minus style={{ width: 14, height: 14 }} />
                                            </button>
                                            <span style={{
                                                width: 42, textAlign: "center",
                                                fontSize: 15, fontWeight: 700, color: "#513102",
                                            }}>
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(Math.min(variantStock || 99, quantity + 1))}
                                                className="pd-qty-btn"
                                                style={{ borderRadius: 0, background: "transparent" }}
                                            >
                                                <Plus style={{ width: 14, height: 14 }} />
                                            </button>
                                        </div>

                                        {/* Add to cart */}
                                        <motion.button
                                            whileTap={{ scale: 0.97 }}
                                            onClick={addToCart}
                                            disabled={!inStock || !variant}
                                            className={cn("pd-atc", added ? "success" : "default")}
                                        >
                                            <AnimatePresence mode="wait">
                                                {added ? (
                                                    <motion.span
                                                        key="added"
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -8 }}
                                                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                                                    >
                                                        <Check style={{ width: 18, height: 18 }} />
                                                        Ajouté au panier !
                                                    </motion.span>
                                                ) : (
                                                    <motion.span
                                                        key="add"
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -8 }}
                                                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                                                    >
                                                        <ShoppingCart style={{ width: 18, height: 18 }} />
                                                        Ajouter au panier
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>

                                        {/* WhatsApp — commander via WhatsApp */}
                                        <motion.a
                                            whileTap={{ scale: 0.95 }}
                                            href={(() => {
                                                const msg = encodeURIComponent(
                                                    `Bonjour SamaBoutique ! 👋\n\n` +
                                                    `Je suis intéressé(e) par ce produit :\n\n` +
                                                    `📦 *${product.nom}*\n` +
                                                    `🏷️ Variante : ${[variant?.taille, variant?.couleur].filter(Boolean).join(" / ") || "Standard"}\n` +
                                                    `💰 Prix : ${formatPrice(price)}\n` +
                                                    `📂 Catégorie : ${product.categoryNom}\n\n` +
                                                    `Pouvez-vous me donner plus d'informations ? 🙏`
                                                );
                                                return `https://wa.me/221XXXXXXXXX?text=${msg}`;
                                            })()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Commander via WhatsApp"
                                            style={{
                                                width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                background: "#25D366",
                                                boxShadow: "0 3px 12px rgba(37,211,102,0.35)",
                                                transition: "all 0.2s",
                                                color: "white",
                                            }}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLElement).style.background = "#1DAA57";
                                                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                                                (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(37,211,102,0.45)";
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLElement).style.background = "#25D366";
                                                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                                                (e.currentTarget as HTMLElement).style.boxShadow = "0 3px 12px rgba(37,211,102,0.35)";
                                            }}
                                        >
                                            {/* WhatsApp SVG */}
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                        </motion.a>

                                        {/* Wishlist */}
                                        <motion.button whileTap={{ scale: 0.9 }} className="pd-action-icon">
                                            <Heart style={{ width: 18, height: 18 }} />
                                        </motion.button>
                                    </div>
                                </motion.div>

                                {/* Trust badges */}
                                <motion.div variants={fadeUp} style={{ display: "flex", gap: 10 }}>
                                    {[
                                        { icon: Truck, label: "Livraison Dakar 24-48h" },
                                        { icon: Shield, label: "Paiement sécurisé" },
                                    ].map(({ icon: Icon, label }) => (
                                        <div key={label} className="pd-trust">
                                            <Icon style={{ width: 15, height: 15, color: "#C7932D", flexShrink: 0 }} />
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Detail info */}
                                <motion.div
                                    variants={fadeUp}
                                    style={{
                                        background: "white",
                                        border: "1px solid rgba(90,74,58,0.09)",
                                        borderRadius: 14, padding: "16px 18px",
                                    }}
                                >
                                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(81,49,2,0.55)", marginBottom: 12 }}>
                                        Détails produit
                                    </p>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                                        {[
                                            { k: "Référence", v: product.codeBarres ?? "—" },
                                            { k: "Catégorie", v: product.categoryNom },
                                            { k: "Stock", v: `${stockTotal} unité(s)` },
                                            { k: "Disponible", v: inStock ? "Oui" : "Non" },
                                        ].map(({ k, v }) => (
                                            <div key={k}>
                                                <p style={{ fontSize: 11, color: "rgba(81,49,2,0.55)", fontWeight: 500, marginBottom: 2 }}>{k}</p>
                                                <p style={{ fontSize: 13, color: "#513102", fontWeight: 600 }}>{v}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                            </motion.div>
                        </div>
                    </div>

                    {/* ── Related products ──────────────────────────────────────────── */}
                    {relatedData?.data && relatedData.data.filter(p => p.id !== id).length > 0 && (
                        <div ref={relatedRef} style={{ paddingBottom: 60 }}>
                            <hr className="pd-divider" style={{ marginBottom: 48 }} />

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.5 }}
                                style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}
                            >
                                <div>
                                    <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(81,49,2,0.55)", fontWeight: 600, marginBottom: 6 }}>
                                        Découvrir aussi
                                    </p>
                                    <h2 style={{
                                        fontFamily: "'Playfair Display', Georgia, serif",
                                        fontSize: 30, fontWeight: 700, color: "#513102", lineHeight: 1.1,
                                        fontStyle: "italic",
                                    }}>
                                        Vous aimerez aussi
                                    </h2>
                                </div>
                                <Link to="/catalogue" style={{ fontSize: 13, fontWeight: 600, color: "#C7932D", display: "flex", alignItems: "center", gap: 4 }}>
                                    Voir tout →
                                </Link>
                            </motion.div>

                            <div className="pd-related-scroll">
                                {relatedData.data
                                    .filter(p => p.id !== id)
                                    .slice(0, 5)
                                    .map((p, i) => (
                                        <RelatedCard key={p.id} p={p} currentId={id} index={i} />
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}