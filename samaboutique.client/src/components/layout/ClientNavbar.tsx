import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Heart, Sun, Moon, Package, LogOut } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import { useTheme } from "@/hooks/useTheme";
import { useLogout } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

const NAV_LINKS_BASE = [
    { to: "/", label: "Accueil", exact: true },
];
const NAV_LINKS_AUTH = [
    { to: "/favoris", label: "Favoris", exact: false },
    { to: "/compte", label: "Mes commandes", exact: false },
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
    const favCount = useWishlistStore((s) => s.productIds.length);
    const { user } = useAuthStore();
    const { theme, toggleTheme } = useTheme();
    const logoutMutation = useLogout();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useClickOutside<HTMLDivElement>(() => setProfileOpen(false), profileOpen);
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
        /* Wurus Navbar */
        .nb-root { font-family: 'Bricolage Grotesque', 'Instrument Sans', system-ui, sans-serif; }

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
          color: rgba(81,49,2,0.70);
          padding: 4px 0;
          transition: color 0.2s;
        }
        .nb-link::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0; right: 100%;
          height: 1.5px;
          background: #C7932D;
          transition: right 0.3s cubic-bezier(.4,0,.2,1);
        }
        .nb-link:hover, .nb-link.active { color: #C7932D; }
        .nb-link:hover::after, .nb-link.active::after { right: 0; }

        /* Logo brand */
        .nb-brand {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 21px;
          color: #513102;
          line-height: 1;
        }
        .nb-brand em {
          font-style: italic;
          color: #C7932D;
        }

        /* Logo mark */
        .nb-mark {
          width: 38px; height: 38px;
          background: #513102;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-style: italic; font-weight: 700; font-size: 20px;
          color: #FFF8EE; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(81,49,2,0.30);
          transition: box-shadow 0.2s;
        }
        a:hover .nb-mark { box-shadow: 0 4px 16px rgba(81,49,2,0.45); }

        /* Search pill */
        .nb-search {
          position: relative;
          height: 42px;
          display: flex; align-items: center;
          border: 1.5px solid rgba(199,147,45,0.25);
          border-radius: 100px;
          background: rgba(255,248,238,0.80);
          padding: 0 16px 0 44px;
          transition: width 0.3s ease, border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .nb-search.focused {
          border-color: #C7932D;
          background: white;
          box-shadow: 0 0 0 3px rgba(199,147,45,0.15);
        }
        .nb-search input {
          background: transparent; border: none; outline: none;
          font-size: 13.5px; color: #513102; width: 100%;
          font-family: 'Bricolage Grotesque', sans-serif;
        }
        .nb-search input::placeholder { color: rgba(81,49,2,0.40); }
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
          color: rgba(81,49,2,0.65);
          transition: all 0.18s;
          flex-shrink: 0;
          position: relative;
        }
        .nb-icon:hover {
          background: rgba(199,147,45,0.10);
          color: #513102;
        }

        /* WhatsApp hover */
        .nb-wa:hover { color: #25D366 !important; background: rgba(37,211,102,0.08) !important; }

        /* Cart badge */
        .nb-badge {
          position: absolute; top: -3px; right: -3px;
          min-width: 18px; height: 18px;
          background: #C7932D; color: white;
          font-size: 10px; font-weight: 700;
          border-radius: 100px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          box-shadow: 0 1px 4px rgba(199,147,45,0.4);
          border: 2px solid white;
        }

        /* Auth button — TOUJOURS VISIBLE */
        .nb-auth {
          height: 38px; padding: 0 18px;
          border-radius: 100px;
          background: transparent;
          border: 1.5px solid rgba(199,147,45,0.40);
          color: #513102;
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.02em;
          transition: all 0.2s;
          white-space: nowrap;
          display: flex; align-items: center;
        }
        .nb-auth:hover {
          background: #513102;
          color: #FFF8EE;
          border-color: #513102;
          box-shadow: 0 3px 14px rgba(81,49,2,0.25);
          transform: translateY(-1px);
        }

        /* User avatar */
        .nb-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(199,147,45,0.10);
          border: 2px solid rgba(199,147,45,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #C7932D;
          transition: all 0.2s;
          font-family: 'Playfair Display', serif;
        }
        .nb-avatar:hover {
          background: rgba(199,147,45,0.18);
          border-color: rgba(199,147,45,0.55);
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
          background: rgba(81,49,2,0.08);
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
                <div style={{ background: "#513102", height: 30, overflow: "hidden" }}>
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
                        background: "rgba(255,248,238,0.92)",
                        backdropFilter: "blur(12px)",
                        borderBottom: scrolled
                            ? "1px solid rgba(81,49,2,0.08)"
                            : "1px solid rgba(81,49,2,0.04)",
                        boxShadow: scrolled ? "0 2px 20px rgba(81,49,2,0.06)" : "none",
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
                                <span style={{ fontSize: 9.5, letterSpacing: "0.2em", color: "rgba(81,49,2,0.40)", textTransform: "uppercase", marginTop: 3 }}>
                                    Dakar · Sénégal
                                </span>
                            </div>
                        </Link>

                        {/* Desktop nav */}
                        <div className="nb-divider hidden lg:block mx-1" />
                        <nav className="hidden lg:flex items-center gap-8">
                            {[
                                ...NAV_LINKS_BASE,
                                ...(user ? NAV_LINKS_AUTH : []),
                            ].map(({ to, label, exact }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={cn("nb-link", (exact ? location.pathname === to : location.pathname.startsWith(to)) && "active")}
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
                                        color: searchFocus ? "#C7932D" : "rgba(81,49,2,0.40)",
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

                            {/* Mode sombre */}
                            <button onClick={toggleTheme} className="nb-icon" title={theme === "dark" ? "Mode clair" : "Mode sombre"} aria-label="Changer le thème">
                                {theme === "dark"
                                    ? <Sun style={{ width: 18, height: 18 }} />
                                    : <Moon style={{ width: 18, height: 18 }} />}
                            </button>

                            {/* Wishlist */}
                            <Link to={user ? "/favoris" : "/login"} className="nb-icon" title="Mes favoris">
                                <Heart style={{ width: 18, height: 18 }} />
                                {favCount > 0 && (
                                    <span className="nb-badge">{favCount > 9 ? "9+" : favCount}</span>
                                )}
                            </Link>

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
                                <div className="relative" ref={profileRef}>
                                    <button onClick={() => setProfileOpen((v) => !v)} aria-label="Mon compte">
                                        <div className="nb-avatar">{user.nom?.[0]?.toUpperCase()}</div>
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 rounded-2xl overflow-hidden"
                                            style={{
                                                top: "calc(100% + 10px)", width: 230, zIndex: 60,
                                                background: "var(--w-surface, #FFF8EE)",
                                                border: "1px solid rgba(81,49,2,0.08)",
                                                boxShadow: "0 12px 40px rgba(81,49,2,0.15)",
                                                animation: "nbSlideDown 0.18s ease",
                                            }}>
                                            {/* En-tête */}
                                            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(81,49,2,0.06)" }}>
                                                <div className="nb-avatar" style={{ width: 40, height: 40 }}>{user.nom?.[0]?.toUpperCase()}</div>
                                                <div className="min-w-0">
                                                    <p className="truncate" style={{ fontSize: 14, fontWeight: 700, color: "#513102" }}>{user.nom}</p>
                                                    <p className="truncate" style={{ fontSize: 12, color: "rgba(81,49,2,0.50)" }}>{(user as any).telephone ?? user.email}</p>
                                                </div>
                                            </div>
                                            {/* Liens */}
                                            <div className="py-1.5">
                                                {[
                                                    { icon: Package, label: "Mes commandes", to: "/compte" },
                                                    { icon: Heart, label: "Mes favoris", to: "/favoris" },
                                                ].map(({ icon: Icon, label, to }) => (
                                                    <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                                                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.06)"; }}
                                                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                                                        <Icon style={{ width: 17, height: 17, color: "rgba(81,49,2,0.55)" }} />
                                                        <span style={{ fontSize: 14, color: "#513102" }}>{label}</span>
                                                    </Link>
                                                ))}
                                                {/* Mode sombre */}
                                                <div className="flex items-center justify-between px-4 py-2.5">
                                                    <div className="flex items-center gap-3">
                                                        {theme === "dark" ? <Sun style={{ width: 17, height: 17, color: "rgba(81,49,2,0.55)" }} /> : <Moon style={{ width: 17, height: 17, color: "rgba(81,49,2,0.55)" }} />}
                                                        <span style={{ fontSize: 14, color: "#513102" }}>Mode sombre</span>
                                                    </div>
                                                    <button onClick={toggleTheme} className="relative rounded-full transition-all"
                                                        style={{ width: 38, height: 21, background: theme === "dark" ? "#C7932D" : "rgba(81,49,2,0.15)" }}>
                                                        <span className="absolute top-0.5 rounded-full bg-white shadow transition-transform"
                                                            style={{ width: 17, height: 17, left: theme === "dark" ? 19 : 2 }} />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Déconnexion */}
                                            <div className="py-1.5" style={{ borderTop: "1px solid rgba(81,49,2,0.06)" }}>
                                                <button onClick={() => { setProfileOpen(false); logoutMutation.mutate(); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.06)"; }}
                                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                                                    <LogOut style={{ width: 17, height: 17, color: "#DC2626" }} />
                                                    <span style={{ fontSize: 14, fontWeight: 500, color: "#DC2626" }}>Déconnexion</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="nb-auth ml-1">
                                    Connexion
                                </Link>
                            )}

                            {/* Hamburger — all screens */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="nb-icon ml-1"
                            >
                                {mobileOpen
                                    ? <X style={{ width: 18, height: 18 }} />
                                    : <Menu style={{ width: 18, height: 18 }} />}
                            </button>
                        </div>
                    </div>

                    {/* ── Mobile / Desktop slide menu ────────────────────────────────── */}
                    {mobileOpen && (
                        <div
                            className="nb-mobile-menu"
                            style={{
                                background: "#FFF8EE",
                                borderTop: "1px solid rgba(81,49,2,0.08)",
                                padding: "16px 20px 20px",
                            }}
                        >
                            {/* Mobile search */}
                            <form onSubmit={handleSearch} className="mb-4">
                                <div className={cn("nb-search", "focused")} style={{ width: "100%", minWidth: "unset" }}>
                                    <Search
                                        className="nb-search-icon"
                                        style={{ width: 16, height: 16, color: "rgba(81,49,2,0.40)" }}
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
                                    ...NAV_LINKS_BASE,
                                    { to: "/panier", label: `Panier${cartCount > 0 ? ` (${cartCount})` : ""}`, exact: false },
                                    ...(user ? [
                                        { to: "/favoris", label: `Favoris${favCount > 0 ? ` (${favCount})` : ""}`, exact: false },
                                        { to: "/compte", label: "Mes commandes", exact: false },
                                    ] : []),
                                    { to: user ? "/compte" : "/login", label: user ? `Mon compte (${user.nom?.split(" ")[0]})` : "Connexion", exact: false },
                                ].map(({ to, label }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                                        style={{
                                            color: location.pathname === to ? "#C7932D" : "rgba(81,49,2,0.70)",
                                            background: location.pathname === to ? "rgba(199,147,45,0.08)" : "transparent",
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

            {/* Backdrop (all screen sizes) */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30"
                    style={{ background: "rgba(26,20,16,0.25)", backdropFilter: "blur(2px)" }}
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
}