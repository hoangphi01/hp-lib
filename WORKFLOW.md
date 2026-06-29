# Quy trình Nhập sách — HP Library

> Tài liệu tham khảo nội bộ cho việc thêm sách/tài liệu nghiên cứu mới vào thư viện.
> Cập nhật lần cuối: 2026-06-29.

---

## 1. Tổng quan

Pipeline chuyển đổi tài liệu LaTeX thành website tĩnh:

```
LaTeX (.tex)
   │
   ▼
Python Pre-processor (scripts/process_book.py)
   │
   ├── HTML chapters   →  books/<book-slug>/ch1.html, ch2.html, ...
   ├── chapters.yml    →  _data/<book_key>/chapters.yml
   ├── sidebar HTML    →  _includes/sidebars/<book_key>/ch1.html, ...
   └── books.yml       →  _data/books.yml  (append entry)
   │
   ▼
Jekyll Build (bundle exec jekyll build)
   │
   ▼
Cloudflare Pages (auto-deploy on git push to main)
```

**Nguyên tắc cốt lõi:** Mỗi sách là một thư mục thuần (`books/<slug>/`) + một namespace dữ liệu (`_data/<key>/`). Không dùng Jekyll collections. Layout `book-chapter.html` đọc metadata từ YAML để render navigation, heading, OG tags tự động.

---

## 2. Cấu trúc thư mục

```
hp-lib/
├── _config.yml
├── _data/
│   ├── books.yml                  # Registry tất cả sách
│   └── markov/                    # Namespace per-book
│       ├── chapters.yml           # Metadata chương (nav, status, description)
│       └── weekly.yml             # Tuỳ chọn: log cập nhật hàng tuần
│
├── _includes/
│   ├── components/                # 8 component includes (box, example, exercise, review)
│   ├── sidebars/
│   │   └── markov/                # Sidebar per-chapter per-book
│   │       ├── ch1.html
│   │       └── default.html
│   ├── book-nav.html              # TOC navigation (dùng chung)
│   └── mathjax.html               # MathJax v3 config + macros
│
├── _layouts/
│   ├── default.html               # Landing page layout
│   └── book-chapter.html          # 3-column chapter layout
│
├── books/
│   └── markov-chains/             # Slug = URL path
│       ├── index.html             # Book landing page
│       ├── intro.html
│       ├── ch1.html ... ch5.html
│       └── appendix.html
│
├── scripts/                       # <-- THƯ MỤC SCRIPT (tạo khi cần)
│   └── process_book.py            # Pre-processor LaTeX → HTML + YAML
│
├── raw_books/                     # <-- SOURCE GỐC (gitignored)
│   └── my-new-book/
│       ├── main.tex
│       ├── chapter1.tex
│       ├── chapter2.tex
│       └── images/
│           ├── fig1.png
│           └── fig2.pdf
│
├── css/
│   ├── framework.css              # Grid, boxes, typography (dùng chung)
│   ├── library.css                # Landing page styles
│   └── themes/
│       ├── markov.css             # Book-specific palette
│       └── markov-themes.css      # 7 themes + font size levels
│
├── js/
│   ├── deeplink.js                # URL hash tracking + share + status highlight
│   ├── nav.js                     # TOC navigation logic
│   └── settings.js                # Theme/font size switcher
│
└── index.html                     # Library landing page
```

**Lưu ý:** Thư mục `raw_books/` chứa source gốc, nên thêm vào `.gitignore` và `_config.yml > exclude`. Chỉ output đã xử lý mới được commit.

---

## 3. Quy trình từng bước

### Bước 1: Chuẩn bị source gốc

Tạo thư mục cho sách mới trong `raw_books/`:

```
raw_books/my-new-book/
├── main.tex           # File chính (hoặc từng chapter riêng)
├── chapter1.tex
├── chapter2.tex
└── images/
    └── fig1.png
```

**Yêu cầu:**
- Mỗi chương nên là một file `.tex` riêng (hoặc dùng `\include{}` trong `main.tex`)
- Ảnh đặt trong `images/` — script sẽ copy sang `assets/images/<book_key>/`
- Đặt tên file rõ ràng: `chapter1.tex`, `chapter2.tex`, hoặc theo tên section

### Bước 2: Chạy script tiền xử lý

```bash
# Cú pháp cơ bản
python scripts/process_book.py \
  --id my-new-book \
  --source raw_books/my-new-book/ \
  --title-vi "Giải tích Ngẫu nhiên" \
  --title-en "Stochastic Calculus" \
  --source-ref "Shreve (2004)"

# Nếu chỉ xử lý lại 1 chương (đã có metadata)
python scripts/process_book.py \
  --id my-new-book \
  --chapter 3 \
  --reprocess
```

Script sẽ thực hiện:

| Hành động | Output |
|-----------|--------|
| Parse LaTeX environments | `books/my-new-book/ch1.html` ... |
| Tạo chapters.yml | `_data/mynewbook/chapters.yml` |
| Append vào books.yml | `_data/books.yml` (thêm entry mới) |
| Tạo sidebar templates | `_includes/sidebars/mynewbook/ch1.html` ... |
| Copy ảnh | `assets/images/mynewbook/` |

### Bước 3: Kiểm tra metadata

**3a. Kiểm tra `_data/books.yml`** — entry mới phải có đủ các trường:

```yaml
- slug: my-new-book
  title_vi: "Giải tích Ngẫu nhiên"
  title_en: "Stochastic Calculus"
  subtitle: "Tài liệu Song ngữ Việt-Anh"
  source: "Shreve (2004)"
  status: active           # active | draft | planned
  chapters: 5
  url: /books/my-new-book/
  description: "Mô tả ngắn về sách..."
  tags: [xác suất, giải tích, tài chính]
  data_key: mynewbook      # Tên thư mục trong _data/ (không dấu gạch ngang)
```

**3b. Kiểm tra `_data/mynewbook/chapters.yml`** — mỗi chương cần:

```yaml
- slug: ch1
  url: /books/my-new-book/ch1.html
  nav_title: "Ch 1: Tích phân Itô"
  heading: "Chương 1: Tích phân Itô"
  heading_en: "Itô Integration"
  description: "Mô tả nội dung chương..."
  status: done             # done | in-progress | planned
  last_updated: 2026-07-01
```

**3c. Kiểm tra front matter** trong mỗi file HTML chapter:

```yaml
---
layout: book-chapter
slug: ch1
book_key: mynewbook
sidebar_include: sidebars/mynewbook/ch1.html
title: "Ch 1: Tích phân Itô"
sections:
  - id: gioi-thieu
    title: "1. Giới thiệu"
  - id: tich-phan-ito
    title: "2. Tích phân Itô"
---
```

**3d. Build thử:**

```bash
eval "$(rbenv init -)"   # Nếu dùng rbenv
bundle exec jekyll build
```

Kiểm tra `_site/books/my-new-book/ch1.html` — mở trong browser, xác nhận:
- Navigation trái hiển thị đúng các chương
- MathJax render công thức
- Component boxes (definition, theorem) hiển thị đúng style

### Bước 4: Triển khai

```bash
# Stage các file output (KHÔNG stage raw_books/)
git add books/my-new-book/ \
        _data/mynewbook/ \
        _data/books.yml \
        _includes/sidebars/mynewbook/ \
        assets/images/mynewbook/

git commit -m "feat: thêm sách Giải tích Ngẫu nhiên (Shreve 2004)"
git push
```

Cloudflare Pages tự động build và deploy. Kiểm tra tại `https://hp-lib.io.vn/books/my-new-book/`.

---

## 4. Quy chuẩn soạn thảo LaTeX

Script pre-processor parse LaTeX dựa trên **các environment và lệnh chuẩn**. Tuân thủ các quy tắc sau để đảm bảo parser hoạt động chính xác:

### Cấu trúc tài liệu

- **Sectioning:** Dùng `\section{}`, `\subsection{}`, `\subsubsection{}` — script map sang `<h2>`, `<h3>`, `<h4>`
- **Mỗi `\section` tạo một section mới** trong `chapters.yml` (trường `sections` trong front matter)
- **Label:** Dùng `\label{sec:ten-section}` ngay sau `\section{}` — script tạo `id` từ label

### Environments được hỗ trợ

| LaTeX Environment | Component HTML | CSS Class |
|-------------------|---------------|-----------|
| `\begin{definition}...\end{definition}` | `box-start.html type="definition"` | `.box.definition` |
| `\begin{theorem}...\end{theorem}` | `box-start.html type="theorem"` | `.box.theorem` |
| `\begin{lemma}...\end{lemma}` | `box-start.html type="theorem"` | `.box.theorem` |
| `\begin{corollary}...\end{corollary}` | `box-start.html type="theorem"` | `.box.theorem` |
| `\begin{proposition}...\end{proposition}` | `box-start.html type="theorem"` | `.box.theorem` |
| `\begin{proof}...\end{proof}` | `<div class="proof">` | `.proof` |
| `\begin{example}...\end{example}` | `example-start.html` | `.example` |
| `\begin{exercise}...\end{exercise}` | `exercise-start.html` | `.exercise` |
| `\begin{remark}...\end{remark}` | `box-start.html type="summary"` | `.box.summary` |

### Toán học

- **Inline:** `$...$` hoặc `\(...\)` — cả hai đều được, script giữ nguyên cho MathJax
- **Display:** `\[...\]` hoặc `\begin{equation}...\end{equation}` — script giữ nguyên
- **Aligned:** `\begin{align}...\end{align}` hoặc `\begin{align*}...\end{align*}`
- **Custom macros:** Khai báo trong `_includes/mathjax.html`. Hiện có: `\PP`, `\E`, `\N`, `\Z`, `\R`, `\ind`
- **Thêm macro mới:** Nếu source dùng macro không có sẵn, thêm vào `mathjax.html` **trước** khi chạy script, hoặc script sẽ tự detect `\newcommand` trong preamble và append

### Những thứ cần tránh

- **Không dùng custom environment** mà parser không biết (ví dụ: `\begin{mytheorem}`) — thêm vào mapping trong script trước
- **Không dùng `\input{}` lồng nhau** quá 2 cấp — script chỉ resolve 1 cấp `\include`/`\input`
- **Không dùng `$$...$$`** cho display math — dùng `\[...\]` hoặc environment
- **Không dùng `\def`** — dùng `\newcommand` để script detect được
- **Ảnh:** Dùng `\includegraphics{images/fig1}` (đường dẫn tương đối từ thư mục source). Script tự thêm extension nếu thiếu

### ID cho deep-linking

Nếu muốn deep-link đến component cụ thể, thêm `\label{}` trong environment:

```latex
\begin{definition}\label{def:markov-property}
  Nội dung...
\end{definition}
```

Script sẽ chuyển thành:

```html
{% include components/box-start.html type="definition" id="def-markov-property" title='...' %}
```

---

## 5. Xử lý sự cố

### 5.1. MathJax không render — công thức hiển thị raw

**Nguyên nhân thường gặp:**

- **Ký tự `|` trong bảng HTML:** MathJax parse `|` như delimiter. Trong context bảng HTML, escape thành `\vert` hoặc `\mid`
- **Dấu `_` và `*` bị Markdown xử lý:** File **phải là `.html`**, không phải `.md`. Nếu ai đó đổi extension thành `.md`, Kramdown sẽ phá cấu trúc MathJax
- **Thiếu macro:** Kiểm tra `_includes/mathjax.html` — nếu source dùng `\Var` mà chưa khai báo, MathJax sẽ báo lỗi trong console

**Fix nhanh:**

```bash
# Mở DevTools console, tìm lỗi MathJax
# Thường thấy: "Undefined control sequence \Var"
# → Thêm vào mathjax.html: Var: "\\operatorname{Var}"
```

### 5.2. Parser bỏ sót environment — box không xuất hiện

**Nguyên nhân:**

- Environment không nằm trong mapping của script (ví dụ: `\begin{claim}`)
- Environment bị lồng trong `\begin{proof}` — parser có thể bỏ qua nested environments

**Fix:**

1. Thêm environment vào mapping trong `scripts/process_book.py`:

```python
ENV_MAP = {
    'definition': ('box-start', 'definition'),
    'theorem': ('box-start', 'theorem'),
    'claim': ('box-start', 'theorem'),      # ← thêm dòng này
    # ...
}
```

2. Chạy lại script: `python scripts/process_book.py --id my-book --reprocess`

### 5.3. Sidebar trống hoặc navigation sai

**Nguyên nhân:**

- `book_key` trong front matter không khớp với tên thư mục trong `_data/`
- `slug` trong front matter không khớp với `slug` trong `chapters.yml`
- `sidebar_include` trỏ sai path

**Checklist:**

```
Front matter:    book_key: mynewbook
Data directory:  _data/mynewbook/chapters.yml  ← phải khớp
Chapter slug:    slug: ch1
chapters.yml:    - slug: ch1                   ← phải khớp
Sidebar:         sidebar_include: sidebars/mynewbook/ch1.html
File tồn tại:    _includes/sidebars/mynewbook/ch1.html  ← phải tồn tại
```

### 5.4. Landing page không hiện sách mới

**Nguyên nhân:** Thiếu hoặc sai `data_key` trong `_data/books.yml`.

`index.html` dùng `site.data[book.data_key].chapters` để tính stats. Nếu `data_key` không khớp tên thư mục trong `_data/`, stats sẽ là 0 và progress bar trống.

---

## 6. Tham khảo nhanh

### Thêm sách mới — checklist tối thiểu

```
□  raw_books/my-book/          ← source .tex + images
□  scripts/process_book.py     ← chạy script
□  books/my-book/              ← HTML output
□  _data/mybook/chapters.yml   ← metadata chương
□  _data/books.yml             ← thêm entry
□  _includes/sidebars/mybook/  ← sidebar per-chapter
□  bundle exec jekyll build    ← build thành công
□  git add + commit + push     ← deploy
```

### Component includes — cú pháp

```html
{% include components/box-start.html type="definition" id="def-xyz" title='Tiêu đề' %}
  <p>Nội dung...</p>
{% include components/box-end.html %}

{% include components/example-start.html id="ex-xyz" title='Tiêu đề' %}
  <p>Nội dung...</p>
{% include components/example-end.html %}

{% include components/review-start.html id="review-xyz" title="Tiêu đề" %}
  <p>Nội dung (collapsible)...</p>
{% include components/review-end.html %}
```

**Box types:** `definition` (xanh lá), `theorem` (đỏ), `formula` (vàng, left-border), `summary` (xanh dương, left-border)

### Deep-link với status

```
https://hp-lib.io.vn/books/markov-chains/ch1.html?status=wip#def-markov-property
https://hp-lib.io.vn/books/markov-chains/ch1.html?status=done#ex-random-walk
```

`?status=wip` → highlight vàng + badge "Trọng tâm hiện tại"
`?status=done` → highlight xanh + badge "Đã hoàn thành"
