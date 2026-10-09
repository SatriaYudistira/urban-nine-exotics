# Urban Nine Exotics — website

Static, dependency-free site for a ball python breeder: catalogue (Available / Collection / Sold)
with gene filters and counts, a breeding-season (pairings) section, similar-animal suggestions,
gene-aware search and filters, shareable animal pages, About + How to buy, and an owner admin.

## Run it

```bash
node serve.js
```

Open http://localhost:5500. Admin: http://localhost:5500/#admin

## Files

| Path | What it is |
|---|---|
| `index.html` | Page structure |
| `css/styles.css` | All styling (light/dark tokens at the top) |
| `js/data.js` | **The published data** — settings + animals |
| `js/store.js` | Storage layer (draft in browser, export/import) |
| `js/genes.js` | Gene parsing (`66% het Pied`, `pos het …`) and placeholder pattern art |
| `js/app.js` | Public site |
| `js/admin.js` | Owner panel |

## Publishing changes (Phase 1)

1. Open `#admin`, edit animals and settings. Changes show immediately in **your** browser only.
2. Click **Export site data** → a new `data.js` downloads (photos included, auto-resized).
3. Replace `js/data.js` with it and upload the folder to your host.

## Admin password

The first visit to `#admin` asks you to create a password (8+ characters). Export site data
afterwards so the live site uses it too. Change it in **Site settings**; use **Lock** to sign out.
Only a salted hash is stored (`settings.adminAuth`), never the password itself.

This keeps visitors out, but on a static host it is not server-side security — and it doesn't
need to be: the admin only edits a draft in the owner's own browser and can't change the live
site. Phase 2 (VPS) swaps `store.js` for a real API with a server login.

Forgot it? Delete the `"adminAuth"` entry from `js/data.js`, then reopen `#admin` to set a new one.

## Before launch — replace placeholders

In **#admin → Site settings**: WhatsApp number, Instagram, email, "Breeding since" year.
The 12 sample animals are examples — edit or delete them and add real photos.
