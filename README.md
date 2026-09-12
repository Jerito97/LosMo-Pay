# LosMo Pay

Cumpleaños del grupo + gastos compartidos estilo Splitwise, sin eventos: todos
los gastos van a una sola lista con selector de participantes.

## Stack

- Next.js (App Router) + TypeScript + Tailwind v4
- Postgres en [Neon](https://neon.tech), vía Drizzle ORM (`@neondatabase/serverless`)
- Auth propia: usuario + PIN numérico, hasheado con bcrypt, sesión en cookie
  httpOnly firmada con `iron-session` (no se usa Supabase Auth ni next-auth)
- Notificaciones in-app únicamente (por ahora)

## Setup local

1. Creá un proyecto en [neon.tech](https://neon.tech) (o desde Vercel:
   Storage → Neon) y copiá la connection string.
2. `cp .env.example .env` y completá `DATABASE_URL`, `SESSION_SECRET` y
   `CRON_SECRET` (los dos últimos con `openssl rand -base64 32`).
3. `npm install`
4. `npm run db:migrate` — aplica las migraciones de `drizzle/` a tu base.
5. `npm run dev`

El primer usuario que entre con un nombre nuevo crea la cuenta del grupo
(nombre, alias, cumpleaños, PIN); si el nombre ya existe, solo pide el PIN.

## Scripts útiles

- `npm run db:generate` — genera una nueva migración a partir de cambios en
  `lib/db/schema.ts`.
- `npm run db:migrate` — aplica las migraciones pendientes.
- `npm run db:studio` — abre Drizzle Studio contra tu base.

## Deploy en Vercel

1. Importá el repo en Vercel.
2. Configurá las variables de entorno `DATABASE_URL`, `SESSION_SECRET` y
   `CRON_SECRET` (Project Settings → Environment Variables).
3. Corré las migraciones contra la base de producción una vez
   (`DATABASE_URL=... npm run db:migrate` desde tu máquina, o desde un job).
4. El cron de cumpleaños (`vercel.json`) llama a `/api/cron/birthdays` todos
   los días a las 12:00 UTC (9:00 en Argentina) y genera los avisos de "hoy
   cumple X" para el resto del grupo.

## Decisiones tomadas durante la implementación

- **Fechas** = siempre el cumpleaños de una cuenta registrada (no existe un
  cumpleaños "suelto" para gente sin cuenta), así que el botón "+" de esa
  pantalla del prototipo no se replicó.
- **Saldar deuda** queda registrado como un pago con historial (tabla
  `payments`), no como un simple reseteo del balance.
- **Saldar** vive solo en el perfil de cada persona (`/personas/[id]`), no en
  el detalle de un gasto puntual: ahí la contraparte es siempre una sola
  persona, sin ambigüedad. El detalle de gasto (`/gastos/[id]`) solo permite
  eliminar el gasto.
- Eliminar un gasto es un borrado directo (como en el prototipo); no queda
  un historial de gastos borrados.
