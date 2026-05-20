import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Heart } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { to: "/", label: "Accueil" },
    //{ to: "/catalogue", label: "Catalogue" },
];

// WhatsApp SVG icon
function WhatsAppIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

export function ClientNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [search, setSearch] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchFocus, setSearchFocus] = useState(false);
    const lastScrollY = useRef(0);

    const cartCount = useCartStore((s) => s.totalItems());
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // ── Scroll: hide on down, reveal on up ──────────────────────────────────────
    useEffect(() => {
        const onScroll = () => {
            const currentY = window.scrollY;
            const delta = currentY - lastScrollY.current;

            setScrolled(currentY > 8);

            if (currentY < 80) {
                setVisible(true);
            } else if (delta > 5) {
                setVisible(false); // scrolling down → hide
            } else if (delta < -5) {
                setVisible(true);  // scrolling up → show
            }

            lastScrollY.current = currentY;
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // ── same logic ──────────────────────────────────────────────────────────────
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`);
        setMobileOpen(false);
    };

    return (
        <>
            {/* ── Styles ─────────────────────────────────────────────────────────── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,600;1,500&family=Inter:wght@400;500;600&display=swap');

        .nb-root { font-family: 'Inter', system-ui, sans-serif; }

        /* Ticker */
        .nb-ticker-inner {
          display: inline-flex;
          animation: nbTick 32s linear infinite;
          white-space: nowrap;
        }
        @keyframes nbTick {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* Nav link */
        .nb-link {
          position: relative;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #5A4A3A;
          padding: 4px 0;
          transition: color 0.2s;
        }
        .nb-link::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0; right: 100%;
          height: 1.5px;
          background: #B84D22;
          transition: right 0.3s cubic-bezier(.4,0,.2,1);
        }
        .nb-link:hover, .nb-link.active { color: #1A1410; }
        .nb-link:hover::after, .nb-link.active::after { right: 0; }

        /* Logo brand */
        .nb-brand {
          font-family: 'Cormorant', Georgia, serif;
          font-weight: 600;
          font-size: 21px;
          color: #1A1410;
          line-height: 1;
        }
        .nb-brand em {
          font-style: italic;
          color: #B84D22;
        }

        /* Logo mark */
        .nb-mark {
          width: 38px; height: 38px;
          background: #B84D22;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant', serif;
          font-style: italic; font-weight: 600; font-size: 20px;
          color: white; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(184,77,34,0.30);
          transition: box-shadow 0.2s;
        }
        a:hover .nb-mark { box-shadow: 0 4px 16px rgba(184,77,34,0.45); }

        /* Search pill */
        .nb-search {
          position: relative;
          height: 42px;
          display: flex; align-items: center;
          border: 1.5px solid rgba(90,74,58,0.14);
          border-radius: 100px;
          background: #F5F0EA;
          padding: 0 16px 0 44px;
          transition: width 0.3s ease, border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .nb-search.focused {
          border-color: #B84D22;
          background: white;
          box-shadow: 0 0 0 3px rgba(184,77,34,0.09);
        }
        .nb-search input {
          background: transparent; border: none; outline: none;
          font-size: 13.5px; color: #1A1410; width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .nb-search input::placeholder { color: #9A8675; }
        .nb-search-icon {
          position: absolute; left: 15px; top: 50%;
          transform: translateY(-50%); pointer-events: none;
          transition: color 0.2s;
        }

        /* Icon button */
        .nb-icon {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: #5A4A3A;
          transition: all 0.18s;
          flex-shrink: 0;
          position: relative;
        }
        .nb-icon:hover {
          background: #F5F0EA;
          color: #1A1410;
        }

        /* WhatsApp hover */
        .nb-wa:hover { color: #25D366 !important; background: rgba(37,211,102,0.08) !important; }

        /* Cart badge */
        .nb-badge {
          position: absolute; top: -3px; right: -3px;
          min-width: 18px; height: 18px;
          background: #B84D22; color: white;
          font-size: 10px; font-weight: 700;
          border-radius: 100px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          box-shadow: 0 1px 4px rgba(184,77,34,0.4);
          border: 2px solid white;
        }

        /* Auth button — TOUJOURS VISIBLE */
        .nb-auth {
          height: 38px; padding: 0 18px;
          border-radius: 100px;
          background: #1A1410; color: white;
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.02em;
          transition: all 0.2s;
          white-space: nowrap;
          display: flex; align-items: center;
        }
        .nb-auth:hover {
          background: #B84D22;
          box-shadow: 0 3px 14px rgba(184,77,34,0.35);
          transform: translateY(-1px);
        }

        /* User avatar */
        .nb-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(184,77,34,0.10);
          border: 2px solid rgba(184,77,34,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #B84D22;
          transition: all 0.2s;
        }
        .nb-avatar:hover {
          background: rgba(184,77,34,0.18);
          border-color: rgba(184,77,34,0.45);
        }

        /* Mobile menu */
        @keyframes nbSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nb-mobile-menu { animation: nbSlideDown 0.2s ease; }

        /* Divider */
        .nb-divider {
          width: 1px; height: 22px;
          background: rgba(90,74,58,0.10);
          flex-shrink: 0;
        }
      `}</style>

            {/* ── Outer sticky wrapper — hide/reveal on scroll ────────────────────── */}
            <div
                className="nb-root"
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 40,
                    transform: visible ? "translateY(0)" : "translateY(-110%)",
                    transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
                    willChange: "transform",
                }}
            >
                {/* ── Announcement bar ───────────────────────────────────────────── */}
                <div style={{ background: "#1A1410", height: 30, overflow: "hidden" }}>
                    <div className="nb-ticker-inner h-full items-center">
                        {Array(6).fill(null).map((_, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center h-full px-10"
                                style={{
                                    fontSize: 10.5,
                                    letterSpacing: "0.14em",
                                    color: "rgba(255,255,255,0.45)",
                                    fontWeight: 500,
                                    textTransform: "uppercase",
                                }}
                            >
                                🇸🇳 Fait au Sénégal &nbsp;·&nbsp; Livraison Dakar &nbsp;·&nbsp; Mobile Money &nbsp;·&nbsp; Qualité garantie
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Main navbar ────────────────────────────────────────────────── */}
                <header
                    style={{
                        background: "rgba(253,250,247,0.97)",
                        backdropFilter: "blur(20px)",
                        borderBottom: scrolled
                            ? "1px solid rgba(90,74,58,0.12)"
                            : "1px solid rgba(90,74,58,0.07)",
                        boxShadow: scrolled ? "0 2px 20px rgba(90,74,58,0.08)" : "none",
                        transition: "box-shadow 0.3s, border-color 0.3s",
                    }}
                >
                    <div
                        className="max-w-[1400px] mx-auto flex items-center gap-5"
                        style={{ height: 70, padding: "0 28px" }}
                    >
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 shrink-0">
                            <div className="nb-mark">S</div>
                            <div className="hidden sm:flex flex-col leading-none">
                                <span className="nb-brand">Sama<em>Boutique</em></span>
                                <span style={{ fontSize: 9.5, letterSpacing: "0.2em", color: "#9A8675", textTransform: "uppercase", marginTop: 3 }}>
                                    Dakar · Sénégal
                                </span>
                            </div>
                        </Link>

                        {/* Desktop nav */}
                        <div className="nb-divider hidden lg:block mx-1" />
                        <nav className="hidden lg:flex items-center gap-8">
                            {NAV_LINKS.map(({ to, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={cn("nb-link", location.pathname === to && "active")}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        {/* Flex spacer */}
                        <div className="flex-1" />

                        {/* Search — desktop */}
                        <form onSubmit={handleSearch} className="hidden md:flex">
                            <div
                                className={cn("nb-search", searchFocus && "focused")}
                                style={{ width: searchFocus ? 340 : 290 }}
                            >
                                <Search
                                    className="nb-search-icon"
                                    style={{
                                        width: 16, height: 16,
                                        color: searchFocus ? "#B84D22" : "#9A8675",
                                    }}
                                />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={() => setSearchFocus(true)}
                                    onBlur={() => setSearchFocus(false)}
                                    placeholder="Rechercher un produit…"
                                />
                            </div>
                        </form>

                        {/* Actions */}
                        <div className="flex items-center gap-0.5">

                            {/* Mobile search */}
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="md:hidden nb-icon"
                            >
                                <Search style={{ width: 18, height: 18 }} />
                            </button>

                            {/* Wishlist */}
                            <button className="nb-icon">
                                <Heart style={{ width: 18, height: 18 }} />
                            </button>

                            {/* WhatsApp — juste à côté des favoris */}
                            <a
                                href="https://wa.me/221XXXXXXXXX"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nb-icon nb-wa"
                                title="Nous contacter sur WhatsApp"
                            >
                                <WhatsAppIcon size={18} />
                            </a>

                            <div className="nb-divider mx-1" />

                            {/* Cart */}
                            <Link to="/panier" className="nb-icon">
                                <ShoppingCart style={{ width: 18, height: 18 }} />
                                {cartCount > 0 && (
                                    <span className="nb-badge">{cartCount > 9 ? "9+" : cartCount}</span>
                                )}
                            </Link>

                            <div className="nb-divider mx-1" />

                            {/* Auth — TOUJOURS VISIBLE */}
                            {user ? (
                                <Link to="/compte">
                                    <div className="nb-avatar">
                                        {user.nom?.[0]?.toUpperCase()}
                                    </div>
                                </Link>
                            ) : (
                                <Link to="/login" className="nb-auth ml-1">
                                    Connexion
                                </Link>
                            )}

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden nb-icon ml-1"
                            >
                                {mobileOpen
                                    ? <X style={{ width: 18, height: 18 }} />
                                    : <Menu style={{ width: 18, height: 18 }} />}
                            </button>
                        </div>
                    </div>

                    {/* ── Mobile menu ────────────────────────────────────────────────── */}
                    {mobileOpen && (
                        <div
                            className="nb-mobile-menu lg:hidden"
                            style={{
                                background: "#FDFAF7",
                                borderTop: "1px solid rgba(90,74,58,0.08)",
                                padding: "16px 20px 20px",
                            }}
                        >
                            {/* Mobile search */}
                            <form onSubmit={handleSearch} className="mb-4">
                                <div className={cn("nb-search", "focused")} style={{ width: "100%", minWidth: "unset" }}>
                                    <Search
                                        className="nb-search-icon"
                                        style={{ width: 16, height: 16, color: "#9A8675" }}
                                    />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Rechercher…"
                                        autoFocus
                                    />
                                </div>
                            </form>

                            {/* Mobile links */}
                            <nav className="space-y-1">
                                {[
                                    ...NAV_LINKS,
                                    { to: "/panier", label: `Panier${cartCount > 0 ? ` (${cartCount})` : ""}` },
                                    { to: user ? "/compte" : "/login", label: user ? `Mon compte` : "Connexion" },
                                ].map(({ to, label }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                                        style={{
                                            color: location.pathname === to ? "#B84D22" : "#5A4A3A",
                                            background: location.pathname === to ? "rgba(184,77,34,0.07)" : "transparent",
                                        }}
                                    >
                                        {label}
                                    </Link>
                                ))}
                                {/* WhatsApp mobile */}
                                <a
                                    href="https://wa.me/221XXXXXXXXX"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                                    style={{ color: "#25D366" }}
                                >
                                    <WhatsAppIcon size={16} />
                                    Nous contacter sur WhatsApp
                                </a>
                            </nav>
                        </div>
                    )}
                </header>
            </div>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 lg:hidden"
                    style={{ background: "rgba(26,20,16,0.25)", backdropFilter: "blur(2px)" }}
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
}