# Tổng quan Kiến trúc — HP Library

> Tài liệu quy chuẩn thiết kế hệ thống. Dùng làm tham chiếu khi mở rộng lên hàng trăm sách.

---

## 1. Triết lý thiết kế

### Nguyên tắc cốt lõi

1. **Mỗi sách = 1 thư mục thuần + 1 data namespace.** Không dùng Jekyll collections, không dùng plugin. Một thư mục `books/<slug>/` chứa HTML, một thư mục `_data/<key>/` chứa metadata.
2. **Data-driven rendering.** UI không hardcode nội dung — tất cả text, navigation, stats đều đọc từ YAML qua Liquid templates.
3. **CSS scope isolation.** Landing page (`lib-*` prefix) và chapter pages (`framework.css` + per-book theme) hoàn toàn tách biệt, không chia sẻ class nào.
4. **Vanilla stack.** Không build tools (webpack, vite), không framework JS, không preprocessor CSS. Chỉ Jekyll + HTML + CSS + vanilla JS.
5. **Static-first.** Toàn bộ logic render ở build time (Liquid). Client JS chỉ xử lý theme switching, scroll tracking, search filter.

### Tại sao không dùng Jekyll collections?

Jekyll collections (`_books/`) bắt buộc convention `_` prefix, auto-generate URL, đòi hỏi config phức tạp. Approach hiện tại (plain subdirectories) cho phép:

- URL structure hoàn toàn tự chủ (`/books/markov-chains/ch1.html`)
- Không phụ thuộc Jekyll-specific behavior
- Dễ migrate sang static site generator khác nếu cần

---

## 2. Pipeline tổng thể

```
LaTeX (.tex files)
    |
    v
Python Pre-processor (scripts/process_book.py)   <-- Chưa implement
    |
    +---> books/<slug>/ch1.html, ch2.html, ...     (HTML chapters)
    +---> _data/<key>/chapters.yml                 (Chapter metadata)
    +---> _includes/sidebars/<key>/ch1.html, ...   (Sidebar templates)
    +---> _data/books.yml                          (Append entry)
    +---> assets/images/<key>/                     (Copy images)
    |
    v
Jekyll Build (bundle exec jekyll build)
    |
    v
Static HTML (_site/)
    |
    v
Cloudflare Pages (auto-deploy on git push to main)
```

**Lưu ý:** Pipeline Python chưa tồn tại. Hiện tại nội dung được soạn thủ công. Xem `docs/04_pipeline_and_automation_workflow.md` cho spec chi tiết.

---

## 3. Kiến trúc 2 Layout

Hệ thống có đúng **2 layout**, mỗi layout tải bộ CSS/JS riêng biệt:

### 3.1. `default.html` — Landing page

```
+----------------------------------------------+
|  lib-navbar (fixed top, blur backdrop)       |
+----------------------------------------------+
|                                              |
|  {{ content }}  ← index.html inject vào đây  |
|                                              |
+----------------------------------------------+
|  lib-footer                                  |
+----------------------------------------------+

CSS: library.css
JS:  library.js
```

- **Scope:** Trang chủ thư viện (`/`)
- **CSS prefix:** `lib-*` (BEM naming nghiêm ngặt)
- **Không load** `framework.css`, `markov.css`, hay bất kỳ book CSS nào
- **Không load** MathJax

### 3.2. `book-chapter.html` — Trang chương sách (3 cột)

```
+--------+------------------+-----------+
|  TOC   |     Content      |  Sidebar  |
| 220px  |   max 820px      |   280px   |
|        |                  |           |
| book-  |  <h1> heading    | sidebar_  |
| nav    |  {{ content }}   | include   |
| .html  |  chapter-nav     |           |
|        |  (prev/next)     |           |
+--------+------------------+-----------+

                        Floating buttons (bottom-right)
                        Settings panel (theme/font)

CSS: framework.css + markov.css + markov-themes.css
JS:  nav.js + settings.js + deeplink.js
```

- **Scope:** Tất cả chapter pages (`/books/<slug>/ch*.html`)
- **Liquid logic trong `<head>`:** Resolve `book_data`, `ch_data`, `prev_ch`, `next_ch` từ YAML
- **Flash prevention:** Inline `<script>` trong `<head>` apply theme/font từ `localStorage` trước khi CSS load

---

## 4. Cây thư mục chuẩn

```
hp-lib/
+-- _config.yml                          # Jekyll config (tối giản, ~11 dòng)
+-- index.html                           # Landing page (layout: default)
+-- CNAME                                # Domain: hp-lib.io.vn
|
+-- _layouts/
|   +-- default.html                     # Landing page layout
|   +-- book-chapter.html                # 3-column chapter layout
|
+-- _includes/
|   +-- book-nav.html                    # TOC navigation (dùng chung mọi sách)
|   +-- mathjax.html                     # MathJax v3 config + macros
|   +-- components/                      # 8 component includes (4 cặp start/end)
|   |   +-- box-start.html              #   definition/theorem/formula/summary
|   |   +-- box-end.html
|   |   +-- example-start.html
|   |   +-- example-end.html
|   |   +-- exercise-start.html
|   |   +-- exercise-end.html
|   |   +-- review-start.html           #   Collapsible <details>
|   |   +-- review-end.html
|   +-- sidebars/
|       +-- markov/                      # 1 thư mục per book
|           +-- default.html
|           +-- intro.html
|           +-- ch1.html ... ch5.html
|           +-- appendix.html
|
+-- _data/
|   +-- books.yml                        # Registry tất cả sách
|   +-- markov/                          # Namespace per-book (key = data_key)
|       +-- chapters.yml                 #   Metadata 9 chapters
|       +-- weekly.yml                   #   Log tiến độ (tuỳ chọn)
|
+-- books/
|   +-- markov-chains/                   # slug = URL path segment
|       +-- index.html                   # Book landing (standalone)
|       +-- intro.html
|       +-- ch1.html ... ch5.html
|       +-- appendix.html
|
+-- css/
|   +-- library.css                      # Landing page (BEM lib-*)
|   +-- framework.css                    # Chapter framework (dùng chung)
|   +-- themes/
|       +-- markov.css                   # Book-specific palette + typography
|       +-- markov-themes.css            # 7 themes + font sizes + floating UI
|
+-- js/
|   +-- library.js                       # Landing: search, filter, navbar
|   +-- nav.js                           # Chapter: TOC tracking, smooth scroll
|   +-- settings.js                      # Chapter: theme/font switcher
|   +-- deeplink.js                      # Chapter: hash tracking, share, status highlight
|
+-- assets/
|   +-- covers/                          # Book cover images
|   +-- images/                          # Per-book image directories
|
+-- .github/
    +-- workflows/
        +-- jekyll.yml                   # CI: build + deploy
```

---

## 5. Separation of Concerns

### CSS Scope

| File | Scope | Naming | Load bởi |
|------|-------|--------|----------|
| `library.css` | Landing page only | BEM `lib-*` prefix | `default.html` |
| `framework.css` | Tất cả chapter pages | Generic classes (`.box`, `.toc`, `.content`) | `book-chapter.html` |
| `markov.css` | Markov book only | Override CSS variables cho framework classes | `book-chapter.html` |
| `markov-themes.css` | Markov book only | `html[data-theme]` selectors, floating UI | `book-chapter.html` |

**Quy tắc:** `library.css` và `framework.css` KHÔNG BAO GIỜ được load cùng trang. Không có class nào overlap giữa hai file.

### JS Scope

| File | Scope | Chức năng |
|------|-------|-----------|
| `library.js` | Landing page | Navbar scroll shadow, hamburger menu, search/filter |
| `nav.js` | Chapter pages | Section scroll tracking, smooth scroll |
| `settings.js` | Chapter pages | Theme + font size switching, localStorage |
| `deeplink.js` | Chapter pages | URL hash tracking, share button, status highlight |

**Tổng:** 388 dòng vanilla ES5, không dependencies.

---

## 6. Luồng dữ liệu (Data Flow)

```
_data/books.yml ----+
                    |
                    +---> index.html (landing)
                    |       |
                    |       +---> Stats (total_books, total_chapters, done_chapters)
                    |       +---> SVG Progress Ring
                    |       +---> Linear Timeline (per-book)
                    |       +---> Book Cards (title, description, progress bar, tags)
                    |       +---> Search/Filter (data-title, data-tags attributes)
                    |
_data/<key>/        |
  chapters.yml -----+
                    |
                    +---> book-chapter.html (layout)
                    |       |
                    |       +---> <title> + OG meta tags
                    |       +---> <h1> heading + heading_en
                    |       +---> prev_ch / next_ch navigation
                    |
                    +---> book-nav.html (include)
                            |
                            +---> TOC sidebar: book title + chapter list
                            +---> Active state (.current class)
                            +---> Link "Thư viện" quay về trang chủ
```

### Ràng buộc dữ liệu (Data Contracts)

| Ràng buộc | Nếu vi phạm |
|-----------|-------------|
| `books.yml[].data_key` == tên thư mục `_data/<key>/` | Stats = 0, progress bar trống |
| `chapters.yml[].slug` == `page.slug` trong front matter | Heading nil, prev/next mất |
| `books.yml[].slug` == tên thư mục `books/<slug>/` | URL 404 |
| `sidebar_include` path tồn tại trong `_includes/` | Sidebar trống (fail silently) |

---

## 7. Anti-Monolithic Principles

### Tại sao mỗi sách cần CSS riêng?

- Mỗi sách có thể dùng font, palette, box colors khác nhau
- Nếu dồn tất cả vào 1 file CSS lớn → selector conflicts, file size phình
- Per-book CSS file cho phép cache riêng biệt (chỉ load CSS của sách đang đọc)

### Tại sao data namespace riêng?

- `site.data.markov.chapters` vs `site.data.stochastic.chapters` — không collision
- Thêm/xoá sách = thêm/xoá thư mục, không ảnh hưởng sách khác
- Liquid lookup `site.data[book_key].chapters` hoạt động tự nhiên

### Tại sao sidebar thủ công?

- Nội dung sidebar là domain-specific (ký hiệu toán, bảng tóm tắt)
- Không thể auto-generate có ý nghĩa từ nội dung chương
- Tradeoff: nhiều file thủ công nhưng nội dung chất lượng cao

---

*Xem thêm: `docs/02_data_schema_and_registry.md` cho chi tiết YAML schema.*
