import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Category, PrismaClient, type Unit } from '@prisma/client';
import { hashPassword } from '../src/auth/password';

const prisma = new PrismaClient();

interface RawProduct {
  id: string;
  nombre: string;
  categoria: string;
  imagen?: string;
  unidad?: string;
  precioMercadoCentral?: number;
  precioCoto?: number;
  precioJorge?: number;
  variedad?: string;
  origen?: string;
  topVerduraRank?: number | null;
  topFrutaRank?: number | null;
}

const mapCategoria = (c: string): Category =>
  c.toLowerCase().startsWith('fru') ? 'fruta' : 'verdura';

const mapUnidad = (u: string | undefined): Unit => {
  const n = (u ?? 'kg').toLowerCase();
  if (n.includes('atado')) return 'atado';
  if (n.includes('unid') || n === 'u') return 'unidad';
  return 'kg';
};

async function main(): Promise<void> {
  const file = process.env.SEED_FILE ?? resolve(process.cwd(), '../../central/data.json');
  const raw = JSON.parse(readFileSync(file, 'utf8')) as RawProduct[];
  const scrapedAt = new Date();
  let products = 0;
  let prices = 0;

  for (const r of raw) {
    const topRank = r.topVerduraRank ?? r.topFrutaRank ?? null;
    const product = await prisma.product.upsert({
      where: { slug: r.id },
      create: {
        slug: r.id,
        nombre: r.nombre,
        categoria: mapCategoria(r.categoria),
        unidad: mapUnidad(r.unidad),
        variedad: r.variedad ?? null,
        origen: r.origen ?? null,
        imagen: r.imagen ?? null,
        topRank,
      },
      update: { nombre: r.nombre, categoria: mapCategoria(r.categoria), topRank },
    });
    products += 1;

    const points: Array<{ source: 'mercado_central' | 'coto' | 'jorge'; precio: number }> = [];
    if (typeof r.precioMercadoCentral === 'number')
      points.push({ source: 'mercado_central', precio: r.precioMercadoCentral });
    if (typeof r.precioCoto === 'number') points.push({ source: 'coto', precio: r.precioCoto });
    if (typeof r.precioJorge === 'number') points.push({ source: 'jorge', precio: r.precioJorge });

    for (const p of points) {
      await prisma.pricePoint.create({
        data: { productId: product.id, source: p.source, precio: p.precio, scrapedAt },
      });
      prices += 1;
    }
  }

  console.log(`Seed OK — ${products} productos, ${prices} price points desde ${file}`);

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.profile.upsert({
      where: { email: adminEmail },
      create: { email: adminEmail, passwordHash, role: 'admin', nombre: 'Admin' },
      update: { passwordHash, role: 'admin' },
    });
    console.log(`Admin listo: ${adminEmail}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
