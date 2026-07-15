import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_JSON = path.join(ROOT, "public/templates");
const OUT_PREVIEW = path.join(ROOT, "public/templates");
const OUT_ASSETS = path.join(ROOT, "public/tpl-assets");
const API = "https://evyt.ru/wp-json/wp/v2";
const SITE = "https://evyt.ru";
const TARGET_WIDTH = 1748;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`fetchJson retry ${i + 1} for ${url}: ${e.message}`);
      await sleep(1000 * (i + 1));
    }
  }
}

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.text();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`fetchText retry ${i + 1} for ${url}: ${e.message}`);
      await sleep(1000 * (i + 1));
    }
  }
}

async function fetchBuffer(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`fetchBuffer retry ${i + 1} for ${url}: ${e.message}`);
      await sleep(1000 * (i + 1));
    }
  }
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function extractJsValue(html, key) {
  const idx = html.indexOf(`"${key}":`);
  if (idx === -1) return null;
  let i = html.indexOf("[", idx);
  if (i === -1) return null;
  const braceIdx = html.indexOf("{", idx);
  if (braceIdx !== -1 && braceIdx < i) {
    i = braceIdx;
  }
  let depth = 0;
  let inString = false;
  let escape = false;
  const start = i;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
    } else {
      if (ch === '"') inString = true;
      else if (ch === "{" || ch === "[") depth++;
      else if (ch === "}" || ch === "]") {
        depth--;
        if (depth === 0) return html.slice(start, i + 1);
      }
    }
  }
  return null;
}

function sanitizePathSegment(seg) {
  return seg
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

function urlToRelativePath(url) {
  try {
    const u = new URL(url);
    let rel = u.pathname.replace(/^\/wp-content\/uploads\//, "");
    if (!rel) rel = path.posix.basename(u.pathname);
    return rel
      .split("/")
      .map((s) => sanitizePathSegment(decodeURIComponent(s)))
      .join("/");
  } catch {
    return sanitizePathSegment(path.basename(url));
  }
}

async function downloadAsset(url, assetMap) {
  if (!url) return null;
  if (assetMap.has(url)) return assetMap.get(url);
  const absoluteUrl = url.startsWith("http") ? url : `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
  const relative = urlToRelativePath(absoluteUrl);
  const localPath = path.join(OUT_ASSETS, relative);
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  if (!(await fileExists(localPath))) {
    try {
      const buf = await fetchBuffer(absoluteUrl);
      await fs.writeFile(localPath, buf);
    } catch (e) {
      console.warn(`Failed to download asset ${absoluteUrl}: ${e.message}`);
      return null;
    }
  }
  const webPath =
    "/tpl-assets/" +
    relative
      .replace(/\\/g, "/")
      .split("/")
      .map((s) => encodeURIComponent(s))
      .join("/");
  assetMap.set(url, webPath);
  return webPath;
}

function convertFpdElement(el, scale, assetMap) {
  const p = el.parameters || {};
  const common = {
    left: (p.left || 0) * scale,
    top: (p.top || 0) * scale,
    angle: p.angle || 0,
    originX: p.originX || "center",
    originY: p.originY || "center",
    opacity: typeof p.opacity === "number" ? p.opacity : 1,
    selectable: p.locked ? false : p.draggable !== false,
    evented: p.locked ? false : p.draggable !== false,
    lockMovementX: !p.draggable,
    lockMovementY: !p.draggable,
    lockRotation: !p.rotatable,
    lockScalingX: !p.resizable,
    lockScalingY: !p.resizable,
  };

  if (el.type === "image") {
    const isBg =
      el.title === "Background" || (p.z === -1 && p.locked) || p.scaleMode === "fit";
    const src = assetMap.get(el.source);
    if (!src) return null;
    return {
      type: "image",
      version: "5.3.0",
      src,
      left: common.left,
      top: common.top,
      scaleX: (p.scaleX || 1) * scale,
      scaleY: (p.scaleY || 1) * scale,
      angle: common.angle,
      originX: common.originX,
      originY: common.originY,
      opacity: common.opacity,
      selectable: isBg ? false : common.selectable,
      evented: isBg ? false : common.evented,
      lockMovementX: isBg ? true : common.lockMovementX,
      lockMovementY: isBg ? true : common.lockMovementY,
      lockRotation: isBg ? true : common.lockRotation,
      lockScalingX: isBg ? true : common.lockScalingX,
      lockScalingY: isBg ? true : common.lockScalingY,
    };
  }

  if (el.type === "text") {
    let text = (el.source || "").replace(/\\[Nn]/g, "\n");
    if (p.textTransform === "uppercase") text = text.toUpperCase();
    return {
      type: "i-text",
      version: "5.3.0",
      text,
      left: common.left,
      top: common.top,
      scaleX: 1,
      scaleY: 1,
      angle: common.angle,
      originX: common.originX,
      originY: common.originY,
      opacity: common.opacity,
      fontFamily: p.fontFamily || "Montserrat",
      fontSize: Math.round((p.fontSize || 32) * scale),
      fill: p.fill || "#000000",
      textAlign: p.textAlign || "left",
      fontWeight: p.fontWeight || "normal",
      fontStyle: p.fontStyle || "normal",
      underline: p.textDecoration === "underline",
      lineHeight: p.lineHeight || 1,
      charSpacing: p.letterSpacing || 0,
      styles: {},
      selectable: common.selectable,
      evented: common.evented,
      editable: p.editable !== false,
    };
  }

  return null;
}

async function processProduct(product, categoryMap, assetMap, fontMap) {
  const slug = product.slug;
  const html = await fetchText(product.link);

  const productsJsonStr = extractJsValue(html, "productsJSON");
  if (!productsJsonStr) {
    console.warn(`No productsJSON for ${slug}`);
    return null;
  }
  const products = JSON.parse(productsJsonStr);
  const view = products[0]?.[0];
  if (!view) {
    console.warn(`No view for ${slug}`);
    return null;
  }

  const appOptionsStr = extractJsValue(html, "app_options");
  const appOptions = appOptionsStr ? JSON.parse(appOptionsStr) : {};
  const stageWidth = appOptions.stageWidth || 481;
  const stageHeight = appOptions.stageHeight || 683;
  const scale = TARGET_WIDTH / stageWidth;
  const canvasHeight = Math.round(stageHeight * scale);

  // register fonts from this product
  for (const f of appOptions.fonts || []) {
    if (!fontMap.has(f.name)) fontMap.set(f.name, f.url);
  }

  // determine included elements
  const includedElements = (view.elements || []).filter((el) => {
    if (el.parameters?.excludeFromExport) return false;
    if (el.title === "Watermark") return false;
    if (el.source && /watermark/i.test(el.source)) return false;
    return true;
  });

  // download image assets that we will actually use
  for (const el of includedElements) {
    if (el.type === "image" && el.source) {
      await downloadAsset(el.source, assetMap);
    }
  }

  // collect used fonts
  const fontsUsed = new Set();
  for (const el of includedElements) {
    if (el.type === "text" && el.parameters?.fontFamily) {
      fontsUsed.add(el.parameters.fontFamily);
    }
  }

  // convert elements to Fabric objects
  const objects = [];
  for (const el of includedElements) {
    const obj = convertFpdElement(el, scale, assetMap);
    if (obj) objects.push(obj);
  }

  // download fonts used in this template
  const fontList = [];
  for (const family of fontsUsed) {
    const url = fontMap.get(family);
    if (url) {
      const localPath = await downloadAsset(url, assetMap);
      fontList.push({ family, url: localPath });
    } else {
      fontList.push({ family });
    }
  }

  // download preview
  let preview = null;
  const previewUrl = product._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  if (previewUrl) {
    const ext = path.extname(new URL(previewUrl).pathname) || ".webp";
    const previewFilename = `preview${ext}`;
    const previewDir = path.join(OUT_PREVIEW, slug);
    await fs.mkdir(previewDir, { recursive: true });
    const previewLocal = path.join(previewDir, previewFilename);
    try {
      const buf = await fetchBuffer(previewUrl);
      await fs.writeFile(previewLocal, buf);
      preview = `/templates/${slug}/${previewFilename}`;
    } catch (e) {
      console.warn(`Failed to download preview ${previewUrl}: ${e.message}`);
    }
  }

  const json = {
    version: "1.0",
    metadata: {
      id: product.id,
      slug,
      title: product.title?.rendered || slug,
      categoryIds: product.product_cat || [],
      categorySlugs: (product.product_cat || [])
        .map((id) => categoryMap.get(id)?.slug)
        .filter(Boolean),
      categoryNames: (product.product_cat || [])
        .map((id) => categoryMap.get(id)?.name)
        .filter(Boolean),
      preview,
      sourceUrl: product.link,
    },
    stage: { width: stageWidth, height: stageHeight },
    canvas: { width: TARGET_WIDTH, height: canvasHeight, background: "#ffffff" },
    fonts: fontList,
    objects,
  };

  const templateDir = path.join(OUT_JSON, slug);
  await fs.mkdir(templateDir, { recursive: true });
  await fs.writeFile(path.join(templateDir, "template.json"), JSON.stringify(json, null, 2));
  return json.metadata;
}

const LIMIT = parseInt(process.argv[2], 10) || Infinity;

async function main() {
  await fs.mkdir(OUT_JSON, { recursive: true });
  await fs.mkdir(OUT_PREVIEW, { recursive: true });
  await fs.mkdir(OUT_ASSETS, { recursive: true });

  const categories = await fetchJson(`${API}/product_cat?per_page=100`);
  const categoryMap = new Map(
    categories.map((c) => [c.id, { slug: c.slug, name: c.name, parent: c.parent }])
  );

  const first = await fetch(`${API}/product?per_page=1`);
  const total = parseInt(first.headers.get("X-WP-Total"), 10);
  const perPage = 100;
  const pages = Math.ceil(total / perPage);
  console.log(`Found ${total} products in ${pages} pages`);

  const assetMap = new Map();
  const fontMap = new Map();
  const templatesMeta = [];

  for (let page = 1; page <= pages; page++) {
    console.log(`Fetching page ${page}/${pages}`);
    const products = await fetchJson(`${API}/product?per_page=${perPage}&page=${page}&_embed`);
    for (const product of products) {
      try {
        const meta = await processProduct(product, categoryMap, assetMap, fontMap);
        if (meta) templatesMeta.push(meta);
      } catch (e) {
        console.error(`Error processing ${product.slug}: ${e.message}`);
      }
      await sleep(150);
      if (templatesMeta.length >= LIMIT) break;
    }
    if (templatesMeta.length >= LIMIT) break;
  }

  const index = {
    generatedAt: new Date().toISOString(),
    total: templatesMeta.length,
    categories: categories
      .filter((c) => c.count > 0)
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        parent: c.parent,
        count: c.count,
      })),
    templates: templatesMeta,
  };
  await fs.writeFile(path.join(OUT_JSON, "index.json"), JSON.stringify(index, null, 2));
  console.log(`Done. Imported ${templatesMeta.length} templates.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
