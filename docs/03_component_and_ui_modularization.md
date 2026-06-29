# Component & UI Modularization — HP Library

> Quy chuẩn component includes, kiến trúc CSS, hệ thống theme, và quy tắc isolation.

---

## 1. Component Includes

### Tổng quan 8 components (4 cặp start/end)

| Component | Start File | End File | CSS Class Output | Icon (Material) | Params |
|-----------|-----------|----------|-----------------|-----------------|--------|
| **Box** | `box-start.html` | `box-end.html` | `.box.<type>` | Tuỳ `type` | `type` (bắt buộc), `title`, `id`, `title_en` |
| **Example** | `example-start.html` | `example-end.html` | `.example` | `edit_note` | `title`, `id` |
| **Exercise** | `exercise-start.html` | `exercise-end.html` | `.exercise` | `fitness_center` | `title`, `id` |
| **Review** | `review-start.html` | `review-end.html` | `.review` (collapsible `<details>`) | `school` | `title` (default: "Ôn tập toán học"), `id` |

### Cú pháp sử dụng

```html
{% include components/box-start.html type="definition" id="def-markov" title='Định nghĩa 1.1 — Tính chất Markov' title_en="Markov Property" %}
  <p>Nội dung HTML + MathJax...</p>
{% include components/box-end.html %}

{% include components/example-start.html id="ex-coin" title='Ví dụ 1.1 — Tung đồng xu' %}
  <p>Nội dung...</p>
{% include components/example-end.html %}

{% include components/exercise-start.html id="baitap-1" title='Bài tập 1.1' %}
  <p>Đề bài...</p>
{% include components/exercise-end.html %}

{% include components/review-start.html id="review-prob" title="Ôn tập: Xác suất có điều kiện" %}
  <p>Nội dung collapsible...</p>
{% include components/review-end.html %}
```

### Icon mapping (hardcoded trong `box-start.html`)

| `include.type` | Material Icon | Màu header (từ `markov.css`) |
|----------------|--------------|------------------------------|
| `definition` | `menu_book` | Xanh lá `#2e7d32` |
| `theorem` | `verified` | Đỏ `#b71c1c` |
| `formula` | `functions` | Vàng `#c49000` |
| `summary` | `lightbulb` | Xanh dương `#1565c0` |
| (default/khác) | `info` | Tuỳ CSS |

### Cơ chế truyền biến `include.*`

Tất cả params truyền qua cú pháp Liquid `{% include %}`:

```html
<!-- box-start.html source code -->
<div class="box {{ include.type }}"{% if include.id %} id="{{ include.id }}"{% endif %}>
{% if include.title %}
  <p class="box-title">
    <span class="box-icon material-icons-outlined">
      {% if include.type == 'definition' %}menu_book
      {% elsif include.type == 'theorem' %}verified
      {% elsif include.type == 'formula' %}functions
      {% elsif include.type == 'summary' %}lightbulb
      {% else %}info{% endif %}
    </span>
    {{ include.title }}
    {% if include.title_en %} <span class="box-title-en">{{ include.title_en }}</span>{% endif %}
  </p>
{% endif %}
<div class="box-body">
```

**Lưu ý quan trọng:**
- `title` có thể chứa HTML (ví dụ: `<em>italic</em>`) — dùng dấu nháy đơn `title='...'` khi có HTML
- `title_en` chỉ có trên box, không có trên example/exercise/review
- `id` dùng cho deep-linking — format khuyến nghị: `def-ten-muc`, `ex-ten-muc`, `thm-ten-muc`

### Backward compatibility

- Nếu `title` không truyền → không render header, chỉ có `.box-body`
- Nếu `id` không truyền → div không có attribute `id` (không deep-linkable)
- Nếu `type` không truyền → class chỉ là `.box`, icon là `info`, không có màu riêng (fallback CSS)

---

## 2. Visual Hierarchy — 3 tầng

### Primary: Box Definition + Theorem

```
+---[xanh lá/đỏ FULL HEADER BAR]---+
| icon  Tiêu đề    English Title   |
+-----------------------------------+
|                                   |
|  Nội dung (.box-body)             |
|  White/light background           |
|                                   |
+-----------------------------------+
```

- Header: `background: var(--box-header)`, `color: #fff`
- Body: `background: var(--box-bg)`, `border: 1px solid var(--box-border)`
- `box-shadow: 0 2px 8px rgba(0,0,0,0.06)`

### Secondary: Box Formula + Summary

```
|  icon  Tiêu đề              |
|  (text color, no bg fill)   |
+------------------------------+
|                              |
|  Nội dung (.box-body)        |
|                              |
+------------------------------+
```

- Header: `background: none`, `color: var(--box-header)`, `border-left: 4px solid var(--box-header)`
- Không có `box-shadow`
- CSS selector: `.box.formula .box-title`, `.box.summary .box-title`

### Tertiary: Example, Exercise, Review

```
+------------------------------+
| icon  Tiêu đề               |
|                              |
|  Nội dung (no .box-body)     |
|                              |
+------------------------------+
```

- Background: `var(--example-bg)`, border: `1px solid var(--example-border)`
- Exercise có thêm `border-left: 4px solid #8e44ad`
- Review: `<details>` element, header clickable, nội dung collapsible
- Review toggle text: "Click để mở" / "Click để đóng"

---

## 3. Kiến trúc CSS

### 3.1. Phân tách file

```
Landing page                          Chapter pages
+-----------+                         +------------------+
| library   |                         | framework.css    |  Generic structure
|   .css    |                         +------------------+
| (lib-*)   |                         | markov.css       |  Book-specific palette
+-----------+                         +------------------+
                                      | markov-themes    |  7 themes + font sizes
                                      |   .css           |  + floating UI
                                      +------------------+
```

### 3.2. `library.css` — Landing page (729 dong)

**Scope:** Chỉ load bởi `default.html`. Không bao giờ load cùng `framework.css`.

**Naming convention:** BEM nghiêm ngặt với prefix `lib-`:

```
lib-navbar
lib-navbar__inner
lib-navbar__brand
lib-navbar__links
lib-navbar__hamburger
lib-navbar--scrolled           (modifier)

lib-hero
lib-hero__title
lib-hero__subtitle

lib-stats
lib-stats__item
lib-stats__number
lib-stats__label

lib-progress
lib-progress__inner
lib-progress__ring
lib-progress__ring-bg
lib-progress__ring-fill
lib-progress__ring-text
lib-progress__timeline
lib-timeline
lib-timeline__node
lib-timeline__dot
lib-timeline__dot--done        (modifier)
lib-timeline__dot--wip
lib-timeline__dot--planned
lib-timeline__connector

lib-search
lib-search__input
lib-search__tag
lib-search__tag--active        (modifier)

lib-book-grid
lib-book-card
lib-book-card__cover
lib-book-card__body
lib-book-card__title
lib-book-card__title-en
lib-book-card__subtitle
lib-book-card__desc
lib-book-card__progress
lib-book-card__progress-bar
lib-book-card__progress-done
lib-book-card__progress-wip
lib-book-card__progress-text
lib-book-card__meta
lib-book-card__tags
lib-book-card__tag

lib-badge
lib-badge--active
lib-badge--draft
lib-badge--planned
lib-badge--format

lib-footer
lib-footer__brand

lib-empty
```

**CSS Variables (`:root` scope riêng):**

```css
--lib-bg: #f8f6f1;
--lib-surface: #ffffff;
--lib-border: #e8e4dc;
--lib-text: #333333;
--lib-text-light: #888888;
--lib-text-muted: #aaaaaa;
--lib-accent: #8b7355;
--lib-accent-light: #a8956f;
--lib-heading: #1a1a1a;
--lib-radius: 16px;
--lib-radius-sm: 8px;
--lib-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
--lib-shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.1);
--lib-navbar-h: 60px;
--lib-max-w: 960px;
--lib-green: #28a745;
--lib-yellow: #e6a817;
```

**Breakpoints:** `768px` (mobile cards, hamburger menu), `480px` (compact stats).

### 3.3. `framework.css` — Chapter framework (567 dong)

**Scope:** Dùng chung cho **tất cả sách**. KHÔNG chứa book-specific styles.

**Nội dung chính:**

| Concern | Classes | Ghi chú |
|---------|---------|---------|
| 3-column grid | `.page-wrapper`, `.toc`, `.content`, `.sidebar` | Grid: `220px 1fr 280px` |
| Box system | `.box`, `.box-title`, `.box-body`, `.box-icon` | Màu qua CSS variables |
| Example/Exercise | `.example`, `.example-title`, `.exercise`, `.exercise-title` | |
| Review (collapsible) | `.review`, `.review-title`, `.review-body`, `.review-toggle` | `<details>` element |
| Typography | `h1`, `h2`, `h3`, `p`, `ul`, `ol` | Sizes dùng `rem` |
| Tables | `table`, `th`, `td` | `border-collapse: collapse` |
| Chapter navigation | `.chapter-nav` | prev/next links |
| Index/landing per-book | `.index-hero`, `.chapter-grid`, `.chapter-card` | Book landing page |
| Sidebar cards | `.sidebar-card`, `.sidebar-tip`, `.symbol-table` | Visual grouping |
| Deep-link highlight | `.deeplink-highlight-*`, `.deeplink-focus-badge` | Animation keyframes |
| Responsive | `@media (max-width: 900px)` | Single column |

**Global CSS variable:**

```css
:root {
  --box-radius: 20px;    /* Dùng cho tất cả box, card, example, review */
}
```

**Visual hierarchy CSS (secondary tier):**

```css
.box.formula .box-title,
.box.summary .box-title {
  background: none;
  color: var(--box-header);
  border-left: 4px solid var(--box-header);
}
```

### 3.4. `markov.css` — Book-specific palette (238 dong)

**Scope:** Chỉ cho sách Markov Chains. Mỗi sách mới cần file tương tự.

**Nội dung:**

| Concern | Ghi chú |
|---------|---------|
| Font | `'Literata'`, Georgia, serif — `line-height: 1.85` |
| Color palette | Sepia-warm, tất cả qua CSS variables với fallback values |
| Box colors | 4 loại: definition (xanh lá), theorem (đỏ), formula (vàng), summary (xanh dương) |
| Review colors | Purple: `--review-header: #6a1b9a` |
| Links | Gwern-style: no underline, `border-bottom` on hover |
| TOC/Sidebar styling | Background colors, hover/active states |
| Badges | `.badge-done` (xanh), `.badge-wip` (vàng), `.badge-planned` (xám) |

**Box color system (CSS custom properties):**

```css
.box.definition { --box-header: #2e7d32; --box-bg: #f6fbf4; --box-border: #a5d6a7; }
.box.theorem    { --box-header: #b71c1c; --box-bg: #fdf4f2; --box-border: #e0a8a0; }
.box.formula    { --box-header: #c49000; --box-bg: #fefbf0; --box-border: #e0d5a0; }
.box.summary    { --box-header: #1565c0; --box-bg: #f2f7fc; --box-border: #a8c8e8; }
```

### 3.5. `markov-themes.css` — Themes + Floating UI (522 dong)

**Scope:** Hệ thống theme và UI controls cho sách Markov.

#### Font size levels (5 cấp)

```css
html[data-fontsize="1"] { font-size: 15px; }
html[data-fontsize="2"] { font-size: 17px; }
html[data-fontsize="3"] { font-size: 18px; }  /* default */
html[data-fontsize="4"] { font-size: 20px; }
html[data-fontsize="5"] { font-size: 22px; }
```

#### 7 themes

| Theme | Selector | Bg chính | Text chính | Heading | Swatch |
|-------|----------|----------|-----------|---------|--------|
| Original | `html[data-theme="original"]` | `#f4ecd8` (sepia) | `#2e2a25` | `#1a4a6e` | Sepia |
| Quiet | `html[data-theme="quiet"]` | `#f0f0f0` (gray) | `#444` | `#2c3e50` | Gray |
| Paper | `html[data-theme="paper"]` | `#faf7f2` (cream) | `#333` | `#8b4513` | Cream |
| Bold | `html[data-theme="bold"]` | `#fff` (white) | `#1a1a1a` | `#0a3d6b` | White |
| Calm | `html[data-theme="calm"]` | `#eef4f0` (mint) | `#2d3b33` | `#1a5c3a` | Mint |
| Focus | `html[data-theme="focus"]` | `#fff` (pure) | `#333` | `#111` | White |
| Dark | `html[data-theme="dark"]` | `#1a1a2e` (navy) | `#d4d4e0` | `#7cb3d0` | Navy |

Mỗi theme khai báo ~30 CSS variables: `--bg-body`, `--bg-toc`, `--bg-sidebar`, `--bg-card`, `--text-body`, `--text-heading`, `--text-h3`, `--text-muted`, `--border-color`, `--link-color`, v.v.

#### Dark mode box overrides

```css
html[data-theme="dark"] .box.definition { --box-bg: #1a2e1a; --box-border: #2a5a2a; }
html[data-theme="dark"] .box.theorem    { --box-bg: #2e1a1a; --box-border: #5a2a2a; }
html[data-theme="dark"] .box.formula    { --box-bg: #2e2a1a; --box-border: #5a4a2a; }
html[data-theme="dark"] .box.summary    { --box-bg: #1a1a2e; --box-border: #2a2a5a; }
```

#### Floating UI (cùng file)

- `.floating-buttons` — container fixed bottom-right
- `.floating-btn` — circular button (42x42px)
- `.back-to-top` — ẩn mặc định, hiện khi scroll > 300px
- `.share-btn` — copy URL to clipboard
- `.settings-panel` — panel popup: theme grid + font size controls
- `.share-toast` — toast notification "Đã sao chép link!"
- `.settings-overlay` — mobile backdrop overlay

---

## 4. Theme System

### Cơ chế hoạt động

1. **Flash prevention:** Inline `<script>` trong `<head>` (trước CSS load):

```javascript
(function(){
  var t = localStorage.getItem('theme') || 'original';
  var f = localStorage.getItem('fontSize') || '3';
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.setAttribute('data-fontsize', f);
})();
```

2. **JS runtime (`settings.js`):**
   - Đọc `localStorage.theme` và `localStorage.fontSize`
   - Apply bằng `setAttribute('data-theme', theme)` + `setAttribute('data-fontsize', level)`
   - Save bằng `localStorage.setItem()`
   - Update UI: theme cards active state, font bar fill width, font label text

3. **CSS matching:** `html[data-theme="dark"]` selector → override ~30 variables

### localStorage keys

| Key | Values | Default |
|-----|--------|---------|
| `theme` | `original`, `quiet`, `paper`, `bold`, `calm`, `focus`, `dark` | `original` |
| `fontSize` | `1`, `2`, `3`, `4`, `5` | `3` (18px) |

---

## 5. Quy tắc Isolation

### KHÔNG được modify `framework.css` cho nhu cầu per-book

`framework.css` là shared layer. Nếu cần style riêng cho một sách:

- Tạo `css/themes/<book-key>.css` — override CSS variables
- Tạo `css/themes/<book-key>-themes.css` — theme definitions nếu cần palette riêng
- **KHÔNG** thêm selectors kiểu `.box.definition` vào `framework.css` — đó là book-specific

### Mỗi sách cần file CSS riêng (hoặc dùng shared)

- **Minimum:** 1 file `css/themes/<key>.css` khai báo font, box colors, palette
- **Optional:** 1 file `css/themes/<key>-themes.css` nếu muốn multi-theme
- **Shared fallback:** Nếu sách mới chấp nhận cùng style Markov, có thể dùng chung `markov.css` tạm thời

### CSS loading order trong `book-chapter.html`

```html
<link rel="stylesheet" href="{{ '/css/framework.css' | relative_url }}">          <!-- 1. Shared structure -->
<link rel="stylesheet" href="{{ '/css/themes/markov.css' | relative_url }}">      <!-- 2. Book palette -->
<link rel="stylesheet" href="{{ '/css/themes/markov-themes.css' | relative_url }}"> <!-- 3. Themes + UI -->
```

**Hiện tại:** 3 file CSS hardcoded cho Markov. Khi thêm sách mới, cần refactor thành conditional loading theo `book_key`.

---

*Xem thêm: `docs/05_scaling_and_maintenance_playbook.md` Playbook B (thêm component type mới) và Playbook C (thêm theme mới).*
