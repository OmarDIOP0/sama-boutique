import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateName = "samaboutique.client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (0 !== child_process.spawnSync('dotnet', [
        'dev-certs', 'https',
        '--export-path', certFilePath,
        '--format', 'Pem',
        '--no-password',
    ], { stdio: 'inherit' }).status) {
        throw new Error("Could not create certificate.");
    }
}

const target = env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
    : env.ASPNETCORE_URLS
        ? env.ASPNETCORE_URLS.split(';')[0]
        : 'http://localhost:5011';

// ── Tueur de service worker en DEV ───────────────────────────────────────────
// Un ancien SW de prod peut rester enregistré et servir un cache obsolète
// (page blanche, manifest cassé, /api intercepté). Ce plugin, actif uniquement
// en `vite dev`, répond à /sw.js et /dev-sw.js par un worker qui se désinscrit
// et vide tous les caches → auto-réparation au prochain chargement.
const swKillerDev = {
    name: 'sw-killer-dev',
    apply: 'serve' as const,
    configureServer(server: import('vite').ViteDevServer) {
        const KILL = `// SW auto-destructeur (dev)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    try { const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); } catch (_) {}
    try { await self.registration.unregister(); } catch (_) {}
    const cs = await self.clients.matchAll({ type: 'window' });
    cs.forEach((c) => { try { c.navigate(c.url); } catch (_) {} });
  })());
});
`;
        server.middlewares.use((req, res, next) => {
            const url = (req.url || '').split('?')[0];
            if (url === '/sw.js' || url === '/dev-sw.js') {
                res.setHeader('Content-Type', 'application/javascript');
                res.setHeader('Cache-Control', 'no-store');
                res.end(KILL);
                return;
            }
            next();
        });
    },
};

export default defineConfig({
    plugins: [
        swKillerDev,
        plugin(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-icon.svg'],
            // Service worker DÉSACTIVÉ en développement (npm run dev) : il
            // provoquait des pages blanches / shells en cache. Le SW (et donc
            // le Web Push) reste actif dans les builds de production.
            // Pour tester le push en local : `npm run build` puis `npx vite preview`.
            devOptions: {
                enabled: false,
            },
            manifest: {
                name: 'SamaBoutique — Boutique en ligne',
                short_name: 'SamaBoutique',
                description: 'SamaBoutique : mode et accessoires au Sénégal. Commandez et suivez vos livraisons.',
                theme_color: '#513102',
                background_color: '#FFF8EE',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                lang: 'fr',
                categories: ['shopping', 'business'],
                icons: [
                    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                    { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml' }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                // Handlers Web Push injectés dans le SW généré
                importScripts: ['push-sw.js'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/localhost.*\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                            networkTimeoutSeconds: 10
                        }
                    },
                    {
                        urlPattern: /^https:\/\/localhost.*\/images\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'product-images',
                            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }
                        }
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    // Pré-bundle TOUTES les dépendances au démarrage pour éviter les re-optimisations
    // en cours de session (cause des 504 / "Failed to fetch dynamically imported module").
    // Toute dépendance importée uniquement par une route lazy doit figurer ici.
    optimizeDeps: {
        include: [
            'react', 'react-dom', 'react-router-dom',
            'recharts',
            'react-hook-form', '@hookform/resolvers/zod', 'zod',
            'axios', 'sonner', 'framer-motion', 'lucide-react',
            '@headlessui/react', '@heroicons/react',
            '@tanstack/react-query', '@tanstack/react-query-devtools',
            'embla-carousel-react', 'embla-carousel-autoplay',
            'zustand', 'date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority',
            'html2canvas', 'html5-qrcode', 'jspdf', 'qrcode',
        ],
    },
    server: {
        proxy: {
            '^/api': {
                target,
                secure: false
            },
            '^/images': {
                target,
                secure: false
            }
        },
        port: parseInt(env.DEV_SERVER_PORT || '59263'),
        https: {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        }
    }
})