# HP Library

Thư viện tài liệu nghiên cứu PhD cá nhân — Đại học Debrecen, Hungary.

Live site: [hp-lib.io.vn](https://hp-lib.io.vn) (sắp có)

## Cấu trúc dự án

```
hp-lib/
├── index.html                    # Landing page — danh sách sách
├── _config.yml                   # Cấu hình Jekyll
├── Gemfile                       # Ruby dependencies
│
├── _data/
│   ├── books.yml                 # Registry tất cả sách
│   └── markov/
│       ├── chapters.yml          # Metadata từng chương (tiêu đề, trạng thái, mô tả)
│       └── weekly.yml            # Nhật ký tiến độ hàng tuần
│
├── _layouts/
│   ├── default.html              # Layout trang chủ thư viện
│   └── book-chapter.html         # Layout 3 cột cho chương sách
│
├── _includes/
│   ├── book-nav.html             # Navigation bar cho sách
│   ├── mathjax.html              # MathJax v3 config + custom macros
│   ├── components/               # 8 component includes (box, example, exercise, review)
│   └── sidebars/markov/          # Sidebar mục lục từng chương
│
├── books/
│   └── markov-chains/            # Sách đầu tiên: Chuỗi Markov
│       ├── index.html            # Trang chủ sách (badge trạng thái, mục lục)
│       ├── intro.html            # Giới thiệu: Quá trình ngẫu nhiên
│       ├── ch1.html — ch5.html   # 5 chương chính
│       └── appendix.html         # Phụ lục: Nền tảng Xác suất
│
├── css/
│   ├── framework.css             # CSS framework dùng chung (grid, boxes)
│   ├── library.css               # CSS trang chủ thư viện
│   └── themes/
│       ├── markov.css            # Theme chính cho sách Markov
│       └── markov-themes.css     # 7 theme variants (quiet, paper, bold, calm, focus, dark)
│
└── js/
    ├── nav.js                    # Điều hướng & sidebar toggle
    └── settings.js               # Chuyển theme, font, lưu localStorage
```

## Cách hoạt động

Data-driven: nội dung được quản lý qua YAML → Liquid template → HTML tĩnh.

- `_data/books.yml` — đăng ký sách, trang chủ tự render danh sách
- `_data/markov/chapters.yml` — metadata chương, tự render navigation + badge trạng thái
- Component includes — tái sử dụng box (definition, theorem, formula, summary, review)

## Chạy local

```bash
# Yêu cầu: Ruby 3.x, Bundler
bundle install
bundle exec jekyll serve
# → http://localhost:4000
```

## Thêm sách mới

1. Tạo thư mục `books/ten-sach/` với các file `.html` (front matter: `layout: book-chapter`, `book_key`, `slug`, `sidebar_include`)
2. Tạo `_data/tensach/chapters.yml` — danh sách chương với `slug`, `nav_title`, `status`
3. Thêm entry vào `_data/books.yml` — `slug`, `title_vi`, `title_en`, `data_key`, `url`

## Tính năng hiện tại

- Song ngữ Việt-Anh (heading + nội dung)
- MathJax v3 với custom macros (`\PP`, `\E`, `\N`, `\Z`, `\R`, `\ind`)
- 7 theme: original, quiet, paper, bold, calm, focus, dark
- Responsive 3-column layout (sidebar / content / outline)
- 5 loại box: definition (xanh lá), theorem (đỏ), formula (vàng), summary (xanh dương), review (tím)
- Badge trạng thái tự động: Hoàn thành / Đang viết / Kế hoạch
- Lưu preferences (theme, font) vào localStorage

---

## Phân tích & Roadmap

### Backend cần không?

**Không cần cho giai đoạn hiện tại.**

- Tài liệu cá nhân, read-only — không cần user accounts
- Theme/font lưu localStorage — không cần database
- Tiến độ đã tracking trong YAML — không cần CMS
- Nội dung tĩnh, deploy Cloudflare Pages

Khi nào cần (tương lai):
- Comments → Giscus (GitHub Discussions, miễn phí, không cần server)
- Bookmarks/Notes cá nhân → Supabase free tier
- Analytics → Plausible/Fathom (hosted)

### Chia sẻ tiến độ với giáo viên

**Cách 1: Link trực tiếp (khuyến nghị)**
Gửi link `hp-lib.io.vn/books/markov-chains/` — trang index đã hiển thị badge trạng thái, ngày cập nhật, weekly update. Không cần tài khoản.

**Cách 2: Trang Progress Report**
Tạo `/progress.html` — timeline, % hoàn thành, Gantt đơn giản (CSS-only). Tự đọc từ `weekly.yml` + `chapters.yml`. Có thể in PDF qua print CSS.

**Cách 3: Export PDF**
Browser print → PDF từ progress page, hoặc LaTeX report riêng.

### Roadmap

| Ưu tiên | Tính năng | Backend? | Ghi chú |
|---------|-----------|----------|---------|
| P0 | Deploy Cloudflare Pages | Không | CNAME hp-lib.io.vn |
| P1 | Progress page cho thầy | Không | `/progress.html` đọc YAML |
| P1 | Print CSS | Không | `@media print` |
| P2 | Client-side search | Không | Lunr.js khi có 3+ sách |
| P2 | Sitemap + SEO | Không | jekyll-sitemap plugin |
| P3 | Comments | Không | Giscus (GitHub-backed) |
| P3 | Analytics | Không | Plausible Cloud |
| P4 | Bookmarks/Notes | Supabase | Chỉ khi cần |
