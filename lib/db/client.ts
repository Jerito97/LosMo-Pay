import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | null = null;

// Lazy a propósito: Next.js importa este módulo en build time para
// recolectar datos de las rutas, sin necesidad de una conexión real todavía.
// Si validáramos DATABASE_URL al importar (top-level), el build fallaría en
// cualquier entorno donde las env vars no estén configuradas aún (por
// ejemplo, el primer import de un repo a Vercel).
function getDb(): Db {
  if (!cached) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    cached = drizzle(neon(process.env.DATABASE_URL), { schema });
  }
  return cached;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
