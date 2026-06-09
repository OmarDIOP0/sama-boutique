import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Navigate, Link } from "react-router-dom";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    TransitionChild,
} from "@headlessui/react";
import {
    ChevronRight, MapPin, Lock, X, Check,
    ShoppingBag, Package, ChevronLeft, Store,
    Loader2, AlertCircle, Truck, Navigation,
} from "lucide-react";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validators";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { useDeliveryZones } from "@/hooks/useDelivery";
import { formatPrice } from "@/lib/utils";

// ─── Données géographiques ───────────────────────────────────────────────────
const REGIONS_DATA: Record<string, { fee: number; departements: Record<string, string[]> }> = {
    "Dakar":       { fee: 1000, departements: { "Dakar": ["Plateau","Médina","Yoff","Almadies","Ngor","Ouakam","HLM","Fann-Point E","Grand Dakar","Dieuppeul","Mermoz-Sacré-Cœur"],"Pikine": ["Pikine Ancien","Thiaroye-sur-Mer","Yeumbeul Nord","Yeumbeul Sud","Mbao","Keur Massar"],"Guédiawaye": ["Golf Sud","Médina Gounass","Ndiarème Limamoulaye","Sahm Notaire","Wakhinane Nimzatt"],"Rufisque": ["Rufisque Est","Rufisque Nord","Rufisque Ouest","Bargny","Diamniadio","Sébikhotane"] } },
    "Thiès":       { fee: 2000, departements: { "Thiès": ["Thiès Nord","Thiès Est","Thiès Ouest","Kayar","Keur Moussa"],"Mbour": ["Mbour","Saly Portudal","Joal-Fadiouth","Ngaparou","Somone"],"Tivaouane": ["Tivaouane","Méckhé","Méouane"] } },
    "Saint-Louis": { fee: 3500, departements: { "Saint-Louis": ["Saint-Louis","Gandon","Rao"],"Dagana": ["Dagana","Richard-Toll","Rosso-Sénégal"],"Podor": ["Podor","Ndioum","Gamadji Saré"] } },
    "Diourbel":    { fee: 2000, departements: { "Diourbel": ["Diourbel","Ngoye","Tocky Gare"],"Bambey": ["Bambey","Gawane","Ndangalma"],"Mbacké": ["Mbacké","Touba","Darou Nahim"] } },
    "Louga":       { fee: 2500, departements: { "Louga": ["Louga","Darou Moukhty"],"Kébémer": ["Kébémer","Ndande"],"Linguère": ["Linguère","Barkedji"] } },
    "Fatick":      { fee: 2500, departements: { "Fatick": ["Fatick","Diakhao","Toubacouta"],"Foundiougne": ["Foundiougne","Sokone"],"Gossas": ["Gossas","Mbar"] } },
    "Kaolack":     { fee: 2500, departements: { "Kaolack": ["Kaolack Nord","Kaolack Sud","Kahone"],"Guinguinéo": ["Guinguinéo"],"Nioro du Rip": ["Nioro du Rip"] } },
    "Kaffrine":    { fee: 3000, departements: { "Kaffrine": ["Kaffrine","Birkilane"],"Koungheul": ["Koungheul"],"Malem-Hodar": ["Malem-Hodar"] } },
    "Tambacounda": { fee: 4000, departements: { "Tambacounda": ["Tambacounda","Missirah"],"Bakel": ["Bakel","Kidira"],"Koumpentoum": ["Koumpentoum"] } },
    "Kédougou":    { fee: 5000, departements: { "Kédougou": ["Kédougou","Bandafassi"],"Saraya": ["Saraya"],"Salémata": ["Salémata"] } },
    "Kolda":       { fee: 4500, departements: { "Kolda": ["Kolda","Bagadadji"],"Vélingara": ["Vélingara","Pakour"],"Médina Yoro Foulah": ["Médina Yoro Foulah"] } },
    "Ziguinchor":  { fee: 4500, departements: { "Ziguinchor": ["Ziguinchor","Tilène","Lyndiane"],"Bignona": ["Bignona","Thionck-Essyl"],"Oussouye": ["Oussouye"] } },
    "Sédhiou":     { fee: 4000, departements: { "Sédhiou": ["Sédhiou","Marsassoum"],"Bounkiling": ["Bounkiling"],"Goudomp": ["Goudomp"] } },
    "Matam":       { fee: 3500, departements: { "Matam": ["Matam","Ourossogui"],"Kanel": ["Kanel"],"Ranérou": ["Ranérou"] } },
};

const RELAY_POINTS = [
    { id: "rp1", nom: "Point Relais Dakar - Plateau", adresse: "Rue Carnot, Dakar Plateau", horaires: "Lun–Sam · 8h–20h" },
    { id: "rp2", nom: "Point Relais Mermoz",          adresse: "VDN Mermoz, Dakar",         horaires: "Lun–Sam · 9h–19h" },
    { id: "rp3", nom: "Point Relais Pikine",           adresse: "Marché Tilène, Pikine",     horaires: "Lun–Dim · 8h–18h" },
    { id: "rp4", nom: "Point Relais Guédiawaye",       adresse: "Golf Sud, Guédiawaye",      horaires: "Lun–Sam · 9h–18h" },
    { id: "rp5", nom: "Point Relais Thiès",            adresse: "Centre ville, Thiès",       horaires: "Lun–Sam · 8h–19h" },
];

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
    const [rem, setRem] = useState(seconds);
    useEffect(() => {
        const t = setInterval(() => setRem(r => {
            if (r <= 1) { clearInterval(t); onExpire(); return 0; }
            return r - 1;
        }), 1000);
        return () => clearInterval(t);
    }, []);
    const m = Math.floor(rem / 60), s = rem % 60, pct = (rem / seconds) * 100;
    const color = rem > 120 ? "#C7932D" : rem > 60 ? "#f59e0b" : "#ef4444";
    const r = 26, circ = 2 * Math.PI * r;
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(199,147,45,0.12)" strokeWidth="5" />
                    <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
                        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#513102", fontVariantNumeric: "tabular-nums" }}>
                        {m}:{s.toString().padStart(2, "0")}
                    </span>
                </div>
            </div>
            <p style={{ fontSize: 11, color: "rgba(81,49,2,0.50)", textAlign: "center" }}>Temps restant pour confirmer</p>
        </div>
    );
}

// ─── Payment Drawer (Headless UI) ────────────────────────────────────────────
interface DrawerProps {
    open: boolean;
    onClose: () => void;
    total: number;
    deliveryFee: number;
    userPhone: string;
    orderRef?: string;
    createdOrder?: any;
    isLoading: boolean;
    error?: string;
    onPay: () => Promise<void>;
}

const STEP_LABELS = ["Méthode", "Numéro", "Confirmation", "Terminé"];

function PaymentDrawer({ open, onClose, total, deliveryFee, userPhone, orderRef, createdOrder, isLoading, error, onPay }: DrawerProps) {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [wavePhone, setWavePhone] = useState("");
    const [phoneError, setPhoneError] = useState("");

    useEffect(() => {
        if (open) {
            setStep(1);
            setPhoneError("");
            setWavePhone(userPhone.replace("+221", "").replace(/\s/g, ""));
        }
    }, [open, userPhone]);

    useEffect(() => { if (orderRef && step === 2) setStep(3); }, [orderRef]);

    const validateAndPay = async () => {
        const digits = wavePhone.replace(/\s/g, "");
        if (!digits || digits.length < 9) {
            setPhoneError("Le numéro Wave est requis (9 chiffres)");
            return;
        }
        if (!/^(70|75|76|77|78)\d{7}$/.test(digits)) {
            setPhoneError("Numéro invalide — commence par 70, 75, 76, 77 ou 78");
            return;
        }
        setPhoneError("");
        await onPay();
    };

    const grandTotal = total + deliveryFee;

    return (
        <Dialog open={open} onClose={() => { if (step < 3) onClose(); }} className="relative z-50">
            {/* Backdrop */}
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 data-[closed]:opacity-0"
            />

            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                        <DialogPanel
                            transition
                            className="pointer-events-auto w-screen max-w-md transform transition duration-300 ease-in-out data-[closed]:translate-x-full"
                        >
                            {/* Close button outside panel */}
                            <TransitionChild>
                                <div className="absolute top-4 -left-10 duration-300 data-[closed]:opacity-0">
                                    {step < 3 && (
                                        <button type="button" onClick={onClose}
                                            className="rounded-full w-8 h-8 flex items-center justify-center text-white/70 hover:text-white"
                                            style={{ background: "rgba(255,255,255,0.12)" }}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </TransitionChild>

                            {/* Panel */}
                            <div className="flex h-full flex-col overflow-y-auto" style={{ background: "#FFF8EE" }}>

                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                                    style={{ borderBottom: "1px solid rgba(81,49,2,0.08)", boxShadow: "0 1px 0 rgba(81,49,2,0.04)" }}>
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(81,49,2,0.40)", textTransform: "uppercase", letterSpacing: "0.10em" }}>
                                            PAIEMENT SÉCURISÉ
                                        </p>
                                        <p style={{ fontSize: 22, fontWeight: 900, color: "#513102", fontFamily: "'Playfair Display',serif", lineHeight: 1.1 }}>
                                            {formatPrice(grandTotal)}
                                        </p>
                                    </div>
                                    {step < 3 && (
                                        <button type="button" onClick={onClose}
                                            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
                                            style={{ background: "rgba(81,49,2,0.07)", cursor: "pointer" }}>
                                            <X className="w-4 h-4" style={{ color: "#513102" }} />
                                        </button>
                                    )}
                                </div>

                                {/* Step indicators */}
                                <div className="flex items-center gap-1 px-5 py-3 flex-shrink-0"
                                    style={{ borderBottom: "1px solid rgba(81,49,2,0.05)" }}>
                                    {STEP_LABELS.map((label, i) => {
                                        const n = i + 1, active = step === n, done = step > n;
                                        return (
                                            <div key={n} className="flex items-center gap-1 flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center transition-all"
                                                        style={{ background: done ? "#C7932D" : active ? "#513102" : "rgba(81,49,2,0.08)", color: (done || active) ? "white" : "rgba(81,49,2,0.35)", fontSize: 9, fontWeight: 800 }}>
                                                        {done ? <Check className="w-2.5 h-2.5" /> : n}
                                                    </div>
                                                    <span className="hidden sm:inline" style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#513102" : "rgba(81,49,2,0.40)" }}>
                                                        {label}
                                                    </span>
                                                </div>
                                                {i < STEP_LABELS.length - 1 && (
                                                    <div className="flex-1 mx-1" style={{ height: 1, background: "rgba(81,49,2,0.08)", minWidth: 4 }} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Scrollable content */}
                                <div className="flex-1 overflow-y-auto px-5 py-5">

                                    {/* ── STEP 1 — Méthode ── */}
                                    {step === 1 && (
                                        <div className="space-y-4">
                                            <div>
                                                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#513102", marginBottom: 4 }}>Choisissez votre méthode</h3>
                                                <p style={{ fontSize: 13, color: "rgba(81,49,2,0.55)" }}>Paiement 100% sécurisé sur votre téléphone.</p>
                                            </div>

                                            {/* Wave — only option */}
                                            <div className="flex items-center gap-3 p-4 rounded-2xl"
                                                style={{ border: "2px solid #1B6FEE", background: "rgba(27,111,238,0.04)" }}>
                                                <img src="/wave.png" alt="Wave" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span style={{ fontSize: 15, fontWeight: 700, color: "#513102" }}>Wave</span>
                                                        <span className="px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ fontSize: 9, fontWeight: 700, background: "#22C55E" }}>
                                                            Recommandé
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: 12, color: "rgba(81,49,2,0.50)", marginTop: 1 }}>Paiement Mobile Money instantané</p>
                                                </div>
                                                <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center" style={{ borderColor: "#1B6FEE", background: "#1B6FEE" }}>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                </div>
                                            </div>

                                            {/* Security */}
                                            <div className="flex items-start gap-3 p-4 rounded-xl"
                                                style={{ background: "rgba(199,147,45,0.06)", border: "1px solid rgba(199,147,45,0.15)" }}>
                                                <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#C7932D" }} />
                                                <div>
                                                    <p style={{ fontSize: 12, fontWeight: 700, color: "#513102", marginBottom: 2 }}>Paiement 100% sécurisé</p>
                                                    <p style={{ fontSize: 11, color: "rgba(81,49,2,0.55)", lineHeight: 1.5 }}>
                                                        Vos données ne sont jamais partagées. La transaction est chiffrée et traitée par Wave.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Steps */}
                                            <div className="space-y-2.5">
                                                <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(81,49,2,0.40)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                                    COMMENT ÇA MARCHE ?
                                                </p>
                                                {["Entrez votre numéro Wave", "Wave vous envoie une notification", "Approuvez dans l'app Wave", "Commande confirmée automatiquement"].map((s, i) => (
                                                    <div key={i} className="flex items-center gap-2.5">
                                                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                                                            style={{ background: "rgba(199,147,45,0.12)", fontSize: 10, fontWeight: 700, color: "#C7932D" }}>{i + 1}</div>
                                                        <span style={{ fontSize: 12, color: "rgba(81,49,2,0.65)" }}>{s}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── STEP 2 — Numéro Wave ── */}
                                    {step === 2 && (
                                        <div className="space-y-5">
                                            <div>
                                                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#513102", marginBottom: 4 }}>Votre numéro Wave</h3>
                                                <p style={{ fontSize: 13, color: "rgba(81,49,2,0.55)" }}>Vous recevrez une notification pour confirmer le paiement.</p>
                                            </div>

                                            <div className="rounded-2xl p-5 space-y-4"
                                                style={{ background: "linear-gradient(135deg,rgba(27,111,238,0.06),rgba(255,248,238,0.9))", border: "1.5px solid rgba(27,111,238,0.22)" }}>
                                                <div className="flex items-center gap-3">
                                                    <img src="/wave.png" alt="Wave" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                                                    <div>
                                                        <p style={{ fontSize: 15, fontWeight: 700, color: "#513102" }}>Wave Mobile Money</p>
                                                        <p style={{ fontSize: 12, color: "rgba(81,49,2,0.45)" }}>Sénégal · Paiement instantané</p>
                                                    </div>
                                                </div>

                                                {/* Phone */}
                                                <div>
                                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#513102", display: "block", marginBottom: 6 }}>
                                                        Numéro de téléphone Wave
                                                    </label>
                                                    <div className="relative flex items-stretch">
                                                        <div className="flex items-center px-3 gap-1 flex-shrink-0 rounded-l-2xl"
                                                            style={{ background: "white", border: "1.5px solid rgba(27,111,238,0.30)", borderRight: "none", color: "#513102", fontWeight: 600, fontSize: 13 }}>
                                                            🇸🇳 +221
                                                        </div>
                                                        <input
                                                            value={wavePhone}
                                                            onChange={e => setWavePhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                                            type="tel" inputMode="numeric"
                                                            className="flex-1 min-w-0 rounded-r-2xl outline-none"
                                                            style={{ background: "white", border: "1.5px solid rgba(27,111,238,0.30)", borderLeft: "none", fontSize: 18, fontWeight: 700, padding: "0 14px", height: 52, letterSpacing: "0.04em" }}
                                                            placeholder="77 000 00 00"
                                                        />
                                                    </div>
                                                    <p style={{ fontSize: 11, color: "rgba(81,49,2,0.40)", marginTop: 5 }}>
                                                        Pré-rempli avec votre numéro de connexion.
                                                    </p>
                                                </div>

                                                {/* Amount */}
                                                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.75)" }}>
                                                    <span style={{ fontSize: 13, color: "rgba(81,49,2,0.65)" }}>Montant total</span>
                                                    <span style={{ fontSize: 20, fontWeight: 900, color: "#513102" }}>{formatPrice(grandTotal)}</span>
                                                </div>
                                            </div>

                                            {(phoneError || error) && (
                                                <div className="flex items-start gap-2 p-3 rounded-xl"
                                                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#DC2626" }} />
                                                    <p style={{ fontSize: 12, color: "#DC2626" }}>{phoneError || error}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ── STEP 3 — QR + Countdown ── */}
                                    {step === 3 && (
                                        <div className="space-y-5 text-center">
                                            <div>
                                                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#513102", marginBottom: 4 }}>Confirmez dans Wave</h3>
                                                <p style={{ fontSize: 13, color: "rgba(81,49,2,0.55)" }}>
                                                    Scannez le QR code ou ouvrez l'app Wave pour valider{" "}
                                                    <strong style={{ color: "#513102" }}>{formatPrice(grandTotal)}</strong>.
                                                </p>
                                            </div>

                                            <div className="mx-auto flex items-center justify-center rounded-2xl p-3"
                                                style={{ background: "white", border: "2px solid rgba(27,111,238,0.15)", width: 196, height: 196, boxShadow: "0 8px 24px rgba(27,111,238,0.10)" }}>
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=wave://pay?amount=${grandTotal}%26ref=${orderRef ?? "CMD"}&color=1B6FEE&bgcolor=FFFFFF`}
                                                    alt="QR Code Wave" style={{ width: 168, height: 168, borderRadius: 8 }}
                                                />
                                            </div>

                                            <Countdown seconds={600} onExpire={() => setStep(4)} />

                                            <a href={`wave://pay?amount=${grandTotal}`}
                                                className="flex items-center justify-center gap-2.5 py-3 rounded-2xl font-bold no-underline"
                                                style={{ background: "#1B6FEE", color: "white", fontSize: 14 }}>
                                                <img src="/wave.png" alt="Wave" className="w-5 h-5 rounded-md object-cover" />
                                                Ouvrir dans Wave
                                            </a>
                                        </div>
                                    )}

                                    {/* ── STEP 4 — Terminé ── */}
                                    {step === 4 && (
                                        <div className="space-y-5 text-center py-4">
                                            <div className="flex justify-center">
                                                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                                                    style={{ background: "rgba(34,197,94,0.10)", border: "2px solid rgba(34,197,94,0.25)" }}>
                                                    <Check className="w-9 h-9" style={{ color: "#22C55E" }} />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#513102", fontFamily: "'Playfair Display',serif", marginBottom: 6 }}>
                                                    Paiement confirmé !
                                                </h3>
                                                <p style={{ fontSize: 13, color: "rgba(81,49,2,0.60)", lineHeight: 1.6 }}>
                                                    Votre commande est enregistrée. Un SMS de confirmation vous a été envoyé.
                                                </p>
                                            </div>
                                            {orderRef && (
                                                <div className="inline-block py-2 px-5 rounded-xl"
                                                    style={{ background: "rgba(199,147,45,0.08)", border: "1px solid rgba(199,147,45,0.20)" }}>
                                                    <p style={{ fontSize: 11, color: "rgba(81,49,2,0.50)", marginBottom: 2 }}>Référence commande</p>
                                                    <p style={{ fontSize: 15, fontWeight: 800, fontFamily: "monospace", color: "#C7932D" }}>#{orderRef}</p>
                                                </div>
                                            )}
                                            <div className="space-y-2.5 text-left">
                                                {["Commande enregistrée ✓", "Paiement Wave reçu ✓", "Préparation en cours…", "Livraison sous 24–48h"].map((s, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                                                            style={{ background: i < 2 ? "#22C55E" : "rgba(81,49,2,0.08)" }}>
                                                            {i < 2 ? <Check className="w-3 h-3 text-white" /> : <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(81,49,2,0.20)" }} />}
                                                        </div>
                                                        <span style={{ fontSize: 12, color: i < 2 ? "#513102" : "rgba(81,49,2,0.40)", fontWeight: i < 2 ? 600 : 400 }}>{s}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-4 flex-shrink-0 space-y-2.5"
                                    style={{ borderTop: "1px solid rgba(81,49,2,0.07)" }}>
                                    {step === 1 && (
                                        <button type="button" onClick={() => setStep(2)}
                                            className="w-full flex items-center justify-center gap-2 font-bold rounded-full transition-all"
                                            style={{ height: 50, background: "#513102", color: "#FFF8EE", fontSize: 14, cursor: "pointer" }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#3d2509"; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#513102"; }}>
                                            Continuer avec Wave <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}
                                    {step === 2 && (
                                        <>
                                            <button type="button" onClick={validateAndPay} disabled={isLoading}
                                                className="w-full flex items-center justify-center gap-2 font-bold rounded-full disabled:opacity-50 transition-all"
                                                style={{ height: 52, background: "linear-gradient(to right,#C7932D,#b08024)", color: "#FFF8EE", fontSize: 15, cursor: "pointer", boxShadow: "0 8px 24px rgba(199,147,45,0.30)" }}>
                                                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Traitement…</> : <><ShoppingBag className="w-4 h-4" />Payer {formatPrice(grandTotal)}</>}
                                            </button>
                                            <button type="button" onClick={() => setStep(1)}
                                                className="w-full flex items-center justify-center gap-1 font-medium transition-opacity hover:opacity-70"
                                                style={{ height: 36, fontSize: 12.5, color: "rgba(81,49,2,0.45)", background: "none", border: "none", cursor: "pointer" }}>
                                                <ChevronLeft className="w-3.5 h-3.5" /> Changer de méthode
                                            </button>
                                        </>
                                    )}
                                    {step === 3 && (
                                        <button type="button" onClick={() => setStep(4)}
                                            className="w-full font-bold rounded-full"
                                            style={{ height: 50, background: "#22C55E", color: "white", fontSize: 14, cursor: "pointer" }}>
                                            J'ai confirmé le paiement ✓
                                        </button>
                                    )}
                                    {step === 4 && (
                                        <Link
                                            to={`/commande/confirmation?ref=${orderRef ?? ""}`}
                                            state={{ order: createdOrder }}
                                            className="w-full flex items-center justify-center gap-2 font-bold rounded-full no-underline"
                                            style={{ height: 50, background: "#513102", color: "#FFF8EE", fontSize: 14 }}>
                                            Voir ma commande <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Lock className="w-3 h-3" style={{ color: "rgba(81,49,2,0.30)" }} />
                                        <span style={{ fontSize: 10, color: "rgba(81,49,2,0.35)" }}>Paiement sécurisé · SSL 256-bit · Wave</span>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Checkout() {
    const navigate = useNavigate();
    const cart = useCartStore();
    const { user } = useAuthStore();
    const { data: zones = [] } = useDeliveryZones(true);
    const createOrderMutation = useCreateOrder();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState("Dakar");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedCommune, setSelectedCommune] = useState("");
    const [deliveryMode, setDeliveryMode] = useState<"livraison" | "relais">("livraison");
    const [selectedRelay, setSelectedRelay] = useState(RELAY_POINTS[0].id);
    const [orderRef, setOrderRef] = useState<string | undefined>();
    const [createdOrder, setCreatedOrder] = useState<any | undefined>();

    const clientId = (user as any)?.clientId ?? user?.id ?? "";
    const userPhone = (user as any)?.telephone ?? "";
    // Ne pas rediriger si la commande vient d'être créée (panier vidé intentionnellement)
    const [orderCreated, setOrderCreated] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { nom: user?.nom ?? "", region: "Dakar", adresse: "" },
    });

    if (!user) return <Navigate to="/login" />;
    if (cart.items.length === 0 && !orderCreated) { navigate("/panier"); return null; }

    const regionInfo = REGIONS_DATA[selectedRegion];
    const subtotal = cart.total();
    // Frais de livraison depuis les zones backend (Paramètres → Livraison)
    const target = (selectedCommune || selectedDept || selectedRegion).toLowerCase();
    const matchedZone =
        zones.find((z) => z.communes.some((c) => c.toLowerCase() === target)) ??
        zones.find((z) => z.region?.toLowerCase() === selectedRegion.toLowerCase()) ??
        zones.find((z) => z.nom.toLowerCase().includes(selectedRegion.toLowerCase())) ??
        zones.find((z) => z.tarif > 0);
    const configuredFee = matchedZone?.tarif ?? 1000;
    const freeFrom = matchedZone?.freeFrom ?? 0;
    const qualifiesFree = freeFrom > 0 && subtotal >= freeFrom;
    const deliveryFee = (deliveryMode === "relais" || qualifiesFree) ? 0 : configuredFee;
    const grandTotal = subtotal + deliveryFee;
    const deptOptions = Object.keys(regionInfo?.departements ?? {});
    const communeOptions = selectedDept ? (regionInfo?.departements[selectedDept] ?? []) : [];

    // Pre-fill address from location selections
    useEffect(() => {
        const parts = [selectedCommune, selectedDept, selectedRegion].filter(Boolean);
        setValue("adresse", parts.join(", "), { shouldValidate: false });
    }, [selectedRegion, selectedDept, selectedCommune]);

    const onDeliverySubmit = (_: CheckoutFormData) => setDrawerOpen(true);

    const handlePay = async () => {
        const formData = watch();
        const adresse = deliveryMode === "relais"
            ? RELAY_POINTS.find(r => r.id === selectedRelay)?.adresse ?? "Point relais"
            : formData.adresse;
        await new Promise<void>((resolve, reject) => {
            createOrderMutation.mutate(
                { clientId, adresseLivraison: adresse, modePaiement: "MobileMoney", items: cart.items.map(i => ({ variantId: i.variantId, quantite: i.quantite, prixUnitaire: i.prixUnitaire })) },
                {
                    onSuccess: (order) => {
                        setOrderCreated(true);
                        setOrderRef(order?.numeroFacture ?? order?.id ?? "CMD");
                        setCreatedOrder(order); // stocker l'objet complet pour la page confirmation
                        cart.clearCart();
                        resolve();
                    },
                    onError: reject,
                }
            );
        });
    };

    const lbl = { fontSize: 13, fontWeight: 600 as const, color: "#513102", marginBottom: 6, display: "block" as const };
    const err = { fontSize: 11, color: "#DC2626", marginTop: 4 };

    return (
        <div className="min-h-screen wurus-bg pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

                <div className="flex items-center gap-2.5 mb-7">
                    <div className="w-1 h-5 rounded-full" style={{ background: "#C7932D" }} />
                    <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", color: "#513102" }}>
                        Finaliser la commande
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* ── Formulaire ────────────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit(onDeliverySubmit)}>
                            <div className="wurus-card p-5 sm:p-6 space-y-5">

                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#C7932D" }} />
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#513102" }}>Adresse de livraison</h3>
                                </div>

                                {/* Nom */}
                                <div>
                                    <label style={lbl}>Nom complet *</label>
                                    <input {...register("nom")} className="wurus-input"
                                        style={errors.nom ? { borderColor: "#EF4444" } : undefined} placeholder="Votre nom" />
                                    {errors.nom && <p style={err}>{errors.nom.message}</p>}
                                </div>

                                {/* Mode livraison */}
                                <div>
                                    <label style={lbl}>Mode de livraison *</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setDeliveryMode("livraison")}
                                            className="flex items-start gap-3 p-4 rounded-2xl text-left transition-all"
                                            style={{ border: deliveryMode === "livraison" ? "2px solid #C7932D" : "1.5px solid rgba(81,49,2,0.10)", background: deliveryMode === "livraison" ? "rgba(199,147,45,0.06)" : "rgba(255,255,255,0.70)", cursor: "pointer" }}>
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: deliveryMode === "livraison" ? "rgba(199,147,45,0.15)" : "rgba(81,49,2,0.05)" }}>
                                                <Truck className="w-4 h-4" style={{ color: deliveryMode === "livraison" ? "#C7932D" : "rgba(81,49,2,0.35)" }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: "#513102" }}>Livraison à domicile</p>
                                                <p style={{ fontSize: 11, color: "rgba(81,49,2,0.55)", marginTop: 1 }}>Livré chez vous sous 24–48h</p>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: "#C7932D", marginTop: 3 }}>{qualifiesFree ? "Gratuit 🎁" : formatPrice(configuredFee)}</p>
                                            </div>
                                        </button>
                                        <button type="button" onClick={() => setDeliveryMode("relais")}
                                            className="flex items-start gap-3 p-4 rounded-2xl text-left transition-all"
                                            style={{ border: deliveryMode === "relais" ? "2px solid #C7932D" : "1.5px solid rgba(81,49,2,0.10)", background: deliveryMode === "relais" ? "rgba(199,147,45,0.06)" : "rgba(255,255,255,0.70)", cursor: "pointer" }}>
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: deliveryMode === "relais" ? "rgba(199,147,45,0.15)" : "rgba(81,49,2,0.05)" }}>
                                                <Store className="w-4 h-4" style={{ color: deliveryMode === "relais" ? "#C7932D" : "rgba(81,49,2,0.35)" }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: "#513102" }}>Point relais</p>
                                                <p style={{ fontSize: 11, color: "rgba(81,49,2,0.55)", marginTop: 1 }}>Retrait en boutique partenaire</p>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: "#22C55E", marginTop: 3 }}>Gratuit</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Livraison domicile */}
                                {deliveryMode === "livraison" && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label style={lbl}>Région *</label>
                                                <select {...register("region")} className="wurus-input"
                                                    style={{ appearance: "none", cursor: "pointer" }}
                                                    value={selectedRegion}
                                                    onChange={e => { setSelectedRegion(e.target.value); setSelectedDept(""); setSelectedCommune(""); }}>
                                                    {Object.keys(REGIONS_DATA).map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                                <p style={{ fontSize: 11, color: "#C7932D", marginTop: 4, fontWeight: 600 }}>
                                                    Livraison : {qualifiesFree ? "Gratuit 🎁" : formatPrice(configuredFee)}
                                                </p>
                                            </div>
                                            <div>
                                                <label style={lbl}>Département</label>
                                                <select {...register("departement")} className="wurus-input"
                                                    style={{ appearance: "none", cursor: "pointer" }}
                                                    value={selectedDept}
                                                    onChange={e => { setSelectedDept(e.target.value); setSelectedCommune(""); }}>
                                                    <option value="">-- Département --</option>
                                                    {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        {communeOptions.length > 0 && (
                                            <div>
                                                <label style={lbl}>Commune</label>
                                                <select className="wurus-input" style={{ appearance: "none", cursor: "pointer" }}
                                                    value={selectedCommune}
                                                    onChange={e => setSelectedCommune(e.target.value)}>
                                                    <option value="">-- Commune --</option>
                                                    {communeOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <label style={lbl}>Adresse précise *</label>
                                            <textarea {...register("adresse")} rows={2} className="wurus-input"
                                                style={{ height: "auto", paddingTop: 12, paddingBottom: 12, resize: "none", ...(errors.adresse ? { borderColor: "#EF4444" } : {}) }}
                                                placeholder="Rue, quartier, point de repère…" />
                                            {errors.adresse && <p style={err}>{errors.adresse.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Point relais */}
                                {deliveryMode === "relais" && (
                                    <div className="space-y-2">
                                        <label style={lbl}>Choisir un point relais</label>
                                        {RELAY_POINTS.map(rp => (
                                            <button key={rp.id} type="button" onClick={() => setSelectedRelay(rp.id)}
                                                className="w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all"
                                                style={{ border: selectedRelay === rp.id ? "2px solid #C7932D" : "1.5px solid rgba(81,49,2,0.08)", background: selectedRelay === rp.id ? "rgba(199,147,45,0.05)" : "rgba(255,255,255,0.60)", cursor: "pointer" }}>
                                                <Navigation className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: selectedRelay === rp.id ? "#C7932D" : "rgba(81,49,2,0.35)" }} />
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: "#513102" }}>{rp.nom}</p>
                                                    <p style={{ fontSize: 11, color: "rgba(81,49,2,0.50)" }}>{rp.adresse}</p>
                                                    <p style={{ fontSize: 10, color: "rgba(81,49,2,0.38)", marginTop: 2 }}>{rp.horaires}</p>
                                                </div>
                                            </button>
                                        ))}
                                        {/* Hidden adresse field for relay */}
                                        <input type="hidden" {...register("adresse")} value={RELAY_POINTS.find(r => r.id === selectedRelay)?.adresse ?? ""} />
                                    </div>
                                )}

                                <button type="submit"
                                    className="w-full flex items-center justify-center gap-2 font-bold rounded-full transition-all"
                                    style={{ height: 52, background: "#513102", color: "#FFF8EE", fontSize: 15, cursor: "pointer" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#3d2509"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#513102"; }}>
                                    Continuer vers le paiement <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── Récap ────────────────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="wurus-card p-5 sticky top-24">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-0.5 h-4 rounded-full" style={{ background: "#C7932D" }} />
                                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#513102" }}>Votre commande</h3>
                            </div>
                            <div className="space-y-3 mb-4">
                                {cart.items.map(item => (
                                    <div key={item.variantId} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "rgba(199,147,45,0.08)" }}>
                                            {item.imageUrl ? <img src={item.imageUrl} alt={item.productNom} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4" style={{ color: "rgba(199,147,45,0.40)" }} /></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate" style={{ fontSize: 12, fontWeight: 500, color: "#513102" }}>{item.productNom}</p>
                                            <p style={{ fontSize: 11, color: "rgba(81,49,2,0.45)" }}>×{item.quantite}</p>
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#513102" }}>{formatPrice(item.prixUnitaire * item.quantite)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 pt-3" style={{ borderTop: "1px solid rgba(81,49,2,0.06)" }}>
                                <div className="flex justify-between">
                                    <span style={{ fontSize: 12, color: "rgba(81,49,2,0.55)" }}>Sous-total</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#513102" }}>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span style={{ fontSize: 12, color: "rgba(81,49,2,0.55)" }}>
                                        {deliveryMode === "relais" ? "Point relais" : `Livraison (${selectedRegion})`}
                                    </span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: deliveryMode === "relais" ? "#22C55E" : "#C7932D" }}>
                                        {deliveryMode === "relais" ? "Gratuit" : formatPrice(deliveryFee)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2" style={{ borderTop: "1px solid rgba(81,49,2,0.06)" }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: "#513102" }}>Total</span>
                                    <span style={{ fontSize: 18, fontWeight: 900, color: "#C7932D" }}>{formatPrice(grandTotal)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 p-2.5 rounded-xl" style={{ background: "rgba(27,111,238,0.05)", border: "1px solid rgba(27,111,238,0.12)" }}>
                                <img src="/wave.png" alt="Wave" className="w-5 h-5 rounded object-cover" />
                                <p style={{ fontSize: 11, color: "rgba(81,49,2,0.55)" }}>Paiement sécurisé via Wave</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                total={subtotal}
                deliveryFee={deliveryFee}
                userPhone={userPhone}
                orderRef={orderRef}
                createdOrder={createdOrder}
                isLoading={createOrderMutation.isPending}
                error={createOrderMutation.error ? (createOrderMutation.error as Error).message : undefined}
                onPay={handlePay}
            />
        </div>
    );
}
