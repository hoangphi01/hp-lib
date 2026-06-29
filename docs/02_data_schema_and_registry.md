# Schema Dữ liệu & Registry — HP Library

> Quy chuẩn YAML schema, validation rules, và mapping consumer cho toàn bộ hệ thống data-driven.

---

## 1. `_data/books.yml` — Registry sách

### Schema

```yaml
- slug: markov-chains                    # (bắt buộc) URL path: /books/<slug>/
  title_vi: "Chuỗi Markov"              # (bắt buộc) Tiêu đề tiếng Việt (có diacritics)
  title_en: "Markov Chains"              # (bắt buộc) Tiêu đề tiếng Anh
  subtitle: "Tài liệu Song ngữ..."      # (bắt buộc) Phụ đề hiển thị trên book card
  source: "Privault (2011)"              # (bắt buộc) Nguồn tài liệu gốc
  status: active                         # (bắt buộc) Enum: active | draft | planned
  chapters: 7                            # (tuỳ chọn) Số chương (redundant, không dùng để tính stats)
  cover: /assets/covers/markov.png       # (tuỳ chọn) Path ảnh bìa
  url: /books/markov-chains/             # (bắt buộc) URL trang landing của sách
  description: "Mô tả ngắn..."          # (bắt buộc) Hiển thị trên book card
  tags: [xác suất, ngẫu nhiên, markov]   # (bắt buộc) Array string, dùng cho search/filter
  data_key: markov                       # (bắt buộc) Key lookup _data/<data_key>/chapters.yml
```

### Bảng chi tiết từng field

| Field | Type | Bắt buộc | Mô tả | Validation |
|-------|------|----------|-------|------------|
| `slug` | string | Co | URL path segment | Lowercase, dấu gạch ngang, khớp tên thư mục `books/<slug>/` |
| `title_vi` | string | Co | Tiêu đề tiếng Việt | Phải có diacritics đầy đủ |
| `title_en` | string | Co | Tiêu đề tiếng Anh | |
| `subtitle` | string | Co | Phụ đề | |
| `source` | string | Co | Trích dẫn nguồn | Format: "Tác giả (Năm)" |
| `status` | enum | Co | Trạng thái sách | `active` \| `draft` \| `planned` |
| `chapters` | integer | Khong | Số chương (informational) | Không dùng cho logic, chỉ hiển thị |
| `cover` | string | Khong | Path ảnh bìa | Relative path từ root |
| `url` | string | Co | URL landing page | Format: `/books/<slug>/` (trailing slash) |
| `description` | string | Co | Mô tả ngắn | Hiển thị trên book card |
| `tags` | array | Co | Tags phân loại | Array of strings, dùng cho filter |
| `data_key` | string | Co | Key namespace dữ liệu | **Phải khớp** tên thư mục `_data/<data_key>/` |

### Quy tắc validation

1. `data_key` **PHẢI** khớp chính xác tên thư mục trong `_data/`. Ví dụ: `data_key: markov` → thư mục `_data/markov/` phải tồn tại.
2. `slug` **PHẢI** khớp tên thư mục trong `books/`. Ví dụ: `slug: markov-chains` → thư mục `books/markov-chains/` phải tồn tại.
3. `slug` và `data_key` **KHÔNG bắt buộc** trùng nhau. `slug` dùng cho URL (thường có gạch ngang), `data_key` dùng cho Liquid lookup (thường ngắn, không gạch ngang).
4. `status` ảnh hưởng badge icon trên landing page:
   - `active` → icon `edit_note`, text "Đang viết", badge xanh lá
   - `draft` → icon `draft`, text "Bản nháp", badge vàng
   - `planned` → icon `schedule`, text "Kế hoạch", badge xám

---

## 2. `_data/<key>/chapters.yml` — Metadata chương

### Schema

```yaml
- slug: intro                                              # (bắt buộc)
  url: /books/markov-chains/intro.html                     # (bắt buộc)
  nav_title: "Giới thiệu"                                 # (bắt buộc)
  heading: "Giới thiệu: Quá trình ngẫu nhiên..."          # (tuỳ chọn)
  heading_en: "Introduction: Stochastic Processes..."      # (tuỳ chọn)
  description: "Mô tả cho OG meta..."                     # (tuỳ chọn)
  status: done                                             # (tuỳ chọn)
  last_updated: 2026-06-15                                 # (tuỳ chọn)
```

### Bảng chi tiết từng field

| Field | Type | Bắt buộc | Mô tả | Validation |
|-------|------|----------|-------|------------|
| `slug` | string | Co | Identifier chương | **Phải khớp** `page.slug` trong front matter HTML |
| `url` | string | Co | URL đầy đủ | Format: `/books/<book-slug>/<file>.html` |
| `nav_title` | string | Co | Text hiển thị trong TOC sidebar | Ngắn gọn (ví dụ: "Ch 1: Rời rạc") |
| `heading` | string | Khong | Tiêu đề đầy đủ | Render trong `<h1>` trên content area |
| `heading_en` | string | Khong | Phụ đề tiếng Anh | Render trong `<h1> <small>` |
| `description` | string | Khong | Mô tả nội dung | Dùng cho `<meta name="description">` và OG tags |
| `status` | enum | Khong | Trạng thái chương | `done` \| `in-progress` \| `planned` |
| `last_updated` | date | Khong | Ngày cập nhật cuối | Format: `YYYY-MM-DD`, hiển thị trên timeline |

### Quy tắc validation

1. `slug` **PHẢI** khớp `page.slug` trong front matter của file HTML tương ứng.
2. Entry đầu tiên thường là `index` (trang landing của sách) — entry này **không có** `heading`, `status`, `description`.
3. Nếu `status` không được khai báo, chương **không xuất hiện** trong thống kê trên landing page (timeline bỏ qua entry thiếu `status`).
4. Nếu `heading` không có, `<h1>` trên content area sẽ trống.
5. Thứ tự entry trong file = thứ tự hiển thị trong TOC + thứ tự prev/next navigation.

### Entry đặc biệt: `index`

```yaml
- slug: index
  url: /books/markov-chains/
  nav_title: "Trang chủ"
  # Không có heading, status, description — đây là book landing page
```

Entry `index` link đến book landing page. Nó xuất hiện trong TOC sidebar nhưng không tính vào stats.

---

## 3. `_data/<key>/weekly.yml` — Log tiến độ hàng tuần

### Schema

```yaml
- week: "2026-06-16"                    # (bắt buộc) Ngày đầu tuần
  items:                                # (bắt buộc) Array mô tả công việc
    - "Chương 2: Hoàn thành phần FSA"
    - "Chương 3: Thêm ví dụ Gambler's Ruin"
    - "Sửa lỗi MathJax hiển thị ma trận"
```

### Ghi chú

- **Hiện chưa được render** trên bất kỳ trang nào. Chuẩn bị cho trang progress dashboard tương lai.
- Mỗi entry = 1 tuần, `items` là danh sách bullet points.
- Sắp xếp: mới nhất ở trên (reverse chronological).
- Mục đích: Cập nhật trước mỗi buổi báo cáo với giáo sư.

---

## 4. Front Matter Schema — Chapter HTML

Mỗi file HTML chapter **PHẢI** có front matter YAML với cấu trúc sau:

```yaml
---
layout: book-chapter                          # (bắt buộc) Luôn là "book-chapter"
slug: ch1                                     # (bắt buộc) Khớp chapters.yml[].slug
book_key: markov                              # (bắt buộc) Khớp books.yml[].data_key
sidebar_include: sidebars/markov/ch1.html     # (tuỳ chọn) Path relative từ _includes/
title: "Ch 1: Rời rạc"                       # (tuỳ chọn) Fallback title
sections:                                     # (tuỳ chọn) Array: section navigation
  - id: tai-sao-markov                        #   id khớp với <h2 id="...">
    title: "1. Tại sao chuỗi Markov?"         #   Text hiển thị trong section list
  - id: tinh-chat-markov
    title: "2. Tính chất Markov"
---
```

### Bảng chi tiết

| Field | Type | Bắt buộc | Consumer | Nếu thiếu/sai |
|-------|------|----------|----------|----------------|
| `layout` | string | Co | Jekyll | Render sai layout hoặc raw HTML |
| `slug` | string | Co | `book-chapter.html` (dòng 17) | `ch_data` = nil → heading trống, prev/next mất |
| `book_key` | string | Co | `book-chapter.html` (dòng 7), `book-nav.html` (dòng 1) | `book_data` = nil → title trống, TOC trống |
| `sidebar_include` | string | Khong | `book-chapter.html` (dòng 101-103) | Sidebar area trống (fail silently) |
| `title` | string | Khong | `<title>` tag (fallback) | Chỉ ảnh hưởng browser tab nếu heading cũng nil |
| `sections` | array | Khong | `book-chapter.html` (dòng 69-76) | Không hiện section list trong TOC (chỉ chapter list) |

### Naming conventions

| Front matter | Phải khớp với | Ví dụ |
|-------------|---------------|-------|
| `slug: ch1` | `chapters.yml: - slug: ch1` | Exact match |
| `book_key: markov` | `books.yml: data_key: markov` | Exact match |
| `sidebar_include: sidebars/markov/ch1.html` | File `_includes/sidebars/markov/ch1.html` | Path phải tồn tại |

---

## 5. Bảng Consumer — "Ai tiêu thụ gì?"

### `books.yml` fields → consumers

| Field | `index.html` | `book-chapter.html` | `book-nav.html` |
|-------|:---:|:---:|:---:|
| `slug` | - | - | - |
| `title_vi` | Book card title | `<title>` fallback | TOC header |
| `title_en` | Book card subtitle | - | - |
| `subtitle` | Book card subtitle | - | - |
| `source` | Book card subtitle | - | - |
| `status` | Badge icon+text | - | - |
| `url` | Book card href, timeline link | - | TOC header href |
| `description` | Book card desc | OG meta fallback | - |
| `tags` | Search filter, tag chips | - | - |
| `data_key` | Lookup `site.data[data_key].chapters` | Lookup chapters | Lookup chapters |

### `chapters.yml` fields → consumers

| Field | `index.html` stats | `index.html` timeline | `book-chapter.html` | `book-nav.html` |
|-------|:---:|:---:|:---:|:---:|
| `slug` | - | - | Match `page.slug` → `ch_data` | Active state (`.current`) |
| `url` | - | Node href | `prev_ch`/`next_ch` href | Chapter list href |
| `nav_title` | - | Node label | `prev_ch`/`next_ch` text | Chapter list text |
| `heading` | - | - | `<h1>` content | - |
| `heading_en` | - | - | `<h1><small>` + OG title | - |
| `description` | - | - | OG description meta | - |
| `status` | Count done/wip/planned | Dot color class | - | - |
| `last_updated` | - | Date label | - | - |

### Front matter fields → consumers

| Field | `book-chapter.html` usage |
|-------|--------------------------|
| `layout` | Jekyll: chọn layout file |
| `slug` | Dòng 17: match `ch.slug == page.slug` → assign `ch_data`, `ch_index` |
| `book_key` | Dòng 7-12: lookup `book_data` + `chapters` array |
| `sidebar_include` | Dòng 101-103: `{% include {{ page.sidebar_include }} %}` |
| `title` | Dòng 33: fallback cho `og_title` nếu `ch_data.heading` nil |
| `sections` | Dòng 69-76: render section list trong TOC dưới chapter list |

---

## 6. Ví dụ: Entry mới hoàn chỉnh

### Thêm sách "Giải tích Ngẫu nhiên"

**`_data/books.yml`** (append):

```yaml
- slug: stochastic-calculus
  title_vi: "Giải tích Ngẫu nhiên"
  title_en: "Stochastic Calculus"
  subtitle: "Tài liệu Song ngữ Việt-Anh"
  source: "Shreve (2004)"
  status: active
  chapters: 5
  cover: /assets/covers/stochastic.png
  url: /books/stochastic-calculus/
  description: "Tích phân Itô, công thức Itô, phương trình vi phân ngẫu nhiên."
  tags: [giải tích, ngẫu nhiên, tài chính]
  data_key: stochastic
```

**`_data/stochastic/chapters.yml`** (tạo mới):

```yaml
- slug: index
  url: /books/stochastic-calculus/
  nav_title: "Trang chủ"

- slug: ch1
  url: /books/stochastic-calculus/ch1.html
  nav_title: "Ch 1: Tích phân Itô"
  heading: "Chương 1: Tích phân Itô"
  heading_en: "Itô Integration"
  description: "Định nghĩa tích phân Itô, tính chất, ví dụ tính toán."
  status: in-progress
  last_updated: 2026-07-01
```

**Front matter** cho `books/stochastic-calculus/ch1.html`:

```yaml
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
```

---

*Xem thêm: `docs/05_scaling_and_maintenance_playbook.md` Playbook A cho checklist đầy đủ.*
