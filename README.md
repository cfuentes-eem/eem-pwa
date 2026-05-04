# EEM PWA · app móvil web

App móvil de EEM como **Progressive Web App**. Sin App Store, sin Google Play, sin esperas. Se abre como cualquier sitio web pero **se instala en el celular como app**, en iPhone y Android.

Stack: **Next.js 16 + Tailwind + Supabase**. El mismo Supabase del panel web (`ihiyqxxtoaafwcmpggkx`).

## Cómo correrla local

```bash
cd eem-pwa
npm install
cp .env.example .env.local
# Editar .env.local con la SUPABASE_ANON_KEY real (la encuentras en
# https://supabase.com/dashboard/project/ihiyqxxtoaafwcmpggkx/settings/api)
npm run dev
```

Abre http://localhost:3000

Para probar el flujo trabajador:
1. Click en "Soy trabajador".
2. Ingresa código de empresa (ej. `EB2026` cuando esté seedeado).
3. Ingresa tu correo.
4. Recibes el magic link de Supabase, lo abres, entras al home.

Para probar el flujo responsable:
1. Click en "Soy responsable de bienestar".
2. Email + contraseña — los mismos del panel web.
3. Entras al dashboard.

## Cómo desplegarla en Vercel

### 1. Crear el repo en GitHub
```bash
cd eem-pwa
git init
git add .
git commit -m "feat: EEM PWA initial"
git branch -M main
git remote add origin git@github.com:cfuentes-eem/eem-pwa.git
git push -u origin main
```

### 2. Importar a Vercel
- https://vercel.com/new → Import Git Repository → cfuentes-eem/eem-pwa.
- Variables de entorno (en Vercel → Settings → Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL` = https://ihiyqxxtoaafwcmpggkx.supabase.co
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la anon key del proyecto Supabase
  - `NEXT_PUBLIC_APP_URL` = https://app.eem-app.cl
- Deploy.

### 3. Apuntar el subdominio app.eem-app.cl
- En Vercel → tu proyecto → Settings → Domains → Add `app.eem-app.cl`.
- En Cloudflare (o donde tengas el DNS de eem-app.cl): agrega un registro CNAME `app` → `cname.vercel-dns.com`.
- Espera 1-5 minutos.

Vercel emite el certificado HTTPS automáticamente.

### 4. Listo
Camila o cualquier trabajador abre `app.eem-app.cl` en Safari (iPhone) o Chrome (Android), toca "Compartir" → "Agregar a pantalla de inicio", y la PWA queda instalada con el ícono de EEM en su celular.

## Pre-requisito en Supabase

Las migrations SQL del proyecto principal deben estar aplicadas. Específicamente la columna `empresas.codigo_invitacion` necesita estar creada y poblada con códigos como `EB2026` o `CO2026` (ver `supabase/migrations/20260504000001_app_mobile_tables.sql` y `supabase/seed/seed_app_mobile_pilots.sql` del paquete fundacional).

## Estructura

```
eem-pwa/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # /  → welcome
│   │   ├── layout.tsx                # layout raíz
│   │   ├── auth/
│   │   │   ├── login/page.tsx        # responsable login
│   │   │   ├── codigo/page.tsx       # trabajador código + magic link
│   │   │   └── callback/route.ts     # callback magic link
│   │   ├── trabajador/page.tsx       # home trabajador
│   │   └── responsable/page.tsx      # dashboard responsable
│   ├── components/                   # Logo, Button, ServiceWorkerRegister
│   ├── lib/
│   │   ├── env.ts                    # acceso tipado a env vars
│   │   ├── types.ts                  # tipos del dominio
│   │   └── supabase/
│   │       ├── client.ts             # cliente Supabase (componentes client)
│   │       └── server.ts             # cliente Supabase (server components)
├── public/
│   ├── manifest.webmanifest          # PWA manifest
│   ├── sw.js                         # Service Worker
│   ├── icon-192.png, icon-512.png, ...
└── package.json, tsconfig.json, ...
```

## ¿Cuándo migrar a app nativa de stores?

Cuando tengas datos reales del piloto (uso, NPS, retención mes 3) que justifiquen pagar Apple Developer (USD 99/año) y contratar al senior mobile. Mientras tanto, la PWA cubre lo esencial: el trabajador la abre desde su celular, ve sus actividades, evalúa, accede a recursos, conversa con el asistente, responde el F3 cuando lo lances.

El código de esta PWA **NO se tira a la basura** cuando llegue el momento. La app nativa que se construye para stores reusa el mismo backend Supabase, los mismos endpoints del web, y los mismos usuarios (Camila sigue siendo Camila, con su mismo correo y todo su historial).

## Soporte

Christian Fuentes · cfuentes@eem.cl
