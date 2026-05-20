import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, Star, TrendingUp } from "lucide-react";
import { useClient } from "@/hooks/useClients";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatPrice, formatDate, statusColor, cn } from "@/lib/utils";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);

  if (isLoading) return <LoadingSkeleton variant="page" />;
  if (!client) return (
    <div className="p-6 text-muted-foreground">Client introuvable</div>
  );

  const kpis = [
    {
      label: "Total achats",
      value: formatPrice(client.totalDepense),
      icon: TrendingUp,
      color: "var(--sama-terra)",
      bg: "var(--sama-terra-light)",
    },
    {
      label: "Commandes",
      value: client.nbCommandes,
      icon: ShoppingBag,
      color: "var(--sama-green)",
      bg: "rgba(45,196,122,0.1)",
    },
    {
      label: "Points fidélité",
      value: `${client.pointsFidelite} pts`,
      icon: Star,
      color: "var(--sama-gold)",
      bg: "rgba(196,168,45,0.12)",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {client.nom}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Client depuis {formatDate(client.createdAt, "MMMM yyyy")}
          </p>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6">
        <div className="flex flex-wrap items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold"
            style={{ background: "var(--sama-terra-light)", color: "var(--sama-terra)" }}
          >
            {client.nom[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-foreground">{client.nom}</h2>
              <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", statusColor(client.segment))}>
                {client.segment}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0" style={{ color: "var(--sama-terra)" }} />
                  <span>{client.email}</span>
                </div>
              )}
              {client.telephone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 flex-shrink-0" style={{ color: "var(--sama-terra)" }} />
                  <span>{client.telephone}</span>
                </div>
              )}
              {client.adresse && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "var(--sama-terra)" }} />
                  <span>{client.adresse}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 overflow-hidden relative">
            {/* Top color bar */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: color }} />
            <div className="flex items-center gap-3 mb-3 mt-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
