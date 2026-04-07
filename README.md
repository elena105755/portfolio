# Portfolio Website

Simple static portfolio focused on data engineering and backend strengths.

## Run locally

Open `index.html` directly in the browser, or run a quick local server:

```bash
cd /Users/ameline/Documents/projects/portfolio
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Free hosting options

### Option 1: GitHub Pages (recommended)

1. Create a new GitHub repo (for example: `portfolio`).
2. Push this folder to that repo.
3. In GitHub: **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/(root)**
5. Save and wait 1-2 minutes.
6. Your site will be available at:
   `https://<your-github-username>.github.io/portfolio/`

### Option 2: Netlify Drop

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the `portfolio` folder.
3. Netlify generates a public URL instantly (free).

## Customize quickly

- Update your text in `index.html`.
- Change colors in CSS variables at the top of `styles.css`.
- Add project links when ready in the side project cards.
