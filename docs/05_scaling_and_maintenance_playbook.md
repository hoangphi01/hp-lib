# Scaling & Maintenance Playbook — HP Library

> Step-by-step playbooks và ràng buộc kiến trúc cho việc mở rộng hệ thống.

---

## Playbook A: Thêm sách mới

### Checklist 8 bước

#### Bước 1: Tạo thư mục sách

```bash
mkdir -p books/stochastic-calculus
```

#### Bước 2: Tạo data namespace

```bash
mkdir -p _data/stochastic
```

Tạo `_data/stochastic/chapters.yml`:

```yaml
- slug: index
  url: /books/stochastic-calculus/
  nav_title: "Trang chủ"

- slug: ch1
  url: /books/stochastic-calculus/ch1.html
  nav_title: "Ch 1: Tích phân Itô"
  heading: "Chương 1: Tích phân Itô"
  heading_en: "Itô Integration"
  description: "Định nghĩa tích phân Itô, tính chất isometry, ví dụ tính toán."
  status: in-progress
  last_updated: 2026-07-01
```

#### Bước 3: Thêm entry vào `_data/books.yml`

```yaml
- slug: stochastic-calculus
  title_vi: "Giải tích Ngẫu nhiên"
  title_en: "Stochastic Calculus"
  subtitle: "Tài liệu Song ngữ Việt-Anh"
  source: "Shreve (2004)"
  status: active
  url: /books/stochastic-calculus/
  description: "Tích phân Itô, công thức Itô, phương trình vi phân ngẫu nhiên."
  tags: [giải tích, ngẫu nhiên, tài chính]
  data_key: stochastic
```

#### Bước 4: Tạo CSS cho sách (hoặc dùng shared)

**Option A: Dùng chung style Markov** (nhanh, tạm thời)

Không cần tạo file mới. Layout vẫn load `markov.css` + `markov-themes.css`.

**Option B: Tạo CSS riêng** (khuyến nghị khi scale)

Tạo `css/themes/stochastic.css`:

```css
/* Stochastic Calculus — Book-specific palette */
body {
  font-family: 'Literata', Georgia, serif;
  font-size: 1rem;
  line-height: 1.85;
  color: var(--text-body, #2e2a25);
  background: var(--bg-body, #f4ecd8);
}

/* Box colors — có thể khác Markov */
.box.definition { --box-header: #2e7d32; --box-bg: #f6fbf4; --box-border: #a5d6a7; }
.box.theorem    { --box-header: #b71c1c; --box-bg: #fdf4f2; --box-border: #e0a8a0; }
.box.formula    { --box-header: #c49000; --box-bg: #fefbf0; --box-border: #e0d5a0; }
.box.summary    { --box-header: #1565c0; --box-bg: #f2f7fc; --box-border: #a8c8e8; }

/* ... (copy patterns từ markov.css, chỉnh palette) */
```

**Lưu ý:** Hiện tại `book-chapter.html` hardcode CSS files. Khi có sách thứ 2, cần refactor layout thành:

```html
<!-- Concept — chưa implement -->
<link rel="stylesheet" href="{{ '/css/framework.css' | relative_url }}">
{% assign css_key = page.book_key | default: 'markov' %}
<link rel="stylesheet" href="{{ '/css/themes/' | append: css_key | append: '.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/css/themes/' | append: css_key | append: '-themes.css' | relative_url }}">
```

#### Bước 5: Tạo sidebar

```bash
mkdir -p _includes/sidebars/stochastic
```

Tạo `_includes/sidebars/stochastic/ch1.html`:

```html
<div class="sidebar-card">
  <h4><span class="material-icons-outlined">functions</span> Ký hiệu chính</h4>
  <table class="symbol-table">
    <tr><td>\(W_t\)</td><td>Chuyển động Brown</td></tr>
    <tr><td>\(\int_0^t f \, dW\)</td><td>Tích phân Itô</td></tr>
  </table>
</div>
```

#### Bước 6: Tạo chapter HTML files

Tạo `books/stochastic-calculus/ch1.html`:

```html
---
layout: book-chapter
slug: ch1
book_key: stochastic
sidebar_include: sidebars/stochastic/ch1.html
title: "Ch 1: Tích phân Itô"
sections:
  - id: gioi-thieu
    title: "1. Giới thiệu"
  - id: tich-phan-ito
    title: "2. Tích phân Itô"
---

<h2 id="gioi-thieu">1. Giới thiệu</h2>
<p>Nội dung...</p>

{% include components/box-start.html type="definition" id="def-ito-integral" title='Định nghĩa 1.1 — Tích phân Itô' title_en="Itô Integral" %}
  <p>Cho \(f\) là hàm khả dự đoán...</p>
{% include components/box-end.html %}
```

#### Bước 7: Tạo book landing page

Tạo `books/stochastic-calculus/index.html` (standalone, không dùng layout).

**Lưu ý:** Đây là file standalone — cần copy + sửa từ `books/markov-chains/index.html`. Là một coupling risk (xem §Ràng buộc kiến trúc).

#### Bước 8: Build + verify

```bash
eval "$(rbenv init -)"
bundle exec jekyll build

# Verify
open _site/index.html                           # Landing page hiện sách mới
open _site/books/stochastic-calculus/ch1.html    # Chapter render đúng
```

### Checklist verification

```
[ ] _data/books.yml có entry mới với data_key đúng
[ ] _data/stochastic/chapters.yml tồn tại
[ ] Mỗi chapter HTML có front matter: layout, slug, book_key
[ ] slug trong front matter khớp chapters.yml
[ ] book_key khớp data_key trong books.yml
[ ] sidebar_include path đúng và file tồn tại
[ ] Landing page hiển thị sách mới (stats, progress bar, timeline)
[ ] Chapter pages: TOC sidebar hiển thị, heading đúng, prev/next hoạt động
[ ] Jekyll build thành công (không warning)
```

---

## Playbook B: Thêm component type mới

**Ví dụ:** Thêm component `remark` hoặc `corollary`.

### Option 1: Map vào type hiện có (khuyến nghị)

Nếu component mới tương tự một type đã có:

| Component mới | Map vào type | Lý do |
|--------------|-------------|-------|
| `corollary` | `theorem` (đỏ) | Hệ quả = loại định lý |
| `lemma` | `theorem` (đỏ) | Bổ đề = loại định lý |
| `remark` | `summary` (xanh dương) | Nhận xét = tóm tắt |
| `notation` | `definition` (xanh lá) | Ký hiệu = loại định nghĩa |

Cú pháp: chỉ cần dùng `type` phù hợp trong `box-start.html`:

```html
{% include components/box-start.html type="theorem" title='Hệ quả 2.1 — Tên hệ quả' %}
```

### Option 2: Tạo type mới hoàn toàn

Nếu cần style riêng (màu khác, icon khác):

#### Bước 1: Edit `_includes/components/box-start.html`

Thêm mapping icon:

```html
{% elsif include.type == 'remark' %}comment
```

#### Bước 2: Thêm CSS trong file book CSS (`markov.css` hoặc per-book CSS)

```css
.box.remark { --box-header: #795548; --box-bg: #faf5f0; --box-border: #c8a882; }
```

#### Bước 3: Nếu secondary tier (left-border thay vì full header)

Thêm vào `framework.css`:

```css
.box.remark .box-title {
  background: none;
  color: var(--box-header);
  border-left: 4px solid var(--box-header);
}

.box.remark {
  box-shadow: none;
}
```

#### Bước 4: Dark mode override (nếu có)

Thêm vào `markov-themes.css`:

```css
html[data-theme="dark"] .box.remark { --box-bg: #2e2a1a; --box-border: #5a4a2a; }
```

### Option 3: Tạo component hoàn toàn mới (không phải box)

Nếu component mới có HTML structure khác (ví dụ: `algorithm`, `figure-group`):

1. Tạo `_includes/components/algorithm-start.html` + `algorithm-end.html`
2. Thêm CSS vào `framework.css` (structure) + per-book CSS (colors)
3. Cập nhật `docs/03_component_and_ui_modularization.md`

---

## Playbook C: Thêm theme mới

### Bước 1: Chọn palette

Mỗi theme cần ~30 CSS variables. Minimum:

```css
html[data-theme="ocean"] {
  --bg-body: #e8f0f8;
  --bg-toc: #dce8f2;
  --bg-sidebar: #e0eaf4;
  --bg-card: #f0f6fc;
  --text-body: #1a2a3a;
  --text-heading: #0a3d6b;
  --text-h3: #2a4a6a;
  --text-muted: #6a8a9a;
  --text-toc: #3a5a70;
  --text-toc-link: #4a6a80;
  --text-sidebar: #5a7a90;
  --border-color: #b0c8d8;
  --border-heading: #8ab0cc;
  --toc-hover-bg: #d0e0f0;
  --toc-current-bg: #c0d8e8;
  --table-header-bg: #d0e0f0;
  --nav-link-color: #0a3d6b;
  --example-bg: #f0f6fc;
  --example-border: #b0c8d8;
  --example-title-color: #5a7a90;
  --proof-color: #4a6a80;
  --proof-border: #90b0c8;
  --card-text: #5a7a90;
  --card-subtitle: #6a8a9a;
  --section-link-color: #5a7a90;
  --sidebar-heading-border: #b0c8d8;
  --sidebar-cell-border: #d0e0f0;
  --responsive-border: #b0c8d8;
  --link-color: #0a3d6b;
  --link-hover: #062d50;
  --link-visited: #4a2a7a;
}
```

### Bước 2: Thêm vào `markov-themes.css` (hoặc per-book themes file)

Thêm block CSS variables ở vị trí phù hợp (sau theme cuối, trước dark mode overrides nếu cần).

### Bước 3: Thêm swatch card trong `book-chapter.html`

```html
<button class="theme-card" data-theme="ocean">
  <div class="theme-card-swatch"></div>
  Ocean
</button>
```

### Bước 4: Thêm swatch color

Trong `markov-themes.css`:

```css
.theme-card[data-theme="ocean"] .theme-card-swatch { background: #e8f0f8; }
```

### Bước 5: Đăng ký trong JS

Thêm `'ocean'` vào array `THEMES` trong `js/settings.js`:

```javascript
var THEMES = ['original', 'quiet', 'paper', 'bold', 'calm', 'focus', 'dark', 'ocean'];
```

### Bước 6: Test

- Chọn theme mới trong settings panel
- Verify tất cả elements: body, TOC, sidebar, boxes, examples, exercises, reviews
- Refresh page → theme phải persist (localStorage)
- Switch qua lại giữa themes → không có flash

---

## Playbook D: Thêm bilingual feature

### Pattern hiện tại

Bilingual content dùng 2 cơ chế:

1. **Title-level:** `title_en` param trong box component

```html
{% include components/box-start.html type="definition" title='Định nghĩa 1.1' title_en="Definition 1.1" %}
```

Render: `<span class="box-title-en">Definition 1.1</span>` (nhỏ hơn, opacity 0.75).

2. **Heading-level:** `heading` + `heading_en` trong chapters.yml

```yaml
heading: "Chương 1: Chuỗi Markov thời gian rời rạc"
heading_en: "Discrete-Time Markov Chains"
```

Render: `<h1>heading<br><small>heading_en</small></h1>`.

3. **Content-level:** Inline switching (chưa implement). Hiện tại nội dung viết xen kẽ tiếng Việt + thuật ngữ tiếng Anh trong ngoặc.

### Thêm bilingual param cho component mới

Nếu muốn thêm `title_en` cho example/exercise/review:

1. Edit `_includes/components/example-start.html`:

```html
<div class="example"{% if include.id %} id="{{ include.id }}"{% endif %}>
{% if include.title %}
  <p class="example-title">
    <span class="box-icon material-icons-outlined">edit_note</span>
    {{ include.title }}
    {% if include.title_en %} <span class="box-title-en">{{ include.title_en }}</span>{% endif %}
  </p>
{% endif %}
```

2. CSS class `box-title-en` đã có sẵn trong `framework.css`:

```css
.box-title-en {
  font-weight: normal;
  font-size: 0.85em;
  opacity: 0.75;
  margin-left: 4px;
}
```

---

## Ràng buộc Kiến trúc

### R1: Không hardcode book-specific logic trong `framework.css`

`framework.css` là shared layer. Quy tắc:

- Box colors (`.box.definition { --box-header: ... }`) → **per-book CSS** (`markov.css`)
- Box structure (`.box`, `.box-title`, `.box-body`) → `framework.css`
- Font family → **per-book CSS**
- Color palette → **per-book CSS** hoặc **themes CSS**

### R2: Mỗi sách phải có CSS theme riêng (hoặc explicit shared)

Khi thêm sách mới, phải chọn 1 trong 2:

1. Tạo `css/themes/<key>.css` riêng
2. Ghi chú rõ ràng: "Sách X dùng chung CSS với Markov" (có ý thức, không phải vô tình)

### R3: MathJax macro namespace convention

- Macros chuẩn (`\PP`, `\E`, `\N`, `\Z`, `\R`, `\ind`): giữ nghĩa chuẩn, không override
- Macros per-book: dùng prefix 2-3 ký tự. Ví dụ: `\mkP` (Markov), `\scW` (Stochastic Calculus)
- Nếu 2 sách cần cùng macro nhưng nghĩa khác → **bắt buộc** dùng prefix

### R4: `sidebar_include` path convention

```
sidebars/<book_key>/<chapter_slug>.html
```

Ví dụ: `sidebars/markov/ch1.html`, `sidebars/stochastic/appendix.html`.

**Luôn đặt trong thư mục namespace theo `book_key`**, không bao giờ flat list.

### R5: Front matter validation checklist

Trước khi commit chapter mới, kiểm tra 4 ràng buộc:

| # | Kiểm tra | Nếu sai |
|---|---------|---------|
| 1 | `layout: book-chapter` | Render raw HTML |
| 2 | `slug` khớp `chapters.yml[].slug` | Heading nil, prev/next mất |
| 3 | `book_key` khớp `books.yml[].data_key` | TOC trống, title nil |
| 4 | `sidebar_include` file tồn tại | Sidebar trống |

Tất cả lỗi trên đều **fail silently** — không có error message.

---

## Performance: Jekyll Build Time

### Ước tính

| Số sách | Số trang (est.) | Build time (est.) | Ghi chú |
|---------|-----------------|-------------------|---------|
| 1 | ~10 | ~0.07s | Hiện tại |
| 5 | ~50 | ~0.3s | Chấp nhận được |
| 10 | ~100 | ~0.5-1s | Vẫn nhanh |
| 50 | ~500 | ~3-5s | Bắt đầu chậm |
| 100+ | ~1000+ | ~10s+ | Cần xem xét optimization |

### Lazy-load strategies (khi cần)

1. **MathJax lazy-load:** Chỉ render MathJax khi element visible (Intersection Observer)
2. **Image lazy-load:** `loading="lazy"` attribute trên `<img>`
3. **Incremental build:** `bundle exec jekyll build --incremental` (chỉ rebuild trang thay đổi)
4. **Exclude heavy books:** Dùng `_config.yml > exclude` để bỏ sách chưa cần build khi dev

---

## 9 Coupling Risks & Mitigation

### Risk 1: CSS book-specific hardcoded trong layout

**Hiện trạng:** `book-chapter.html` dòng 59-61 hardcode `markov.css` + `markov-themes.css`.

**Mitigation:** Refactor thành conditional loading theo `page.book_key` hoặc front matter variable `css_theme`.

### Risk 2: Sidebar hoàn toàn thủ công

**Hiện trạng:** Mỗi chapter cần 1 file sidebar viết tay. 50 sách × 7 chương = 350 files.

**Mitigation:** Tạo sidebar template generator trong script. Hoặc tạo default sidebar (từ chapters.yml metadata) + optional custom override.

### Risk 3: `markov-themes.css` chứa quá nhiều concern

**Hiện trạng:** Font sizes (dùng chung) + theme colors (có thể per-book) + floating UI (dùng chung) = 1 file.

**Mitigation:** Tách thành:
- `css/shared-ui.css` — floating buttons, settings panel, toast
- `css/shared-themes.css` — font sizes, shared themes (nếu muốn)
- `css/themes/<key>-themes.css` — per-book theme overrides

### Risk 4: `chapters` count redundant trong `books.yml`

**Hiện trạng:** `chapters: 7` trong `books.yml` không dùng cho logic, chỉ informational. Dễ lệch.

**Mitigation:** Xoá field `chapters` khỏi `books.yml` — `index.html` đã auto-count từ `chapters.yml`.

### Risk 5: MathJax macros global

**Hiện trạng:** Tất cả macros chung cho mọi sách. Xung đột tiềm ẩn.

**Mitigation:** Dùng prefix convention (xem R3). Hoặc tạo per-book mathjax config.

### Risk 6: `book-nav.html` linear scan

**Hiện trạng:** Loop qua toàn bộ `books.yml` mỗi chapter page render.

**Mitigation:** Với Jekyll build-time, đây không phải bottleneck thực sự. 50 sách × 500 pages = 25,000 iterations — Liquid vẫn xử lý nhanh. Chỉ cần optimize nếu build time > 10s.

### Risk 7: Book landing page standalone

**Hiện trạng:** `books/markov-chains/index.html` là HTML standalone, không dùng layout. Mỗi sách mới phải duplicate.

**Mitigation:** Tạo layout `book-landing.html` cho book index pages. Dùng data-driven rendering từ `books.yml` + `chapters.yml`.

### Risk 8: Front matter repetition

**Hiện trạng:** 4 fields phải đồng bộ thủ công. Silent failure nếu sai.

**Mitigation:** Pre-commit hook hoặc script validation. Hoặc giảm redundancy bằng cách derive `sidebar_include` tự động từ `book_key` + `slug`.

### Risk 9: Thiếu validation/error reporting

**Hiện trạng:** Tất cả lỗi data (slug sai, path sai, key sai) đều fail silently.

**Mitigation:** Tạo script `validate.py` chạy trước build: kiểm tra data_key → thư mục, slug → front matter, sidebar_include → file tồn tại. Báo lỗi rõ ràng.

---

*Tài liệu này là prescriptive — quy chuẩn, quy tắc, playbook. Xem `ARCHITECTURE.md` cho mô tả trạng thái hiện tại.*
