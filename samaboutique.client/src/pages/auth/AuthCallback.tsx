import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token   = params.get("token");
    const refresh = params.get("refresh");
    const userRaw = params.get("user");
    const err     = params.get("error");

    if (err) {
      setError(decodeURIComponent(err));
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    if (token && refresh && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        setAuth(token, refresh, user);

        const role = user.role ?? "";
        if (role === "Client") navigate("/", { replace: true });
        else navigate("/admin", { replace: true });
      } catch {
        setError("Erreur lors de la connexion. Veuillez réessayer.");
        setTimeout(() => navigate("/login"), 3000);
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto">
            <span className="text-2xl">✕</span>
          </div>
          <p className="font-semibold text-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Redirection en cours…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground font-medium">Connexion en cours…</p>
      </div>
    </div>
  );
}
