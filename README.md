# Urban Nine Exotics — website

Static, dependency-free site for a ball python breeder: catalogue (Available / Collection / Sold)
with gene filters and counts, a breeding-season (pairings) section, similar-animal suggestions,
gene-aware search and filters, shareable animal pages, a Research care guide (#/research),
About + How to buy, and an owner admin.

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
| `js/photos.js` | Stock photos (Wikimedia Commons) with their credits and licences |
| `js/i18n.js` | English / Bahasa Indonesia wording for the whole public site |
| `js/research-id.js` | Bahasa version of the Research page |
| `js/research.js` | Research page: care and breeding guide, prey calculator, hunger-strike checker |
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

## Photos

The Research page and About section use freely licensed photos from Wikimedia Commons
(CC0, public domain, CC BY and CC BY-SA). They are loaded from Wikimedia and each one shows its
photographer and licence under the image, which the licences require; keep those credits.
They illustrate care topics and morphs only; never use them as photos of animals for sale.
Replace the About photo with your own when you have one (`js/photos.js`, key `about`).

## Languages

The ID / EN switch in the header changes all public wording. Visitors with an Indonesian browser
see Bahasa first; the choice is remembered. Your own texts (headline, About, buying terms, animal
feeding and notes, pairing notes) have a "(Bahasa, optional)" field in the admin; if it is empty
the English text is shown. Gene and morph names are never translated.
