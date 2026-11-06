// Récupère les derniers posts Instagram du compte et les enregistre dans le site.
// Lancé chaque jour par .github/workflows/instagram.yml (gratuit, sans dépendance).
//
// Variables d'environnement :
//   IG_TOKEN     jeton longue durée (60 jours) de l'API Instagram  [obligatoire]
//   IG_LIMIT     nombre de posts à garder (défaut 12)
//   IG_API_BASE  URL de l'API (défaut https://graph.instagram.com), utile pour les tests
//
// Résultat :
//   instagram.json         liste des posts, lue par index.html
//   img/insta/<id>.jpg     images téléchargées (les liens Instagram expirent, on garde une copie)
//   $GITHUB_OUTPUT         new_token=… si le jeton a été renouvelé

import { mkdir, writeFile, readdir, unlink, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const API = (process.env.IG_API_BASE || 'https://graph.instagram.com').replace(/\/$/, '');
const LIMIT = Math.max(1, Math.min(50, parseInt(process.env.IG_LIMIT || '12', 10)));
const IMG_DIR = path.join(ROOT, 'img', 'insta');
const JSON_FILE = path.join(ROOT, 'instagram.json');
let token = process.env.IG_TOKEN;

if (!token) {
  console.error('IG_TOKEN manquant : ajoute le secret IG_TOKEN dans le dépôt GitHub.');
  process.exit(1);
}

async function getJSON(url) {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    const msg = body.error ? `${body.error.type || ''} ${body.error.message || ''}`.trim() : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

// 1. Renouvelle le jeton (autorisé s'il a plus de 24 h ; il repart alors pour 60 jours).
async function refreshToken() {
  try {
    const r = await getJSON(`${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`);
    if (r.access_token) {
      const days = Math.round((r.expires_in || 0) / 86400);
      console.log(`Jeton renouvelé, valable ${days} jours.`);
      if (r.access_token !== token && process.env.GITHUB_OUTPUT) {
        console.log(`::add-mask::${r.access_token}`); // masque le nouveau jeton dans les journaux GitHub
        await appendFile(process.env.GITHUB_OUTPUT, `new_token=${r.access_token}\n`);
      }
      token = r.access_token;
    }
  } catch (e) {
    // Pas bloquant : le jeton actuel reste valable, on retentera au prochain passage.
    console.warn(`Renouvellement du jeton ignoré : ${e.message}`);
  }
}

// 2. Liste les derniers posts.
async function fetchMedia() {
  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const r = await getJSON(`${API}/me/media?fields=${fields}&limit=${LIMIT}&access_token=${encodeURIComponent(token)}`);
  return (r.data || []).slice(0, LIMIT);
}

// 3. Télécharge l'image de chaque post (la miniature pour les vidéos).
async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}

function cleanCaption(c) {
  if (!c) return '';
  // Première ligne, sans le bloc contact ni les hashtags, limitée à 120 caractères.
  const first = c.split('\n').map(s => s.trim()).find(s => s && !s.startsWith('#')) || '';
  const noTags = first.replace(/#[\p{L}\p{N}_]+/gu, '').replace(/\s{2,}/g, ' ').trim();
  return noTags.length > 120 ? noTags.slice(0, 117).trimEnd() + '…' : noTags;
}

async function main() {
  await refreshToken();
  const media = await fetchMedia();
  if (!media.length) {
    console.log('Aucun post renvoyé : on garde le flux existant.');
    return;
  }
  await mkdir(IMG_DIR, { recursive: true });

  const posts = [];
  for (const m of media) {
    const src = m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url;
    if (!src || !/^\d+$/.test(m.id)) continue;
    const name = `${m.id}.jpg`;
    const file = path.join(IMG_DIR, name);
    try {
      if (!existsSync(file)) await download(src, file);
    } catch (e) {
      console.warn(`Image ignorée (${m.id}) : ${e.message}`);
      continue;
    }
    posts.push({
      id: m.id,
      type: m.media_type,               // IMAGE, VIDEO ou CAROUSEL_ALBUM
      image: `img/insta/${name}`,
      link: m.permalink,
      caption: cleanCaption(m.caption),
      date: m.timestamp,
    });
  }

  // Supprime les images des posts qui ne sont plus dans la liste.
  const keep = new Set(posts.map(p => `${p.id}.jpg`));
  for (const f of await readdir(IMG_DIR)) {
    if (f.endsWith('.jpg') && !keep.has(f)) await unlink(path.join(IMG_DIR, f));
  }

  await writeFile(JSON_FILE, JSON.stringify({ updated: new Date().toISOString(), posts }, null, 2) + '\n');
  console.log(`${posts.length} posts enregistrés dans instagram.json.`);
}

main().catch(e => {
  console.error(`Échec : ${e.message}`);
  process.exit(1);
});
