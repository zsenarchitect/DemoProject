# Architecture Project Demo Website

A professional architecture project website built with HTML, CSS, and JavaScript, designed for hosting on GitHub Pages.

## Features

- **Dark Theme with Neon Orange Accent**: Modern, professional design with consistent theming
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Components**:
  - Custom video player with full controls
  - Smooth scrolling navigation
  - Animated elements and transitions
  - Gallery lightbox functionality
- **Multi-Page Layout**:
  - Landing page with hero section
  - Project presentation with side navigation
  - Virtual walkthrough with video player
  - About page with company information
  - Download page with project resources

## Repository Structure

This repository uses a flat structure with organized content directories:

```
DemoProject/
├── *.html                # Main website pages
├── css/                  # Stylesheets
├── js/                   # JavaScript files
├── drawings/             # Architectural drawings
│   ├── plan/            # Floor plans
│   └── elevation/       # Building elevations
├── rendering/           # High-resolution renderings
├── video/               # Walkthrough videos
├── download content/    # Downloadable files (PDFs, Revit models)
├── 3d/                  # 3D/Enscape content
├── build.ps1            # Validation script
├── .nojekyll           # GitHub Pages configuration
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Custom properties, flexbox, grid, animations
- **Vanilla JavaScript**: Interactive functionality
- **Google Fonts**: Inter and JetBrains Mono fonts
- **SVG Icons**: Custom vector graphics

## Color Scheme

- **Primary Background**: #0a0a0a (Dark)
- **Secondary Background**: #1a1a1a (Dark Gray)
- **Accent Color**: #ff6b35 (Neon Orange)
- **Text Primary**: #ffffff (White)
- **Text Secondary**: #cccccc (Light Gray)

## Development Workflow

### Adding Content

1. **Add architectural drawings** to `drawings/` subfolders (plan/, elevation/, etc.)
2. **Add renderings** to `rendering/` directory
3. **Add videos** to `video/` directory
4. **Add downloadable files** to `download content/` directory
5. **Add 3D content** to `3d/` directory

### Validation

Run the validation script to ensure all required files and directories exist:

```powershell
.\build.ps1
```

### File Organization

- **`drawings/`**: Architectural drawings organized by type
- **`rendering/`**: High-resolution renderings
- **`video/`**: Walkthrough videos
- **`download content/`**: PDFs and Revit models for download
- **`3d/`**: 3D models and Enscape content

## Deployment

This website is configured for GitHub Pages deployment:

1. **Validate the website structure**:
   ```powershell
   .\build.ps1
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update architecture website"
   git push origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **"Deploy from a branch"**
   - Choose **main** branch and **"/ (root)"** folder
   - Click **Save**

4. **Your site will be live at:** `https://yourusername.github.io/your-repo-name/`

The `.nojekyll` file ensures GitHub Pages serves the site as a static website without Jekyll processing.

## Customization

### Content
- Update project title and subtitle in `index.html`
- Replace placeholder images in website assets
- Add real architectural drawings to `drawings/` folders
- Update company information in `about.html`
- Modify contact details and download links in `download.html`

### Styling
- Adjust colors in CSS custom properties (`:root` section) in `css/styles.css`
- Modify component styles in `css/styles.css`
- Update typography and spacing variables

### Functionality
- Customize video player features in `js/script.js`
- Add new interactive elements
- Implement additional navigation features

## Adding New Content

### Architectural Drawings
- Place PDF files in appropriate `drawings/` subfolders:
  - `drawings/plan/` - Floor plans
  - `drawings/elevation/` - Building elevations

### Renderings
- Add high-resolution images to `rendering/` directory
- The download page will automatically link to this folder

### 3D Models & Downloads
- Place Revit (.rvt) files in `download content/` directory
- Add combined PDFs to `download content/` directory

### Videos
- Add walkthrough videos to `video/` directory

### 3D Content
- Add Enscape files and 3D content to `3d/` directory

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

To run locally:
1. Clone the repository
2. Run the build script: `.\build.ps1`
3. Open `public/index.html` in your browser
4. For live development, use a local server in the `public/` directory

## License

This project is for demonstration purposes only. All content and design elements are placeholders and should be replaced with actual project materials.