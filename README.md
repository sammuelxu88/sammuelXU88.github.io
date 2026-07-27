# sammuelXU Portfolio

Desktop-only bilingual portfolio inspired by Phantom's project-index structure.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

On Windows, double-click `start-portfolio.cmd` to start the local website. The
launcher works even when PowerShell script execution is restricted.

Local CMS guide page:

```text
http://localhost:3000/cms
```

The CMS and its write API are local-only. Build the public deployment with:

```bash
npm run build:public
```

The generated `out` directory excludes both `/cms` and `/api/cms/projects`.

## Local CMS

Edit `content/projects.json` to update projects.

Each project supports:

- `slug`: URL path for the case page
- `title` / `titleCn`: English and Chinese titles
- `year`
- `client`
- `category`
- `services`
- `cover`: main image from `public/portfolio`
- `images`: gallery images
- `summary` / `summaryCn`
- `description` / `descriptionCn`
- `role`

Add new images to `public/portfolio`, then reference them as `/portfolio/file-name.jpg`.
