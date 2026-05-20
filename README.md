# SamaBoutique Backend — Guide de démarrage

## 📦 Packages NuGet à installer

```
Microsoft.EntityFrameworkCore                    9.x
Microsoft.EntityFrameworkCore.SqlServer          9.x
Microsoft.EntityFrameworkCore.Tools              9.x
Microsoft.EntityFrameworkCore.Design             9.x
Microsoft.AspNetCore.Authentication.JwtBearer    9.x
Microsoft.IdentityModel.Tokens                   8.x
System.IdentityModel.Tokens.Jwt                  8.x
BCrypt.Net-Next                                  4.x
Swashbuckle.AspNetCore                           6.x
```

## 🗂️ Structure des fichiers à créer dans VS

```
SamaBoutique.Server/
├── Controllers/
│   └── Controllers.cs          ← coller le contenu
├── Data/
│   └── AppDbContext.cs         ← coller le contenu
├── Middleware/
│   └── Middlewares.cs          ← coller le contenu
├── Models/
│   ├── Entities/
│   │   └── Entities.cs         ← coller le contenu
│   ├── DTOs/
│   │   ├── Auth/AuthDtos.cs    ← coller le contenu
│   │   └── AllDtos.cs          ← coller le contenu (Stock/Sale/Client/Order/Supplier/Analytics)
│   └── Responses/
│       └── ApiResponse.cs      ← coller le contenu
├── Repositories/
│   ├── Interfaces/
│   │   └── IRepositories.cs   ← coller le contenu
│   └── Repositories.cs         ← coller le contenu
├── Services/
│   └── Services.cs             ← coller le contenu
├── appsettings.json            ← remplacer le contenu
├── appsettings.Production.json ← créer ce fichier
└── Program.cs                  ← remplacer le contenu
```

## ⚡ Commandes à exécuter (Package Manager Console)

```powershell
# 1. Créer la migration initiale
Add-Migration InitialCreate -Project SamaBoutique.Server

# 2. Appliquer la migration (crée la BDD)
Update-Database

# 3. En cas de modification des entités
Add-Migration NomDeLaMigration
Update-Database
```

## 🔑 Compte admin par défaut

- Email    : admin@samaboutique.com
- Password : Admin@2025!

## 🚀 Test de l'API

Swagger disponible sur : https://localhost:7001/swagger

### Tester le login :
```json
POST /api/auth/login
{
  "email": "admin@samaboutique.com",
  "password": "Admin@2025!"
}
```

La réponse contient un `accessToken` à utiliser dans Swagger via le bouton "Authorize" : `Bearer {accessToken}`

## 📋 Endpoints disponibles

| Module      | Endpoints |
|-------------|-----------|
| Auth        | POST /api/auth/login, /register, /refresh, /logout, /change-password, GET /me |
| Products    | GET/POST /api/products, GET/PUT/DELETE /api/products/{id}, GET /api/products/barcode/{code} |
| Categories  | GET /api/products/categories, POST /api/products/categories |
| Stock       | POST /api/stock/movement, GET /api/stock/movements |
| Stock Alert | GET /api/products/alerts/stock |
| Sales (POS) | POST /api/sales, GET /api/sales, GET /api/sales/{id}, POST /api/sales/{id}/cancel |
| Clients     | GET/POST /api/clients, GET/PUT/DELETE /api/clients/{id} |
| Orders      | GET/POST /api/orders, GET /api/orders/{id}, PATCH /api/orders/{id}/status |
| Analytics   | GET /api/analytics/kpis, /top-products, /top-clients, /sales-chart, /payment-breakdown |

## 🔒 Sécurité en production

1. Changer le JWT Secret dans appsettings.Production.json
2. Mettre la connection string de SmarterASP
3. Activer HTTPS obligatoire
4. Configurer les origines CORS avec votre vrai domaine
5. Ne jamais committer appsettings.Production.json dans Git

## ⚠️ Remarque QR Code

La génération de QR Codes pour les produits/billets se fait côté backend.
Installer le package : `QRCoder` ou `ZXing.Net`
Le scan se fait côté frontend React avec `html5-qrcode`.
