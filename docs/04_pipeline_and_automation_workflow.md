# Pipeline & Automation Workflow — HP Library

> Quy chuẩn tiền xử lý LaTeX, mapping environments, CI/CD, và MathJax integration.

---

## 1. Tổng quan Pipeline

### Input/Output Pathways

```
INPUT                              OUTPUT
-----                              ------
raw_books/<id>/                    books/<slug>/
+-- main.tex                       +-- index.html        (book landing)
+-- chapter1.tex                   +-- ch1.html           (chapter)
+-- chapter2.tex                   +-- ch2.html
+-- images/                        +-- ...
    +-- fig1.png
    +-- fig2.pdf               _data/<key>/
                                +-- chapters.yml          (chapter metadata)
                                +-- weekly.yml            (tuỳ chọn)

                               _data/books.yml            (append entry)

                               _includes/sidebars/<key>/
                                +-- default.html          (sidebar mặc định)
                                +-- ch1.html              (sidebar per-chapter)
                                +-- ch2.html
                                +-- ...

                               assets/images/<key>/
                                +-- fig1.png              (copy images)
                                +-- fig2.png
```

### Quy ước đặt tên

| Concept | Quy ước | Ví dụ |
|---------|---------|-------|
| `<id>` | Tên thư mục source (raw) | `my-new-book` |
| `<slug>` | URL path segment (có gạch ngang) | `stochastic-calculus` |
| `<key>` | Data namespace (ngắn, không gạch ngang) | `stochastic` |
| Chapter file | `ch<N>.html` hoặc tên riêng | `ch1.html`, `intro.html`, `appendix.html` |
| Sidebar file | Khớp tên chapter file | `_includes/sidebars/stochastic/ch1.html` |

---

## 2. Command Interface (kế hoạch)

### Cú pháp cơ bản

```bash
python scripts/process_book.py \
  --id my-new-book \
  --source raw_books/my-new-book/ \
  --title-vi "Giải tích Ngẫu nhiên" \
  --title-en "Stochastic Calculus" \
  --source-ref "Shreve (2004)" \
  --data-key stochastic \
  --slug stochastic-calculus
```

### Xử lý lại 1 chương

```bash
python scripts/process_book.py \
  --id my-new-book \
  --chapter 3 \
  --reprocess
```

### Tham số

| Flag | Bắt buộc | Mô tả |
|------|----------|-------|
| `--id` | Co | Tên thư mục trong `raw_books/` |
| `--source` | Co | Path đến source directory |
| `--title-vi` | Co | Tiêu đề tiếng Việt |
| `--title-en` | Co | Tiêu đề tiếng Anh |
| `--source-ref` | Co | Trích dẫn nguồn |
| `--data-key` | Khong | Data namespace key (default: tên id bỏ gạch ngang) |
| `--slug` | Khong | URL slug (default: id) |
| `--chapter` | Khong | Chỉ xử lý 1 chương cụ thể |
| `--reprocess` | Khong | Ghi đè output nếu đã tồn tại |

**Lưu ý:** Script `process_book.py` và thư mục `scripts/`, `raw_books/` **chưa được tạo**. Đây là spec cho tương lai.

---

## 3. LaTeX Environment Mapping

### Bảng mapping

| LaTeX Environment | Component HTML | CSS Class | Icon |
|-------------------|---------------|-----------|------|
| `\begin{definition}...\end{definition}` | `box-start.html type="definition"` | `.box.definition` | `menu_book` |
| `\begin{theorem}...\end{theorem}` | `box-start.html type="theorem"` | `.box.theorem` | `verified` |
| `\begin{lemma}...\end{lemma}` | `box-start.html type="theorem"` | `.box.theorem` | `verified` |
| `\begin{corollary}...\end{corollary}` | `box-start.html type="theorem"` | `.box.theorem` | `verified` |
| `\begin{proposition}...\end{proposition}` | `box-start.html type="theorem"` | `.box.theorem` | `verified` |
| `\begin{proof}...\end{proof}` | `<div class="proof">...</div>` | `.proof` | (none) |
| `\begin{example}...\end{example}` | `example-start.html` | `.example` | `edit_note` |
| `\begin{exercise}...\end{exercise}` | `exercise-start.html` | `.exercise` | `fitness_center` |
| `\begin{remark}...\end{remark}` | `box-start.html type="summary"` | `.box.summary` | `lightbulb` |

### Sectioning mapping

| LaTeX | HTML | Front matter |
|-------|------|-------------|
| `\section{Title}` | `<h2 id="slug">` | Entry trong `sections[]` |
| `\subsection{Title}` | `<h3 id="slug">` | |
| `\subsubsection{Title}` | `<h4 id="slug">` | |

### Label → ID mapping

```latex
\begin{definition}\label{def:markov-property}
  Nội dung...
\end{definition}
```

Script chuyển thành:

```html
{% include components/box-start.html type="definition" id="def-markov-property" title='Định nghĩa — Tính chất Markov' %}
  <p>Nội dung...</p>
{% include components/box-end.html %}
```

**Quy ước:** `\label{prefix:kebab-case}` → `id="prefix-kebab-case"` (dấu `:` thành `-`).

---

## 4. Output Spec

### HTML chapter file structure

```yaml
---
layout: book-chapter
slug: ch1
book_key: <data_key>
sidebar_include: sidebars/<data_key>/ch1.html
title: "Ch 1: <tieu-de>"
sections:
  - id: <section-slug>
    title: "<section-title>"
---

<h2 id="<section-slug>"><section-title></h2>

{% include components/box-start.html type="definition" id="<label-id>" title='<title>' %}
  <p>Content converted from LaTeX...</p>
{% include components/box-end.html %}
```

### chapters.yml auto-generation

Script tự tạo `_data/<key>/chapters.yml` với entry cho mỗi chương:

```yaml
- slug: index
  url: /books/<slug>/
  nav_title: "Trang chủ"

- slug: ch1
  url: /books/<slug>/ch1.html
  nav_title: "Ch 1: <tieu-de-ngan>"
  heading: "Chương 1: <tieu-de-day-du>"
  heading_en: "<english-title>"
  description: "<mo-ta-tu-dong>"
  status: planned
  last_updated:
```

### Sidebar template generation

Script tạo skeleton sidebar cho mỗi chương:

```html
<!-- _includes/sidebars/<key>/ch1.html -->
<div class="sidebar-card">
  <h4><span class="material-icons-outlined">functions</span> Ký hiệu chính</h4>
  <table class="symbol-table">
    <tr><td>\(\PP(A)\)</td><td>Xác suất sự kiện A</td></tr>
    <!-- Thêm ký hiệu thủ công sau -->
  </table>
</div>
```

---

## 5. MathJax Integration

### Cấu hình hiện tại (`_includes/mathjax.html`)

```html
<script>
MathJax = {
  tex: {
    macros: {
      PP: "\\mathbb{P}",
      E: "\\mathbb{E}",
      N: "\\mathbb{N}",
      Z: "\\mathbb{Z}",
      R: "\\mathbb{R}",
      ind: "\\mathbf{1}"
    },
    tags: 'ams'
  }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" async></script>
```

### Macro namespace convention

**Hiện tại:** Tất cả macros là global — chung cho mọi sách. Nếu sách mới cần macro trùng tên nhưng nghĩa khác → xung đột.

**Quy tắc:**
1. Macros toán học phổ biến (`\PP`, `\E`, `\N`, `\Z`, `\R`) giữ nguyên nghĩa chuẩn
2. Macros riêng per-book: dùng prefix. Ví dụ: `\mkP` (Markov probability) vs `\scP` (stochastic calculus probability)
3. Thêm macro mới: edit `_includes/mathjax.html` hoặc tạo per-book override

### Quy tắc chuyển đổi LaTeX → MathJax

| LaTeX source | Giữ nguyên | Ghi chú |
|-------------|------------|---------|
| `$...$` | Co | MathJax hỗ trợ inline `$` mặc định |
| `\(...\)` | Co | |
| `\[...\]` | Co | Display math |
| `\begin{equation}...\end{equation}` | Co | Có label/tag |
| `\begin{align}...\end{align}` | Co | Multi-line |
| `\begin{align*}...\end{align*}` | Co | No numbering |
| `$$...$$` | **TRÁNH** | Dùng `\[...\]` thay thế |
| `\def\X{...}` | **TRÁNH** | Dùng `\newcommand` |

### Lưu ý khi dùng MathJax trong HTML

- Ký tự `|` trong bảng HTML: escape thành `\vert` hoặc `\mid`
- File **phải là `.html`**, không phải `.md` — Markdown processor sẽ phá MathJax
- Dấu `_` và `*` trong `.md` bị Kramdown xử lý thành italic/bold

---

## 6. CI/CD

### GitHub Actions (`.github/workflows/jekyll.yml`)

```yaml
name: Deploy Jekyll site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.3'
          bundler-cache: true
      - run: bundle exec jekyll build
        env:
          JEKYLL_ENV: production
      - uses: actions/upload-pages-artifact@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

### Dual deployment

| Target | Trigger | Build |
|--------|---------|-------|
| **Cloudflare Pages** | Git push to `main` | Cloudflare tự build |
| **GitHub Pages** | Git push to `main` | GitHub Actions workflow |

**Domain chính:** `hp-lib.io.vn` (Cloudflare Pages). GitHub Pages là backup.

### Local build

```bash
eval "$(rbenv init -)"          # rbenv Ruby 3.3+
bundle install                  # Lần đầu
bundle exec jekyll build        # Build → _site/
bundle exec jekyll serve        # Dev server tại localhost:4000
```

---

## 7. Image Handling

### Quy ước thư mục

```
raw_books/<id>/images/         →   assets/images/<key>/
   fig1.png                         fig1.png
   fig2.pdf                         fig2.png  (convert PDF → PNG)
```

### Trong HTML chapter

```html
<img src="{{ '/assets/images/markov/fig1.png' | relative_url }}" alt="Mô tả ảnh">
```

### Quy tắc

1. Ảnh đặt trong `assets/images/<key>/` — namespace theo book key
2. Format ưu tiên: PNG, SVG (cho diagrams), JPEG (cho photos)
3. PDF figures: convert sang PNG trước khi commit
4. Alt text bắt buộc cho accessibility

---

## 8. Pre-commit Hook Concept

### Mục đích

Validate trước khi commit để tránh lỗi silent failure.

### Checklist validation

```bash
#!/bin/bash
# .git/hooks/pre-commit (concept — chưa implement)

# 1. Kiểm tra front matter bắt buộc
for f in books/*/ch*.html books/*/intro.html books/*/appendix.html; do
  grep -q "^slug:" "$f" || echo "WARN: $f thiếu slug"
  grep -q "^book_key:" "$f" || echo "WARN: $f thiếu book_key"
  grep -q "^layout: book-chapter" "$f" || echo "WARN: $f sai layout"
done

# 2. Kiểm tra data_key khớp thư mục _data/
for key in $(grep "data_key:" _data/books.yml | awk '{print $2}'); do
  [ -d "_data/$key" ] || echo "ERROR: _data/$key/ không tồn tại"
done

# 3. Kiểm tra slug khớp giữa front matter và chapters.yml
# (phức tạp hơn, cần script Python)

# 4. Jekyll build thử
bundle exec jekyll build --quiet || exit 1
```

---

*Xem thêm: `docs/05_scaling_and_maintenance_playbook.md` cho step-by-step playbooks.*
