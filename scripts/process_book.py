#!/usr/bin/env python3
"""
process_book.py — Parse LaTeX .tex files and generate Jekyll book structure.

Generates:
  - HTML chapter files with front matter
  - _data/<key>/chapters.yml
  - _data/<key>/mathjax.yml (from \\newcommand in preamble)
  - Skeleton sidebar files in _includes/sidebars/<key>/
  - Entry suggestion for _data/books.yml

Usage:
  python scripts/process_book.py <input_dir> <book_key> [--title-vi TITLE] [--title-en TITLE]

Example:
  python scripts/process_book.py ~/latex/my-book mybook --title-vi "Sách của tôi" --title-en "My Book"
"""

import argparse
import os
import re
import sys
from pathlib import Path
from typing import NamedTuple

# LaTeX environment → HTML component mapping
ENV_MAP = {
    "definition":  ("box-start", "definition"),
    "theorem":     ("box-start", "theorem"),
    "lemma":       ("box-start", "theorem"),
    "corollary":   ("box-start", "theorem"),
    "proposition": ("box-start", "theorem"),
    "remark":      ("box-start", "summary"),
    "example":     ("example-start", None),
    "exercise":    ("exercise-start", None),
}


class Chapter(NamedTuple):
    filename: str
    slug: str
    heading: str
    heading_en: str
    sections: list


def parse_newcommands(tex_content: str) -> dict:
    """Extract \\newcommand macros from LaTeX preamble."""
    macros = {}
    pattern = r'\\newcommand\{\\(\w+)\}\{(.+?)\}'
    for match in re.finditer(pattern, tex_content):
        name = match.group(1)
        definition = match.group(2)
        macros[name] = definition
    return macros


def parse_chapters(input_dir: Path) -> list[Chapter]:
    """Find and parse .tex chapter files in input directory."""
    chapters = []
    tex_files = sorted(input_dir.glob("*.tex"))

    for tex_file in tex_files:
        content = tex_file.read_text(encoding="utf-8")

        # Extract chapter title
        ch_match = re.search(r'\\chapter\{(.+?)\}', content)
        if not ch_match:
            continue

        heading = ch_match.group(1)
        # Try to find English title in comment or second argument
        en_match = re.search(r'%\s*EN:\s*(.+)', content)
        heading_en = en_match.group(1).strip() if en_match else ""

        # Extract sections
        sections = []
        for sec_match in re.finditer(r'\\section\{(.+?)\}', content):
            sec_title = sec_match.group(1)
            sec_id = re.sub(r'[^a-z0-9]+', '-', sec_title.lower()).strip('-')
            sections.append({"id": sec_id, "title": sec_title})

        slug = tex_file.stem
        chapters.append(Chapter(
            filename=tex_file.name,
            slug=slug,
            heading=heading,
            heading_en=heading_en,
            sections=sections,
        ))

    return chapters


def convert_environments(content: str) -> str:
    """Convert LaTeX environments to Jekyll include calls."""
    result = content

    for env_name, (component, box_type) in ENV_MAP.items():
        # \begin{env}[optional title]
        begin_pattern = rf'\\begin\{{{env_name}\}}\s*(?:\[(.+?)\])?'
        end_pattern = rf'\\end\{{{env_name}\}}'

        def begin_replacement(match):
            title = match.group(1) or ""
            if box_type:
                return f'{{% include components/{component}.html type="{box_type}" title="{title}" %}}'
            else:
                return f'{{% include components/{component}.html title="{title}" %}}'

        end_component = component.replace("-start", "-end")
        result = re.sub(begin_pattern, begin_replacement, result)
        result = re.sub(end_pattern, f'{{% include components/{end_component}.html %}}', result)

    # Proof environment
    result = re.sub(r'\\begin\{proof\}', '<div class="proof">', result)
    result = re.sub(r'\\end\{proof\}', '</div>', result)

    return result


def latex_to_skeleton_html(content: str) -> str:
    """Convert LaTeX content to skeleton HTML (basic conversion)."""
    result = content

    # Remove preamble (everything before \begin{document})
    doc_match = re.search(r'\\begin\{document\}', result)
    if doc_match:
        result = result[doc_match.end():]
    result = re.sub(r'\\end\{document\}', '', result)

    # Remove \chapter (handled by front matter)
    result = re.sub(r'\\chapter\{.+?\}', '', result)

    # Sections → h2
    result = re.sub(r'\\section\{(.+?)\}',
                     lambda m: f'<h2>{m.group(1)}</h2>', result)
    result = re.sub(r'\\subsection\{(.+?)\}',
                     lambda m: f'<h3>{m.group(1)}</h3>', result)

    # Convert environments
    result = convert_environments(result)

    # Basic inline math: keep $...$ as-is (MathJax handles it)
    # Basic display math: \[...\] as-is

    # Paragraphs: \par or blank lines → <p>
    result = re.sub(r'\\par\b', '\n<p>', result)

    # \textbf, \textit, \emph
    result = re.sub(r'\\textbf\{(.+?)\}', r'<strong>\1</strong>', result)
    result = re.sub(r'\\textit\{(.+?)\}', r'<em>\1</em>', result)
    result = re.sub(r'\\emph\{(.+?)\}', r'<em>\1</em>', result)

    # itemize/enumerate → ul/ol
    result = re.sub(r'\\begin\{itemize\}', '<ul>', result)
    result = re.sub(r'\\end\{itemize\}', '</ul>', result)
    result = re.sub(r'\\begin\{enumerate\}', '<ol>', result)
    result = re.sub(r'\\end\{enumerate\}', '</ol>', result)
    result = re.sub(r'\\item\s*', '<li>', result)

    return result.strip()


def generate_chapter_html(chapter: Chapter, book_key: str) -> str:
    """Generate HTML file content with front matter."""
    sections_yaml = ""
    if chapter.sections:
        sections_yaml = "sections:\n"
        for sec in chapter.sections:
            sections_yaml += f'  - id: "{sec["id"]}"\n    title: "{sec["title"]}"\n'

    return f"""---
layout: book-chapter
book_key: {book_key}
slug: {chapter.slug}
{sections_yaml}---

<!-- Generated from {chapter.filename} — edit content below -->
<!-- TODO: Paste converted content here -->
"""


def generate_chapters_yml(chapters: list[Chapter], book_key: str) -> str:
    """Generate chapters.yml content."""
    lines = [
        f"- slug: index\n  url: /books/{book_key}/\n  nav_title: \"Trang chủ\"\n"
    ]
    for ch in chapters:
        slug = ch.slug
        lines.append(f"""- slug: {slug}
  url: /books/{book_key}/{slug}.html
  nav_title: "{ch.heading[:30]}"
  heading: "{ch.heading}"
  heading_en: "{ch.heading_en}"
  description: ""
  status: planned
  last_updated:
""")
    return "\n".join(lines)


def generate_mathjax_yml(macros: dict) -> str:
    """Generate mathjax.yml content."""
    lines = ["macros:"]
    for name, definition in sorted(macros.items()):
        lines.append(f'  {name}: "{definition}"')
    return "\n".join(lines) + "\n"


def generate_sidebar_skeleton(chapter: Chapter) -> str:
    """Generate a skeleton sidebar HTML file."""
    return f"""<div class="sidebar-card">
  <h4>
    <span class="material-icons-outlined" style="font-size:16px">menu_book</span>
    Ký hiệu
  </h4>
  <!-- TODO: Add symbols table for {chapter.heading} -->
</div>
"""


def generate_books_yml_entry(book_key: str, title_vi: str, title_en: str) -> str:
    """Generate a books.yml entry suggestion."""
    return f"""
# Add this to _data/books.yml:
- slug: {book_key}
  title_vi: "{title_vi}"
  title_en: "{title_en}"
  subtitle: ""
  source: ""
  source_title: ""
  source_author: ""
  status: active
  cover: /assets/covers/{book_key}.png
  url: /books/{book_key}/
  description: ""
  tags: []
  data_key: {book_key}
  theme_css: {book_key}
  google_font: "Literata:ital,wght@0,400;0,700;1,400;1,700"
  about_vi: |
    TODO: Thêm mô tả tiếng Việt.
  about_en: |
    TODO: Add English description.
"""


def main():
    parser = argparse.ArgumentParser(
        description="Parse LaTeX files and generate Jekyll book structure."
    )
    parser.add_argument("input_dir", type=Path, help="Directory containing .tex files")
    parser.add_argument("book_key", help="Book key (e.g., 'markov', 'probability')")
    parser.add_argument("--title-vi", default="Untitled", help="Vietnamese title")
    parser.add_argument("--title-en", default="Untitled", help="English title")
    parser.add_argument("--output-dir", type=Path, default=None,
                        help="Output directory (default: current working directory as Jekyll root)")

    args = parser.parse_args()

    if not args.input_dir.is_dir():
        print(f"Error: {args.input_dir} is not a directory", file=sys.stderr)
        sys.exit(1)

    root = args.output_dir or Path(".")

    # Parse all .tex files
    print(f"Scanning {args.input_dir} for .tex files...")
    chapters = parse_chapters(args.input_dir)

    if not chapters:
        print("No chapters found (no \\chapter{} commands in .tex files)", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(chapters)} chapter(s)")

    # Extract macros from all files combined
    all_tex = ""
    for tex_file in args.input_dir.glob("*.tex"):
        all_tex += tex_file.read_text(encoding="utf-8") + "\n"
    macros = parse_newcommands(all_tex)
    print(f"Found {len(macros)} macro(s)")

    # Create directories
    book_dir = root / "books" / args.book_key
    data_dir = root / "_data" / args.book_key
    sidebar_dir = root / "_includes" / "sidebars" / args.book_key

    for d in [book_dir, data_dir, sidebar_dir]:
        d.mkdir(parents=True, exist_ok=True)

    # Generate chapter HTML files
    for ch in chapters:
        html_path = book_dir / f"{ch.slug}.html"
        html_path.write_text(generate_chapter_html(ch, args.book_key), encoding="utf-8")
        print(f"  Created {html_path}")

    # Generate index.html
    index_path = book_dir / "index.html"
    index_content = f"""---
layout: book-landing
book_key: {args.book_key}
title: "{args.title_vi}"
---
"""
    index_path.write_text(index_content, encoding="utf-8")
    print(f"  Created {index_path}")

    # Generate chapters.yml
    chapters_yml_path = data_dir / "chapters.yml"
    chapters_yml_path.write_text(
        generate_chapters_yml(chapters, args.book_key), encoding="utf-8"
    )
    print(f"  Created {chapters_yml_path}")

    # Generate mathjax.yml
    if macros:
        mathjax_path = data_dir / "mathjax.yml"
        mathjax_path.write_text(generate_mathjax_yml(macros), encoding="utf-8")
        print(f"  Created {mathjax_path}")

    # Generate sidebar skeletons
    for ch in chapters:
        sidebar_path = sidebar_dir / f"{ch.slug}.html"
        if not sidebar_path.exists():
            sidebar_path.write_text(generate_sidebar_skeleton(ch), encoding="utf-8")
            print(f"  Created {sidebar_path}")

    # Print books.yml entry suggestion
    print(generate_books_yml_entry(args.book_key, args.title_vi, args.title_en))

    print("Done! Next steps:")
    print(f"  1. Edit chapter HTML files in books/{args.book_key}/")
    print(f"  2. Add the books.yml entry above to _data/books.yml")
    print(f"  3. Create CSS theme at css/themes/{args.book_key}.css (or reuse existing)")
    print(f"  4. Run: bundle exec jekyll build")


if __name__ == "__main__":
    main()
