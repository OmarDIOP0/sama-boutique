import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

// ── Social icons ───────────────────────────────────────────────────────────────
function IconInstagram() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
        </svg>
    );
}
function IconFacebook() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
    );
}
function IconTikTok() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
        </svg>
    );
}
function IconWhatsApp() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

// ── Payment badges ─────────────────────────────────────────────────────────────
const PAYMENTS = [
    { label: "Orange Money", color: "#FF6600", bg: "rgba(255,102,0,0.12)" },
    { label: "Wave", color: "#1BB4E8", bg: "rgba(27,180,232,0.12)" },
    { label: "Carte", color: "rgba(245,240,234,0.65)", bg: "rgba(255,255,255,0.07)" },
    { label: "Espèces", color: "rgba(245,240,234,0.65)", bg: "rgba(255,255,255,0.07)" },
];

const SOCIALS = [
    { Icon: IconInstagram, href: "#", label: "Instagram", hoverColor: "#E1306C" },
    { Icon: IconFacebook, href: "#", label: "Facebook", hoverColor: "#1877F2" },
    { Icon: IconTikTok, href: "#", label: "TikTok", hoverColor: "#ffffff" },
    { Icon: IconWhatsApp, href: "https://wa.me/221XXXXXXXXX", label: "WhatsApp", hoverColor: "#25D366" },
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

export function ClientFooter() {
    return (
        <footer
            style={{
                background: "#100D0B",
                color: "rgba(245,240,234,0.65)",
                fontFamily: "'Inter', system-ui, sans-serif",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@1,500;0,600&family=Inter:wght@400;500;600&display=swap');

        /* Footer link hover */
        .ft-link {
          font-size: 13.5px;
          color: rgba(245,240,234,0.45);
          transition: color 0.18s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ft-link:hover { color: rgba(245,240,234,0.9); }
        .ft-link::before {
          content: '';
          display: inline-block;
          width: 0;
          height: 1px;
          background: #B84D22;
          transition: width 0.25s;
          vertical-align: middle;
        }
        .ft-link:hover::before { width: 10px; }

        /* Column heading */
        .ft-heading {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(245,240,234,0.35);
          margin-bottom: 20px;
        }

        /* Social icon */
        .ft-social {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255,255,255,0.09);
          color: rgba(245,240,234,0.45);
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .ft-social:hover {
          border-color: rgba(255,255,255,0.18);
          color: rgba(245,240,234,0.9);
          transform: translateY(-2px);
        }

        /* Newsletter input */
        .ft-input {
          flex: 1;
          height: 42px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px 0 0 10px;
          padding: 0 14px;
          font-size: 13px;
          color: rgba(245,240,234,0.8);
          outline: none;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s;
        }
        .ft-input::placeholder { color: rgba(245,240,234,0.25); }
        .ft-input:focus { border-color: rgba(184,77,34,0.45); }

        .ft-send-btn {
          height: 42px;
          padding: 0 16px;
          background: #B84D22;
          border-radius: 0 10px 10px 0;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .ft-send-btn:hover { background: #9E3D17; }

        /* Decorative separator */
        .ft-sep {
          border: none;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent);
          margin: 0;
        }

        /* Payment badge */
        .ft-pay {
          font-size: 11.5px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.08);
          white-space: nowrap;
          transition: border-color 0.2s;
        }
        .ft-pay:hover { border-color: rgba(255,255,255,0.16); }

        /* Couture decoration dots */
        .ft-dots {
          background-image: radial-gradient(circle, rgba(184,77,34,0.18) 1px, transparent 1px);
          background-size: 16px 16px;
        }
      `}</style>

            {/* ── Top decorative strip ─────────────────────────────────────────────── */}
            <div
                className="ft-dots"
                style={{ height: 3, background: "linear-gradient(to right, transparent, #B84D22 30%, #C8912A 70%, transparent)" }}
            />

            {/* ── Main content ─────────────────────────────────────────────────────── */}
            <div className="max-w-[1400px] mx-auto px-6 pt-14 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

                    {/* ── Brand col ───────────────────────────────────────────────────── */}
                    <div className="lg:col-span-4">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-5">
                            <div style={{
                                width: 40, height: 40, background: "#B84D22",
                                borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "'Cormorant', serif", fontStyle: "italic", fontWeight: 600,
                                fontSize: 22, color: "white",
                                boxShadow: "0 3px 12px rgba(184,77,34,0.4)",
                            }}>S</div>
                            <div>
                                <div style={{
                                    fontFamily: "'Cormorant', Georgia, serif",
                                    fontWeight: 600, fontSize: 20,
                                    color: "rgba(245,240,234,0.95)", lineHeight: 1,
                                }}>
                                    Sama<em style={{ fontStyle: "italic", color: "#B84D22" }}>Boutique</em>
                                </div>
                                <div style={{
                                    fontSize: 9.5, letterSpacing: "0.2em",
                                    color: "rgba(245,240,234,0.3)",
                                    textTransform: "uppercase", marginTop: 3,
                                }}>
                                    Dakar · Sénégal
                                </div>
                            </div>
                        </div>

                        {/* Tagline */}
                        <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(245,240,234,0.4)", maxWidth: 280, marginBottom: 24 }}>
                            Mode & élégance authentique,<br />
                            sourcées localement avec fierté.
                        </p>

                        {/* Social icons */}
                        <div className="flex items-center gap-2 mb-8">
                            {SOCIALS.map(({ Icon, href, label, hoverColor }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    target={href.startsWith("http") ? "_blank" : undefined}
                                    rel="noopener noreferrer"
                                    className="ft-social"
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.color = hoverColor;
                                        (e.currentTarget as HTMLElement).style.borderColor = hoverColor + "44";
                                        (e.currentTarget as HTMLElement).style.background = hoverColor + "12";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.color = "rgba(245,240,234,0.45)";
                                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)";
                                        (e.currentTarget as HTMLElement).style.background = "transparent";
                                    }}
                                >
                                    <Icon />
                                </a>
                            ))}
                        </div>

                        {/* Newsletter */}
                        <div>
                            <p className="ft-heading" style={{ marginBottom: 12 }}>Newsletter</p>
                            <p style={{ fontSize: 12.5, color: "rgba(245,240,234,0.35)", marginBottom: 10 }}>
                                Nouveautés & offres exclusives
                            </p>
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                className="flex"
                            >
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    className="ft-input"
                                />
                                <button type="submit" className="ft-send-btn">
                                    <ArrowRight style={{ width: 16, height: 16, color: "white" }} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── Spacer ──────────────────────────────────────────────────────── */}
                    <div className="hidden lg:block lg:col-span-1" />

                    {/* ── Boutique col ────────────────────────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <p className="ft-heading">Boutique</p>
                        <ul className="space-y-3.5">
                            {COL_BOUTIQUE.map(({ to, label }) => (
                                <li key={to}>
                                    <Link to={to} className="ft-link">{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Aide col ────────────────────────────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <p className="ft-heading">Aide</p>
                        <ul className="space-y-3.5">
                            {COL_AIDE.map(({ href, label }) => (
                                <li key={label}>
                                    <a href={href} className="ft-link">{label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Contact col ─────────────────────────────────────────────────── */}
                    <div className="lg:col-span-3">
                        <p className="ft-heading">Nous contacter</p>
                        <ul className="space-y-4">
                            {[
                                { Icon: Mail, text: "contact@samaboutique.sn", href: "mailto:contact@samaboutique.sn" },
                                { Icon: Phone, text: "+221 77 000 00 00", href: "tel:+221770000000" },
                                { Icon: MapPin, text: "Dakar, Sénégal", href: "#" },
                            ].map(({ Icon, text, href }) => (
                                <li key={text}>
                                    <a
                                        href={href}
                                        className="flex items-start gap-3 group"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <div
                                            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                                            style={{ background: "rgba(184,77,34,0.12)", transition: "background 0.2s" }}
                                        >
                                            <Icon style={{ width: 13, height: 13, color: "#B84D22" }} />
                                        </div>
                                        <span
                                            style={{
                                                fontSize: 13.5,
                                                color: "rgba(245,240,234,0.45)",
                                                transition: "color 0.18s",
                                                lineHeight: 1.5,
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.color = "rgba(245,240,234,0.85)")}
                                            onMouseLeave={e => (e.currentTarget.style.color = "rgba(245,240,234,0.45)")}
                                        >
                                            {text}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* Opening hours */}
                        <div
                            className="mt-6 p-4 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                            <p style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(245,240,234,0.3)", marginBottom: 8, fontWeight: 600 }}>
                                Horaires
                            </p>
                            {[
                                { j: "Lun — Sam", h: "09h00 – 20h00" },
                                { j: "Dimanche", h: "10h00 – 18h00" },
                            ].map(({ j, h }) => (
                                <div key={j} className="flex justify-between items-center" style={{ marginBottom: 4 }}>
                                    <span style={{ fontSize: 12.5, color: "rgba(245,240,234,0.35)" }}>{j}</span>
                                    <span style={{ fontSize: 12.5, color: "rgba(245,240,234,0.6)", fontWeight: 500 }}>{h}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Separator ───────────────────────────────────────────────────────── */}
            <div className="max-w-[1400px] mx-auto px-6">
                <hr className="ft-sep" />
            </div>

            {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
            <div className="max-w-[1400px] mx-auto px-6 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

                    {/* Payment methods */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span style={{ fontSize: 11, color: "rgba(245,240,234,0.28)", letterSpacing: "0.06em", marginRight: 2 }}>
                            PAIEMENT
                        </span>
                        {PAYMENTS.map(({ label, color, bg }) => (
                            <span
                                key={label}
                                className="ft-pay"
                                style={{ color, background: bg }}
                            >
                                {label}
                            </span>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p style={{ fontSize: 12, color: "rgba(245,240,234,0.25)", textAlign: "center" }}>
                        © {new Date().getFullYear()} SamaBoutique &nbsp;·&nbsp; Fait avec fierté au Sénégal 🇸🇳
                    </p>
                </div>
            </div>

            {/* ── Bottom decorative strip ──────────────────────────────────────────── */}
            <div style={{ height: 3, background: "linear-gradient(to right, transparent, #B84D22 30%, #C8912A 70%, transparent)" }} />
        </footer>
    );
}