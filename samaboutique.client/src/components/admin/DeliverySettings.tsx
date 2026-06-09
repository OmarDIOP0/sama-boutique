import { useState } from "react";
import { Truck, Plus, Pencil, Trash2, Loader2, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useDeliveryZones, useCreateDeliveryZone, useUpdateDeliveryZone, useDeleteDeliveryZone } from "@/hooks/useDelivery";
import { AdminModal, AdminConfirmDialog } from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";
import type { DeliveryZone, DeliveryZoneRequest } from "@/types";

const GOLD = "#C7932D";
const DARK = "#513102";

// Communes courantes du Sénégal (suggestions pour le multiselect)
const COMMUNE_SUGGESTIONS = [
  "Plateau", "Médina", "Fann", "Point E", "Amitié", "Mermoz", "Sacré-Cœur", "Liberté", "Grand Dakar", "HLM",
  "Almadies", "Ngor", "Ouakam", "Yoff", "Parcelles Assainies", "Cambérène",
  "Pikine", "Guédiawaye", "Thiaroye", "Keur Massar", "Yeumbeul", "Malika", "Dalifort", "Mbao",
  "Rufisque", "Bargny", "Diamniadio", "Sébikotane", "Sangalkam",
  "Thiès", "Tivaouane", "Mbour", "Joal-Fadiouth", "Saly",
  "Saint-Louis", "Ziguinchor", "Kaolack", "Tambacounda", "Kolda", "Louga", "Matam", "Fatick", "Kaffrine", "Kédougou", "Sédhiou", "Diourbel",
];

const inputStyle: React.CSSProperties = {
  width: "100%", height: 48, borderRadius: 12, padding: "0 14px",
  border: "1.5px solid rgba(81,49,2,0.14)", background: "white", fontSize: 15, color: DARK, outline: "none",
};
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "rgba(81,49,2,0.55)", marginBottom: 7 };

function delaiLabel(minH: number, maxH: number) {
  if (maxH === 0) return "Immédiat";
  const fmt = (h: number) => (h >= 24 ? `${Math.round(h / 24)}j` : `${h}h`);
  return minH === maxH ? fmt(maxH) : `${fmt(minH)}–${fmt(maxH)}`;
}

const EMPTY: DeliveryZoneRequest = {
  nom: "", region: "Dakar", communes: [], tarif: 1500, delaiMinH: 24, delaiMaxH: 48,
  isActive: true, description: "", freeFrom: null, ordre: 10,
};

export function DeliverySettings() {
  const { data: zones = [], isLoading } = useDeliveryZones();
  const createM = useCreateDeliveryZone();
  const updateM = useUpdateDeliveryZone();
  const deleteM = useDeleteDeliveryZone();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DeliveryZoneRequest>(EMPTY);
  const [communeInput, setCommuneInput] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const set = (patch: Partial<DeliveryZoneRequest>) => setForm((f) => ({ ...f, ...patch }));

  const openCreate = () => { setEditId(null); setForm(EMPTY); setCommuneInput(""); setModalOpen(true); };
  const openEdit = (z: DeliveryZone) => {
    setEditId(z.id);
    setForm({ nom: z.nom, region: z.region ?? "", communes: z.communes, tarif: z.tarif, delaiMinH: z.delaiMinH, delaiMaxH: z.delaiMaxH, isActive: z.isActive, description: z.description ?? "", freeFrom: z.freeFrom ?? null, ordre: z.ordre });
    setCommuneInput(""); setModalOpen(true);
  };

  const addCommune = (c: string) => {
    const v = c.trim();
    if (v && !form.communes.includes(v)) set({ communes: [...form.communes, v] });
    setCommuneInput("");
  };
  const removeCommune = (c: string) => set({ communes: form.communes.filter((x) => x !== c) });

  const save = () => {
    if (form.nom.trim().length < 2) { toast.error("Nom de zone requis"); return; }
    const cb = {
      onSuccess: () => { setModalOpen(false); toast.success(editId ? "Zone mise à jour" : "Zone créée"); },
      onError: (e: any) => toast.error((e as Error).message),
    };
    if (editId) updateM.mutate({ id: editId, data: form }, cb);
    else createM.mutate(form, cb);
  };

  const suggestions = COMMUNE_SUGGESTIONS.filter(
    (c) => c.toLowerCase().includes(communeInput.toLowerCase()) && !form.communes.includes(c)
  ).slice(0, 6);

  const saving = createM.isPending || updateM.isPending;

  return (
    <div className="admin-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(81,49,2,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <Truck className="w-5 h-5" style={{ color: GOLD }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: DARK }}>Zones de livraison</h3>
        </div>
        <button onClick={openCreate} className="admin-btn-gold" style={{ height: 42 }}>
          <Plus className="w-4 h-4" /> Ajouter une zone
        </button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <p style={{ fontSize: 14, color: "rgba(81,49,2,0.5)" }}>Chargement…</p>
        ) : (
          <div className="space-y-2.5">
            {zones.map((z) => (
              <div key={z.id} className="flex flex-wrap items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(81,49,2,0.06)", opacity: z.isActive ? 1 : 0.55 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: z.tarif === 0 ? "rgba(45,122,79,0.12)" : "rgba(199,147,45,0.12)" }}>
                  <Truck className="w-5 h-5" style={{ color: z.tarif === 0 ? "#2D7A4F" : GOLD }} />
                </div>
                <div className="flex-1 min-w-40">
                  <div className="flex items-center gap-2">
                    <p style={{ fontSize: 15.5, fontWeight: 700, color: DARK }}>{z.nom}</p>
                    {!z.isActive && <span className="admin-badge admin-badge-muted">Inactif</span>}
                  </div>
                  <p style={{ fontSize: 12.5, color: "rgba(81,49,2,0.50)" }}>
                    {z.communes.length > 0 ? `${z.communes.length} commune(s) : ${z.communes.slice(0, 3).join(", ")}${z.communes.length > 3 ? "…" : ""}` : (z.description || "—")}
                  </p>
                </div>
                <span style={{ fontSize: 13, color: "rgba(81,49,2,0.50)", minWidth: 60, textAlign: "center" }}>{delaiLabel(z.delaiMinH, z.delaiMaxH)}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: z.tarif === 0 ? "#2D7A4F" : GOLD, minWidth: 90, textAlign: "right" }}>
                  {z.tarif === 0 ? "Gratuit" : formatPrice(z.tarif)}
                </span>
                <button onClick={() => openEdit(z)} aria-label="Modifier"
                  className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: "rgba(81,49,2,0.55)", cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.10)"; (e.currentTarget as HTMLElement).style.color = GOLD; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.55)"; }}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteId(z.id)} aria-label="Supprimer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: "rgba(81,49,2,0.55)", cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.10)"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.55)"; }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal créer/éditer */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        icon={Truck}
        iconColor="green"
        title={editId ? "Modifier la zone" : "Nouvelle zone de livraison"}
        maxWidth={620}
        persistent={saving}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="admin-btn-outline">Annuler</button>
            <button onClick={save} disabled={saving} className="admin-btn-gold">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editId ? "Sauvegarder" : "Créer la zone"}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Nom de la zone *</label>
              <input value={form.nom} onChange={(e) => set({ nom: e.target.value })} style={inputStyle} placeholder="Ex : Dakar Centre" />
            </div>
            <div>
              <label style={labelStyle}>Région</label>
              <input value={form.region ?? ""} onChange={(e) => set({ region: e.target.value })} style={inputStyle} placeholder="Dakar" />
            </div>
          </div>

          {/* Communes multiselect */}
          <div>
            <label style={labelStyle}><MapPin className="w-3.5 h-3.5 inline mr-1" />Communes couvertes</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.communes.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(199,147,45,0.12)", color: GOLD, fontSize: 13, fontWeight: 600 }}>
                  {c}
                  <button onClick={() => removeCommune(c)} style={{ cursor: "pointer" }}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {form.communes.length === 0 && <span style={{ fontSize: 13, color: "rgba(81,49,2,0.40)" }}>Aucune commune ajoutée</span>}
            </div>
            <div className="relative">
              <input value={communeInput} onChange={(e) => setCommuneInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCommune(communeInput); } }}
                style={inputStyle} placeholder="Tapez une commune et Entrée, ou choisissez ci-dessous" />
              {communeInput && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 rounded-xl z-10 overflow-hidden admin-card" style={{ boxShadow: "0 8px 24px rgba(81,49,2,0.15)" }}>
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => addCommune(s)} className="w-full text-left px-4 py-2.5" style={{ fontSize: 14, color: DARK, cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.08)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label style={labelStyle}>Tarif (FCFA)</label>
              <input type="number" min={0} step={500} value={form.tarif} onChange={(e) => set({ tarif: Number(e.target.value) })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Délai min (h)</label>
              <input type="number" min={0} value={form.delaiMinH} onChange={(e) => set({ delaiMinH: Number(e.target.value) })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Délai max (h)</label>
              <input type="number" min={0} value={form.delaiMaxH} onChange={(e) => set({ delaiMaxH: Number(e.target.value) })} style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Livraison gratuite dès (FCFA)</label>
              <input type="number" min={0} step={5000} value={form.freeFrom ?? ""} onChange={(e) => set({ freeFrom: e.target.value ? Number(e.target.value) : null })} style={inputStyle} placeholder="Optionnel" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <button type="button" onClick={() => set({ isActive: !form.isActive })} className="relative rounded-full transition-all"
                  style={{ width: 44, height: 24, background: form.isActive ? GOLD : "rgba(81,49,2,0.15)" }}>
                  <span className="absolute top-0.5 rounded-full bg-white shadow transition-transform" style={{ width: 20, height: 20, left: form.isActive ? 22 : 2 }} />
                </button>
                <span style={{ fontSize: 14, fontWeight: 600, color: DARK }}>Zone active</span>
              </label>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description (optionnel)</label>
            <input value={form.description ?? ""} onChange={(e) => set({ description: e.target.value })} style={inputStyle} placeholder="Ex : Retrait en boutique gratuit" />
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteM.mutate(deleteId, { onSuccess: () => toast.success("Zone supprimée"), onError: (e) => toast.error((e as Error).message), onSettled: () => setDeleteId(null) }); }}
        title="Supprimer la zone"
        description="Cette zone de livraison sera définitivement supprimée."
        confirmLabel="Supprimer"
        loading={deleteM.isPending}
      />
    </div>
  );
}
