/**
 * Обогащает public/templates/index.json данными с evyt.ru:
 *  - price      — цена товара (WooCommerce Store API, в рублях);
 *  - date       — дата публикации товара (wp/v2/product);
 *  - seedViews  — стартовое значение популярности, восстановленное из
 *                 порядка сортировки evyt «По популярности» (ранг → счётчик).
 *
 * Запуск: node scripts/sync-evyt-meta.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INDEX_PATH = path.join(ROOT, "public/templates/index.json");

const WP_API = "https://evyt.ru/wp-json/wp/v2/product";
const STORE_API = "https://evyt.ru/wp-json/wc/store/v1/products";
const PER_PAGE = 100;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`retry ${i + 1} for ${url}: ${e.message}`);
      await sleep(1000 * (i + 1));
    }
  }
}

async function fetchPaged(baseUrl, extraParams = "") {
  const first = await fetch(
    `${baseUrl}?per_page=${PER_PAGE}&page=1${extraParams}`
  );
  if (!first.ok) throw new Error(`${first.status} for ${baseUrl}`);
  const totalPages = parseInt(first.headers.get("X-WP-TotalPages"), 10) || 1;
  const firstData = await first.json();
  const all = [...firstData];
  for (let page = 2; page <= totalPages; page++) {
    console.log(`  ${baseUrl} page ${page}/${totalPages}`);
    all.push(
      ...(await fetchJson(
        `${baseUrl}?per_page=${PER_PAGE}&page=${page}${extraParams}`
      ))
    );
    await sleep(200);
  }
  return all;
}

async function main() {
  const raw = await fs.readFile(INDEX_PATH, "utf-8");
  const index = JSON.parse(raw);

  console.log("Fetching prices (Store API)...");
  const storeProducts = await fetchPaged(STORE_API, "&_fields=id,prices");
  const priceById = new Map(
    storeProducts.map((p) => [
      p.id,
      parseInt(p.prices?.price ?? "", 10) || null,
    ])
  );

  console.log("Fetching popularity order (Store API)...");
  const popularityOrdered = await fetchPaged(
    STORE_API,
    "&_fields=id&orderby=popularity&order=desc"
  );
  const popularityRankById = new Map(
    popularityOrdered.map((p, rank) => [p.id, rank])
  );

  console.log("Fetching dates (wp/v2)...");
  const wpProducts = await fetchPaged(WP_API, "&_fields=id,date");
  const dateById = new Map(wpProducts.map((p) => [p.id, p.date]));

  const totalRanked = Math.max(popularityOrdered.length - 1, 1);
  const distinctPrices = new Set();
  let matchedPrice = 0;
  let matchedDate = 0;
  let unmatched = 0;

  for (const t of index.templates) {
    const price = priceById.get(t.id);
    if (price != null) {
      t.price = price;
      distinctPrices.add(price);
      matchedPrice++;
    }
    const date = dateById.get(t.id);
    if (date) {
      t.date = date;
      matchedDate++;
    }
    const rank = popularityRankById.get(t.id);
    if (rank != null) {
      // Ранг 0 (самый популярный) → ~400 просмотров, дальше по exp-спаду.
      t.seedViews =
        1 + Math.round(399 * Math.pow(1 - rank / totalRanked, 2.5));
    }
    if (price == null && !date) unmatched++;
  }

  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2));

  const dates = index.templates.map((t) => t.date).filter(Boolean).sort();
  console.log(`Done. Templates: ${index.templates.length}`);
  console.log(`  prices: ${matchedPrice} matched, distinct: ${[...distinctPrices].sort((a, b) => a - b).join(", ")}`);
  console.log(`  dates:  ${matchedDate} matched, range ${dates[0]} .. ${dates[dates.length - 1]}`);
  console.log(`  popularity ranks: ${popularityRankById.size}, unmatched templates: ${unmatched}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
