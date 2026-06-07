import { useRef } from "react";
import { Download, Printer, X, Check, Package } from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
    order: Order;
    onClose?: () => void;
    /** Si true, affiche dans un modal; sinon inline */
    modal?: boolean;
}

function QRCode({ data, size = 120 }: { data: string; size?: number }) {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&color=513102&bgcolor=FFF8EE&margin=4`;
    return (
        <img
            src={url}
            alt="QR Code de vérification"
            style={{ width: size, height: size, borderRadius: 8 }}
        />
    );
}

export function OrderReceipt({ order, onClose, modal = true }: Props) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const verifyUrl = `${window.location.origin}/admin/commandes/${order.id}/verify?ref=${order.numeroFacture}`;

    const handlePrint = () => {
        const content = receiptRef.current;
        if (!content) return;

        const printWindow = window.open("", "_blank", "width=500,height=800");
        if (!printWindow) return;

        printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Reçu ${order.numeroFacture}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Bricolage Grotesque', sans-serif; background: #FFF8EE; color: #513102; padding: 32px 28px; }
    .receipt { max-width: 400px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { width: 44px; height: 44px; background: #513102; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: #FFF8EE; font-family: 'Playfair Display', serif; font-size: 22px; font-style: italic; font-weight: 700; }
    .brand { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #513102; margin-top: 6px; }
    .brand em { font-style: italic; color: #C7932D; }
    .brand-sub { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(81,49,2,0.40); margin-top: 2px; }
    .divider { height: 1px; background: rgba(81,49,2,0.10); margin: 16px 0; }
    .ref-badge { background: rgba(199,147,45,0.10); border: 1px solid rgba(199,147,45,0.25); border-radius: 8px; padding: 8px 14px; display: inline-block; margin: 12px 0; }
    .ref-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(81,49,2,0.50); }
    .ref-value { font-size: 16px; font-weight: 800; color: #C7932D; font-family: monospace; letter-spacing: 0.04em; }
    .section-title { font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(81,49,2,0.45); font-weight: 700; margin-bottom: 10px; }
    .item-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .item-name { font-size: 13px; font-weight: 600; color: #513102; }
    .item-sub { font-size: 11px; color: rgba(81,49,2,0.55); margin-top: 1px; }
    .item-price { font-size: 13px; font-weight: 700; color: #513102; white-space: nowrap; margin-left: 12px; }
    .total-row { display: flex; justify-content: space-between; padding-top: 10px; border-top: 1.5px solid rgba(81,49,2,0.12); }
    .total-label { font-size: 15px; font-weight: 700; color: #513102; }
    .total-value { font-size: 18px; font-weight: 900; color: #C7932D; }
    .info-row { display: flex; gap: 6px; font-size: 11.5px; color: rgba(81,49,2,0.65); margin-bottom: 4px; }
    .info-key { font-weight: 700; color: #513102; flex-shrink: 0; }
    .qr-section { text-align: center; margin-top: 20px; }
    .qr-label { font-size: 10px; color: rgba(81,49,2,0.50); margin-top: 8px; letter-spacing: 0.04em; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; color: rgba(81,49,2,0.35); line-height: 1.5; }
    .check-circle { width: 40px; height: 40px; background: rgba(199,147,45,0.10); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px; }
    @media print {
      body { padding: 0; background: white; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <div class="check-circle">✓</div>
    <div class="logo">S</div>
    <div class="brand">Sama<em>Boutique</em></div>
    <div class="brand-sub">Dakar · Sénégal</div>
    <div class="divider"></div>
    <p style="font-size:11px;color:rgba(81,49,2,0.50);margin-bottom:8px;">REÇU DE COMMANDE</p>
    <div class="ref-badge">
      <div class="ref-label">Référence</div>
      <div class="ref-value">${order.numeroFacture}</div>
    </div>
  </div>

  <div class="divider"></div>
  <p class="section-title">Articles commandés</p>
  ${order.items.map(item => `
    <div class="item-row">
      <div>
        <div class="item-name">${item.productNom}</div>
        ${item.variante ? `<div class="item-sub">${item.variante}</div>` : ""}
        <div class="item-sub">×${item.quantite}</div>
      </div>
      <div class="item-price">${(item.sousTotal).toLocaleString("fr-FR")} F</div>
    </div>
  `).join("")}

  <div class="total-row">
    <span class="total-label">Total</span>
    <span class="total-value">${order.totalTTC.toLocaleString("fr-FR")} F CFA</span>
  </div>

  <div class="divider"></div>
  <p class="section-title">Informations de livraison</p>
  <div class="info-row"><span class="info-key">Adresse :</span><span>${order.adresseLivraison || "—"}</span></div>
  <div class="info-row"><span class="info-key">Paiement :</span><span>${order.modePaiement}</span></div>
  <div class="info-row"><span class="info-key">Statut :</span><span>${order.statut}</span></div>
  <div class="info-row"><span class="info-key">Date :</span><span>${new Date(order.createdAt).toLocaleString("fr-FR")}</span></div>
  <div class="info-row"><span class="info-key">Client :</span><span>${order.clientNom}</span></div>

  <div class="qr-section">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}&color=513102&bgcolor=FFF8EE&margin=4" style="width:140px;height:140px;border-radius:8px;" />
    <div class="qr-label">Scanner pour vérifier · ${order.numeroFacture}</div>
  </div>

  <div class="footer">
    <p>SamaBoutique — Dakar, Sénégal 🇸🇳</p>
    <p style="margin-top:4px;">Ce reçu est votre preuve d'achat. Conservez-le.</p>
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>
        `);
        printWindow.document.close();
    };

    const content = (
        <div ref={receiptRef}
            className="rounded-2xl overflow-hidden"
            style={{ background: "#FFF8EE", border: "1px solid rgba(81,49,2,0.10)" }}>

            {/* Header */}
            <div className="text-center px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(81,49,2,0.07)" }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "#513102", color: "#FFF8EE", fontFamily: "'Playfair Display',serif", fontSize: 18, fontStyle: "italic", fontWeight: 700 }}>
                        S
                    </div>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#513102" }}>
                        Sama<em style={{ fontStyle: "italic", color: "#C7932D" }}>Boutique</em>
                    </span>
                </div>
                <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(81,49,2,0.38)" }}>
                    Dakar · Sénégal
                </p>
            </div>

            {/* Ref */}
            <div className="text-center px-6 py-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: "rgba(34,197,94,0.10)", border: "1.5px solid rgba(34,197,94,0.25)" }}>
                    <Check className="w-5 h-5" style={{ color: "#22C55E" }} />
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(81,49,2,0.45)", marginBottom: 6 }}>
                    REÇU DE COMMANDE
                </p>
                <div className="inline-block px-4 py-2 rounded-xl"
                    style={{ background: "rgba(199,147,45,0.09)", border: "1px solid rgba(199,147,45,0.22)" }}>
                    <p style={{ fontSize: 11, color: "rgba(81,49,2,0.50)", marginBottom: 2 }}>Référence</p>
                    <p style={{ fontSize: 15, fontWeight: 800, fontFamily: "monospace", color: "#C7932D" }}>{order.numeroFacture}</p>
                </div>
            </div>

            <div style={{ height: 1, background: "rgba(81,49,2,0.07)", margin: "0 20px" }} />

            {/* Items */}
            <div className="px-5 py-4 space-y-2.5">
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(81,49,2,0.40)", marginBottom: 8 }}>
                    Articles
                </p>
                {order.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                                style={{ background: "rgba(199,147,45,0.10)" }}>
                                <Package className="w-3.5 h-3.5" style={{ color: "rgba(199,147,45,0.60)" }} />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate" style={{ fontSize: 12, fontWeight: 600, color: "#513102" }}>{item.productNom}</p>
                                {item.variante && <p style={{ fontSize: 10, color: "rgba(81,49,2,0.55)" }}>{item.variante}</p>}
                                <p style={{ fontSize: 10, color: "rgba(81,49,2,0.45)" }}>×{item.quantite}</p>
                            </div>
                        </div>
                        <span className="flex-shrink-0" style={{ fontSize: 12, fontWeight: 700, color: "#513102" }}>
                            {formatPrice(item.sousTotal)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center px-5 py-3"
                style={{ borderTop: "1.5px solid rgba(81,49,2,0.09)", borderBottom: "1px solid rgba(81,49,2,0.07)" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#513102" }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#C7932D" }}>{formatPrice(order.totalTTC)}</span>
            </div>

            {/* Infos */}
            <div className="px-5 py-4 space-y-1.5" style={{ background: "rgba(81,49,2,0.02)" }}>
                {[
                    ["Client", order.clientNom],
                    ["Adresse", order.adresseLivraison],
                    ["Paiement", order.modePaiement],
                    ["Statut", order.statut],
                    ["Date", formatDateTime(order.createdAt)],
                ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex gap-2" style={{ fontSize: 11 }}>
                        <span style={{ fontWeight: 700, color: "#513102", flexShrink: 0 }}>{k} :</span>
                        <span style={{ color: "rgba(81,49,2,0.65)" }}>{v}</span>
                    </div>
                ))}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center py-5 px-5"
                style={{ borderTop: "1px solid rgba(81,49,2,0.07)" }}>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(81,49,2,0.40)", marginBottom: 10 }}>
                    VÉRIFICATION SÉCURISÉE
                </p>
                <QRCode data={verifyUrl} size={120} />
                <p style={{ fontSize: 10, color: "rgba(81,49,2,0.40)", marginTop: 8, textAlign: "center" }}>
                    Scannez pour vérifier l'authenticité<br />
                    <span style={{ fontFamily: "monospace", fontSize: 9 }}>{order.numeroFacture}</span>
                </p>
            </div>

            {/* Footer */}
            <div className="text-center px-5 pb-5">
                <p style={{ fontSize: 10, color: "rgba(81,49,2,0.35)", lineHeight: 1.5 }}>
                    SamaBoutique — Dakar, Sénégal 🇸🇳<br />
                    Ce reçu est votre preuve d'achat. Conservez-le.
                </p>
            </div>
        </div>
    );

    if (!modal) return (
        <div>
            {content}
            <button onClick={handlePrint}
                className="mt-3 w-full flex items-center justify-center gap-2 font-semibold rounded-full"
                style={{ height: 44, background: "#513102", color: "#FFF8EE", fontSize: 13, cursor: "pointer" }}>
                <Download className="w-4 h-4" /> Télécharger le reçu
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,8,0,0.50)", backdropFilter: "blur(6px)" }}>
            <div className="w-full max-w-sm max-h-[90vh] flex flex-col">
                {/* Actions header */}
                <div className="flex items-center justify-between mb-3">
                    <button onClick={handlePrint}
                        className="flex items-center gap-2 px-4 h-9 rounded-full font-semibold text-sm"
                        style={{ background: "#C7932D", color: "white", cursor: "pointer" }}>
                        <Download className="w-3.5 h-3.5" /> Télécharger PDF
                    </button>
                    <button onClick={handlePrint}
                        className="flex items-center gap-2 px-4 h-9 rounded-full font-semibold text-sm"
                        style={{ background: "rgba(255,255,255,0.15)", color: "white", cursor: "pointer" }}>
                        <Printer className="w-3.5 h-3.5" /> Imprimer
                    </button>
                    {onClose && (
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.15)", color: "white", cursor: "pointer" }}>
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Scrollable receipt */}
                <div className="overflow-y-auto rounded-2xl" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
                    {content}
                </div>
            </div>
        </div>
    );
}
