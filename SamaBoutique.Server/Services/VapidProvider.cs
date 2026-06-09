using System.Text.Json;
using WebPush;

namespace SamaBoutique.Server.Services
{
    /// <summary>
    /// Fournit (et persiste) la paire de clés VAPID utilisée pour signer les
    /// notifications Web Push. Les clés sont générées une seule fois puis
    /// stockées dans <c>vapid.json</c> à la racine du projet afin de rester
    /// stables entre les redémarrages (les abonnements y sont liés).
    /// </summary>
    public interface IVapidProvider
    {
        string PublicKey { get; }
        string PrivateKey { get; }
        string Subject { get; }
        VapidDetails Details { get; }
    }

    public class VapidProvider : IVapidProvider
    {
        public string PublicKey { get; }
        public string PrivateKey { get; }
        public string Subject { get; }
        public VapidDetails Details { get; }

        private record VapidFile(string PublicKey, string PrivateKey);

        public VapidProvider(IWebHostEnvironment env, IConfiguration config, ILogger<VapidProvider> logger)
        {
            Subject = config["WebPush:Subject"] ?? "mailto:contact@samaboutique.sn";

            // 1. Configuration explicite (prioritaire)
            var cfgPub = config["WebPush:PublicKey"];
            var cfgPriv = config["WebPush:PrivateKey"];
            if (!string.IsNullOrWhiteSpace(cfgPub) && !string.IsNullOrWhiteSpace(cfgPriv))
            {
                PublicKey = cfgPub;
                PrivateKey = cfgPriv;
                Details = new VapidDetails(Subject, PublicKey, PrivateKey);
                return;
            }

            // 2. Fichier persistant
            var path = Path.Combine(env.ContentRootPath, "vapid.json");
            if (File.Exists(path))
            {
                try
                {
                    var file = JsonSerializer.Deserialize<VapidFile>(File.ReadAllText(path));
                    if (file != null && !string.IsNullOrWhiteSpace(file.PublicKey))
                    {
                        PublicKey = file.PublicKey;
                        PrivateKey = file.PrivateKey;
                        Details = new VapidDetails(Subject, PublicKey, PrivateKey);
                        return;
                    }
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "vapid.json illisible, régénération des clés");
                }
            }

            // 3. Génération
            var keys = VapidHelper.GenerateVapidKeys();
            PublicKey = keys.PublicKey;
            PrivateKey = keys.PrivateKey;
            Details = new VapidDetails(Subject, PublicKey, PrivateKey);
            try
            {
                File.WriteAllText(path, JsonSerializer.Serialize(new VapidFile(PublicKey, PrivateKey)));
                logger.LogInformation("Clés VAPID générées et enregistrées dans {Path}", path);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Impossible d'écrire vapid.json (clés en mémoire uniquement)");
            }
        }
    }
}
