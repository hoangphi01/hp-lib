# Kiến trúc HP Library

> Cập nhật: 2026-09-01. Tài liệu mô tả toàn bộ cấu trúc hệ thống.

---

## 1. Tổng quan

- **Mục đích:** Thư viện nghiên cứu PhD cá nhân (Đại học Debrecen)
- **Stack:** Jekyll 4.3 + vanilla HTML/CSS/JS, không framework
- **Deploy:** Cloudflare Pages (primary, auto-build on push) + GitHub Pages (backup CI)
- **Domain:** hp-lib.io.vn
- **Ngôn ngữ:** Tiếng Việt chính, nội dung song ngữ Việt–Anh

---

## 2. Cây thư mục

```
hp-lib/
├── _config.yml                         # Jekyll config
├── CNAME                               # Domain: hp-lib.io.vn
├── Gemfile / Gemfile.lock              # Ruby deps: jekyll ~> 4.3
├── index.html                          # Landing page (Liquid template)
├── tai-lieu.html                       # Trang dashboard Tài liệu
├── v2x-mapping.html                    # CSV viewer page
├── v2x_fields_and_ros_mapping.csv      # Raw CSV data
│
├── _layouts/
│   ├── default.html                    # Layout: landing + tài liệu pages
│   └── book-chapter.html              # Layout: 3-cột chapter reader
│
├── _includes/
│   ├── book-nav.html                   # TOC navigation sidebar
│   ├── mathjax.html                    # MathJax v3 config + macros
│   ├── floating-ui.html                # Floating nav + settings panel (~99 dòng)
│   ├── components/                     # 8 component includes (4 start/end pairs)
│   │   ├── box-start/end.html          #   Box: definition/theorem/formula/summary
│   │   ├── example-start/end.html      #   Example block
│   │   ├── exercise-start/end.html     #   Exercise block
│   │   └── review-start/end.html       #   Review (collapsible <details>)
│   └── sidebars/
│       ├── markov/                     # 8 files: default, intro, ch1–ch5, appendix
│       └── tollbooth/                  # 6 files: default, intro, ch1–ch4
│
├── _data/
│   ├── books.yml                       # Registry sách (2 entries)
│   ├── weekly.yml                      # Log tiến độ hàng tuần (landing)
│   ├── materials.yml                   # Kệ sách tham khảo (iBooks shelf)
│   ├── documents.yml                   # Dashboard tài liệu (CSV viewer links)
│   ├── markov/
│   │   ├── chapters.yml                # 9 chapters metadata
│   │   ├── weekly.yml                  # (chưa render)
│   │   ├── symbols.yml                 # (chưa render)
│   │   └── mathjax.yml                 # (chưa render)
│   └── tollbooth/
│       └── chapters.yml                # 5 chapters metadata
│
├── books/
│   ├── markov-chains/                  # 8 files: index, intro, ch1–ch5, appendix
│   └── tollbooth-paper/                # 6 files: index, intro, ch1–ch4
│
├── css/
│   ├── tokens.css                      # Design tokens (~84 dòng) — --hp-* variables
│   ├── library.css                     # Landing + tài liệu pages (~985 dòng, BEM lib-*)
│   ├── framework.css                   # Chapter reader grid/components (~596 dòng)
│   ├── shared-ui.css                   # Floating UI: themes, font sizes, settings panel (~787 dòng)
│   └── themes/
│       └── markov.css                  # Book palette: Literata serif, sepia, box colors (~265 dòng)
│
├── js/
│   ├── library.js                      # Landing: navbar scroll, hamburger, material filter (~46 dòng)
│   ├── floating-nav.js                 # Floating nav bar UI (~290 dòng)
│   ├── nav.js                          # TOC active state tracking (~51 dòng)
│   ├── settings.js                     # Theme/font switcher + localStorage (~104 dòng)
│   └── deeplink.js                     # URL hash tracking + share button (~129 dòng)
│
├── scripts/
│   └── (planned: process_book.py)
│
└── .github/workflows/jekyll.yml        # CI: GitHub Pages deploy
```

---

## 3. Layouts & Pages

### 3.1. `default.html` — Landing layout

- **Dùng cho:** `index.html`, `tai-lieu.html`, `v2x-mapping.html`
- **CSS:** `tokens.css` + `library.css`
- **JS:** `library.js`
- **UI:** Navbar (fixed, blur backdrop) + content + footer

### 3.2. `book-chapter.html` — Chapter reader layout

- **Dùng cho:** Tất cả chapter HTML trong `books/*/`
- **CSS:** `tokens.css` + `framework.css` + `shared-ui.css` + `themes/<theme_css>.css`
- **JS:** `floating-nav.js`, `nav.js`, `settings.js`, `deeplink.js`
- **Layout:** CSS Grid 3 cột: TOC (220px) | Content (max 820px) | Sidebar (280px)
- **Theme CSS:** Chọn dynamic theo `book_data.theme_css` trong `books.yml`
- **Flash prevention:** Inline script trong `<head>` apply theme/font trước render

### 3.3. Standalone pages

- `books/markov-chains/index.html` — Book landing (standalone HTML, không dùng layout)
- `books/tollbooth-paper/index.html` — Book landing (standalone HTML)

---

## 4. Data Flow

### 4.1. `_data/books.yml`

Mỗi entry chứa:
```yaml
- slug: markov-chains          # URL path: /books/markov-chains/
  data_key: markov             # → _data/markov/chapters.yml
  theme_css: markov            # → css/themes/markov.css
  status: active               # active | draft | planned
  tags: [xác suất, markov]     # Dùng cho filter + icon logic
  google_font: "Literata:..."  # Google Fonts link
  # + title_vi, title_en, source, description, url, about_vi, about_en
```

**Consumers:**
- `index.html` → book cards + progress bars
- `book-chapter.html` → resolve book metadata, OG tags, theme CSS
- `book-nav.html` → book title + chapter list in TOC

### 4.2. `_data/<key>/chapters.yml`

```yaml
- slug: ch1                    # Khớp page.slug trong front matter
  url: /books/markov-chains/ch1.html
  nav_title: "Ch 1: Rời rạc"  # TOC sidebar
  heading: "Chương 1: ..."    # <h1> trên page
  heading_en: "..."            # Phụ đề EN
  status: done                 # done | in-progress | planned → drives progress bar
  last_updated: 2026-06-10
```

### 4.3. `_data/documents.yml`

```yaml
- title: "V2X Fields & ROS Mapping"
  type: csv                    # Badge hiển thị trên card
  url: /v2x-mapping           # Link đến viewer page
  icon: table_chart            # Material icon
  file: /v2x_fields_and_ros_mapping.csv
```

**Consumer:** `tai-lieu.html` → renders dashboard cards

### 4.4. `_data/weekly.yml`

Mỗi entry = 1 tuần, hiển thị trên landing page (tuần mới nhất luôn mở, cũ hơn collapsible).

### 4.5. `_data/materials.yml`

Danh sách sách/bài báo/luận văn tham khảo → render kệ sách iBooks-style trên landing.

### 4.6. Data binding contracts (lỗi im lặng nếu sai!)

| Contract | Ví dụ |
|----------|-------|
| `books.yml[].data_key` == `_data/<key>/` folder | `markov` → `_data/markov/` |
| `chapters.yml[].slug` == `page.slug` front matter | `ch1` == `slug: ch1` |
| `books.yml[].slug` == `books/<slug>/` folder | `markov-chains` → `books/markov-chains/` |
| `sidebar_include` path phải tồn tại | `sidebars/markov/ch1.html` |

---

## 5. CSS Architecture

### 5.1. Design Tokens (`tokens.css`)

Tất cả CSS variables dùng chung: `--hp-*` prefix.
- Colors: `--hp-bg-primary` (#f6f1e7), `--hp-accent` (#8b7355), `--hp-border`, ...
- Typography: `--hp-font-sans` (Inter), `--hp-font-serif` (Literata)
- Spacing: 4px grid (`--hp-space-1` to `--hp-space-16`)
- Layout: `--hp-max-w` (960px), `--hp-navbar-h` (60px)

### 5.2. `library.css` — Landing scope

- **BEM naming:** `lib-*` prefix (ví dụ: `lib-book-card__progress-done`)
- **Alias variables:** `--lib-*` map sang `--hp-*` tokens
- **Sections:**
  - `lib-navbar` — Fixed navbar với blur backdrop
  - `lib-hero` — Hero section
  - `lib-weekly` — Weekly updates (collapsible cards)
  - `lib-bookshelf` / `lib-book-card` — Book progress cards
  - `lib-materials` / `lib-shelf` / `lib-spine` — iBooks bookshelf
  - `lib-docs` — Documents dashboard (cards with link color reset)
  - `lib-csv-*` — CSV viewer (warm toolbar, table, legend)
  - `lib-footer` — Footer
- **Responsive:** 768px (mobile nav, column layout), 480px (compact)

### 5.3. `framework.css` — Chapter reader scope

- 3-column CSS Grid layout
- Box system: `.box` + `.box-title` + `.box-body` (colors via CSS variables)
- Component styles: `.example`, `.exercise`, `.review`
- Deep-link highlight animations
- Responsive: <900px → single column

### 5.4. `shared-ui.css` — Floating UI (chapter pages)

- Floating navigation bar
- Settings panel (7 themes, 5 font sizes)
- Theme color definitions (each theme = ~30 CSS variables)
- Dark mode box color overrides
- Share toast styling

### 5.5. `themes/markov.css` — Per-book theme

- Font: Literata serif (line-height 1.85)
- Box colors per type: definition (green), theorem (red), formula (yellow), summary (blue)
- Link styling: Gwern-style (no underline, border-bottom on hover)
- Discussion pill styling

**Hiện cả 2 sách đều dùng chung `theme_css: markov`.**

---

## 6. JavaScript

| File | Scope | Chức năng |
|------|-------|-----------|
| `library.js` | Landing | Navbar scroll shadow, hamburger toggle, material shelf filter |
| `floating-nav.js` | Chapter | Floating bottom nav bar UI |
| `nav.js` | Chapter | TOC active state tracking, smooth scroll |
| `settings.js` | Chapter | Theme/font switcher, localStorage persistence |
| `deeplink.js` | Chapter | URL hash auto-update, `?status` highlight, share clipboard |

**Tổng:** ~620 dòng, vanilla JS, không dependencies.

---

## 7. Component Includes

### 7.1. Box Component

```html
{% include components/box-start.html type="definition" id="def-1" title="..." title_en="..." %}
  <p>Content</p>
{% include components/box-end.html %}
```

| `type` | Icon | Header color |
|--------|------|-------------|
| `definition` | `menu_book` | Green (#2e7d32) |
| `theorem` | `verified` | Red (#b71c1c) |
| `formula` | `functions` | Yellow (#c49000) |
| `summary` | `lightbulb` | Blue (#1565c0) |

### 7.2. Other components

- **Example:** `example-start/end.html` — icon `edit_note`
- **Exercise:** `exercise-start/end.html` — icon `fitness_center`
- **Review:** `review-start/end.html` — collapsible `<details>`, icon `school`

---

## 8. Trang Tài liệu & CSV Viewer

### 8.1. Dashboard (`tai-lieu.html`)

- Layout: `default`
- Data: `_data/documents.yml`
- CSS: `lib-docs__*` classes
- Mỗi document = 1 card link, click mở viewer page tương ứng

### 8.2. CSV Viewer (`v2x-mapping.html`)

- Layout: `default`, permalink: `/tai-lieu/v2x-mapping`
- CSS: `csv-*` classes (cold Material Design palette — giữ nguyên, không dùng warm tokens)
- JS: inline script — fetch CSV → parse → render `<table>`
- Features: search filter, row numbering, status tags (EXISTS/NO BRIDGE), download button
- **Quy tắc:** Tất cả file CSV trong tương lai đều dùng viewer này (copy template + đổi fetch URL)

---

## 9. Build & Deploy

```bash
bundle exec jekyll build    # Output → _site/
```

- **Cloudflare Pages:** Auto-build on push to `main` (primary)
- **GitHub Pages:** CI workflow `.github/workflows/jekyll.yml` (backup)
- **Pre-processing:** Planned `scripts/process_book.py` (chưa implement)

---

## 10. Trạng thái hiện tại

| Metric | Giá trị |
|--------|---------|
| Sách | 2: Markov Chains (7ch + intro + appendix), Tollbooth Paper (4ch + intro) |
| Chapter files | 14 (8 markov + 6 tollbooth) |
| Sidebar files | 14 (8 markov + 6 tollbooth) |
| CSS | 5 files, ~2,717 dòng |
| JavaScript | 5 files, ~620 dòng |
| Layouts | 2 (default, book-chapter) |
| Includes | 11 (3 root + 8 components) |
| YAML data | 9 files |
| Trang tài liệu | 1 (V2X CSV viewer) |
| External deps | Jekyll 4.3, MathJax 3 (CDN), Google Fonts (Literata, Inter, Material Icons) |

---

## 11. Coupling & Scaling Risks

| Risk | Mô tả |
|------|-------|
| **Sidebar thủ công** | Mỗi chapter cần 1 file sidebar viết tay. 50 sách × 7ch = 350 files |
| **Book landing standalone** | `books/*/index.html` là HTML thuần, duplicate khi thêm sách |
| **MathJax macros global** | 6 macros dùng chung, không per-book override |
| **Front matter validation** | 4 giá trị phải khớp chính xác, lỗi im lặng |
| **Theme sharing** | Cả 2 sách dùng chung `markov.css` — cần tách khi palette khác nhau |

---

## 12. Quy trình thêm tài liệu mới

### Thêm 1 CSV viewer page mới:

1. Đặt file `.csv` vào root
2. Thêm entry vào `_data/documents.yml` (title, type, url, icon, file, date_added)
3. Tạo page HTML mới: copy `v2x-mapping.html`, đổi filename trong fetch, set `permalink: /tai-lieu/<tên>`
4. CSS đã có sẵn (`csv-*` classes, cold palette), không cần thêm
5. **LUÔN dùng viewer này cho mọi file CSV** — không tạo viewer mới

### Thêm 1 sách mới:

Xem chi tiết tại `WORKFLOW.md` Section 3.
