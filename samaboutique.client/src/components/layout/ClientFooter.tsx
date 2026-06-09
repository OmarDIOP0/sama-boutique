import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight, ChevronRight } from "lucide-react";

/* ── Charte warm ─────────────────────────────────────────────────────────── */
const BG_MAIN = "#1A0E06";
const CREAM = "#FFF8EE";
const GOLD = "#C7932D";
const MUTED = "rgba(255,248,238,0.55)";
const BORDER = "rgba(255,248,238,0.08)";

/* ── Icônes réseaux ───────────────────────────────────────────────────────── */
function IconInstagram() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
        </svg>
    );
}
function IconFacebook() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
    );
}
function IconTikTok() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
        </svg>
    );
}
function IconWhatsApp() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

const SOCIALS = [
    { Icon: IconInstagram, href: "#", label: "Instagram" },
    { Icon: IconFacebook, href: "#", label: "Facebook" },
    { Icon: IconTikTok, href: "#", label: "TikTok" },
    { Icon: IconWhatsApp, href: "https://wa.me/221770000000", label: "WhatsApp" },
];

const COL_BOUTIQUE = [
    { to: "/", label: "Accueil" },
    { to: "/catalogue", label: "Catalogue" },
    { to: "/catalogue?new=true", label: "Nouveautés" },
    { to: "/catalogue?promo=1", label: "Promotions" },
];

const COL_AIDE = [
    { href: "#", label: "Comment commander" },
    { href: "#", label: "Livraison & délais" },
    { href: "#", label: "Retours & échanges" },
    { href: "#", label: "FAQ" },
];

const PAYMENTS = [
    { label: "Orange Money", color: "#FF6600", bg: "rgba(255,102,0,0.15)", border: "rgba(255,102,0,0.30)" },
    { label: "Wave", color: "#0088CC", bg: "rgba(0,136,204,0.12)", border: "rgba(0,136,204,0.30)" },
    { label: "DexPay", color: GOLD, bg: "rgba(199,147,45,0.12)", border: "rgba(199,147,45,0.30)" },
    { label: "Carte", color: "rgba(255,248,238,0.60)", bg: "rgba(255,248,238,0.06)", border: "rgba(255,248,238,0.15)" },
];

const STRIP = "linear-gradient(to right, transparent 0%, #C7932D 30%, #E8A93E 50%, #C7932D 70%, transparent 100%)";

export function ClientFooter() {
    return (
        <footer style={{ background: BG_MAIN, color: MUTED, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <style>{`
        .wft-link {
          font-size: 14px; color: rgba(255,248,238,0.65); cursor: pointer;
          display: inline-flex; align-items: center; gap: 4px;
          transition: color .2s ease, transform .2s ease;
        }
        .wft-link:hover { color: ${GOLD}; transform: translateX(4px); }
        .wft-link .wft-chev { width: 0; opacity: 0; transition: opacity .2s ease, width .2s ease; }
        .wft-link:hover .wft-chev { width: 14px; opacity: 1; }

        .wft-heading {
          font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: ${GOLD}; margin-bottom: 20px;
        }

        .wft-social {
          width: 40px; height: 40px; border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          background: rgba(255,248,238,0.06); border: 1px solid rgba(255,248,238,0.10);
          color: rgba(255,248,238,0.55); transition: all .2s ease;
        }
        .wft-social:hover {
          background: rgba(199,147,45,0.20); border-color: rgba(199,147,45,0.40);
          color: ${GOLD}; transform: scale(1.05);
        }

        .wft-input {
          flex: 1; height: 48px; background: rgba(255,248,238,0.06);
          border: 1px solid rgba(255,248,238,0.12); border-radius: 12px 0 0 12px;
          padding: 0 16px; font-size: 14px; color: ${CREAM}; outline: none;
          font-family: inherit; transition: border-color .2s ease, box-shadow .2s ease;
        }
        .wft-input::placeholder { color: rgba(255,248,238,0.35); }
        .wft-input:focus { border-color: ${GOLD}; box-shadow: 0 0 0 3px rgba(199,147,45,0.20); }

        .wft-send {
          width: 52px; height: 48px; background: ${GOLD}; border-radius: 0 12px 12px 0;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          cursor: pointer; transition: background .2s ease;
        }
        .wft-send:hover { background: #b08024; }

        .wft-pay {
          font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 8px;
          white-space: nowrap; cursor: default;
        }

        .wft-contact { transition: color .18s ease; }
      `}</style>

            {/* Bande décorative haut */}
            <div style={{ height: 3, background: STRIP }} />

            {/* Contenu principal */}
            <div className="max-w-[1400px] mx-auto px-6 pt-14 pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

                    {/* ── COLONNE 1 — Logo + Newsletter ── */}
                    <div className="sm:col-span-2 lg:col-span-4">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-5">
                            <div style={{
                                width: 44, height: 44, background: GOLD, borderRadius: 12,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "'Bricolage Grotesque', sans-serif", fontStyle: "italic",
                                fontWeight: 800, fontSize: 22, color: CREAM,
                                boxShadow: "0 3px 14px rgba(199,147,45,0.40)",
                            }}>S</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 21, color: CREAM, lineHeight: 1 }}>
                                    Sama<em style={{ fontStyle: "italic", color: GOLD, fontWeight: 700 }}>Boutique</em>
                                </div>
                                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,248,238,0.45)", textTransform: "uppercase", marginTop: 4 }}>
                                    Dakar · Sénégal
                                </div>
                            </div>
                        </div>

                        {/* Tagline */}
                        <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,248,238,0.65)", maxWidth: 300, marginBottom: 24 }}>
                            Mode &amp; élégance authentique,<br />
                            sourcées localement avec fierté.
                        </p>

                        {/* Réseaux sociaux */}
                        <div className="flex items-center gap-2.5 mb-8">
                            {SOCIALS.map(({ Icon, href, label }) => (
                                <a key={label} href={href} aria-label={label}
                                    target={href.startsWith("http") ? "_blank" : undefined}
                                    rel="noopener noreferrer" className="wft-social">
                                    <Icon />
                                </a>
                            ))}
                        </div>

                        {/* Newsletter */}
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, marginBottom: 5 }}>
                                Newsletter
                            </p>
                            <p style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>
                                Nouveautés &amp; offres exclusives
                            </p>
                            <form onSubmit={(e) => e.preventDefault()} className="flex" style={{ maxWidth: 360 }}>
                                <input type="email" placeholder="votre@email.com" className="wft-input" aria-label="Adresse email" />
                                <button type="submit" className="wft-send" aria-label="S'abonner">
                                    <ArrowRight style={{ width: 18, height: 18, color: CREAM }} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Spacer desktop */}
                    <div className="hidden lg:block lg:col-span-1" />

                    {/* ── COLONNE 2 — Boutique ── */}
                    <div className="lg:col-span-2">
                        <p className="wft-heading">Boutique</p>
                        <ul className="space-y-3.5">
                            {COL_BOUTIQUE.map(({ to, label }) => (
                                <li key={to}>
                                    <Link to={to} className="wft-link">
                                        {label}
                                        <ChevronRight className="wft-chev" style={{ height: 14 }} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── COLONNE 3 — Aide ── */}
                    <div className="lg:col-span-2">
                        <p className="wft-heading">Aide</p>
                        <ul className="space-y-3.5">
                            {COL_AIDE.map(({ href, label }) => (
                                <li key={label}>
                                    <a href={href} className="wft-link">
                                        {label}
                                        <ChevronRight className="wft-chev" style={{ height: 14 }} />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── COLONNE 4 — Nous contacter ── */}
                    <div className="sm:col-span-2 lg:col-span-3">
                        <p className="wft-heading">Nous contacter</p>
                        <ul className="space-y-4">
                            {[
                                { Icon: Mail, text: "contact@samaboutique.sn", href: "mailto:contact@samaboutique.sn" },
                                { Icon: Phone, text: "+221 77 000 00 00", href: "tel:+221770000000" },
                                { Icon: MapPin, text: "Dakar, Sénégal", href: "#" },
                            ].map(({ Icon, text, href }) => (
                                <li key={text}>
                                    <a href={href} className="flex items-center gap-3 group" style={{ textDecoration: "none" }}>
                                        <div className="shrink-0 flex items-center justify-center"
                                            style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(199,147,45,0.12)" }}>
                                            <Icon style={{ width: 15, height: 15, color: GOLD }} />
                                        </div>
                                        <span className="wft-contact" style={{ fontSize: 13, color: "rgba(255,248,238,0.70)" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,248,238,0.70)")}>
                                            {text}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* Card Horaires */}
                        <div style={{ marginTop: 24, background: "rgba(255,248,238,0.04)", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px" }}>
                            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,248,238,0.45)", marginBottom: 12, fontWeight: 700 }}>
                                Horaires
                            </p>
                            {[
                                { j: "Lun — Sam", h: "09h00 – 20h00" },
                                { j: "Dimanche", h: "10h00 – 18h00" },
                            ].map(({ j, h }) => (
                                <div key={j} className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: "rgba(255,248,238,0.55)" }}>{j}</span>
                                    <span style={{ fontSize: 13, color: CREAM, fontWeight: 600 }}>{h}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Séparateur dégradé */}
            <div className="max-w-[1400px] mx-auto px-6">
                <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(255,248,238,0.10) 30%, rgba(199,147,45,0.20) 50%, rgba(255,248,238,0.10) 70%, transparent)" }} />
            </div>

            {/* Barre bas de page */}
            <div className="max-w-[1400px] mx-auto px-6" style={{ paddingTop: 20, paddingBottom: 20 }}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                    {/* Paiement */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                        <span style={{ fontSize: 10, color: "rgba(255,248,238,0.40)", letterSpacing: "0.16em", textTransform: "uppercase", marginRight: 2 }}>
                            Paiement
                        </span>
                        {PAYMENTS.map(({ label, color, bg, border }) => (
                            <span key={label} className="wft-pay" style={{ color, background: bg, border: `1px solid ${border}` }}>
                                {label}
                            </span>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p style={{ fontSize: 12, color: "rgba(255,248,238,0.35)", textAlign: "center" }}>
                        © {new Date().getFullYear()} SamaBoutique &nbsp;·&nbsp; Fait avec fierté au Sénégal 🇸🇳
                    </p>
                </div>
            </div>

            {/* Bande décorative bas */}
            <div style={{ height: 3, background: STRIP }} />
        </footer>
    );
}
