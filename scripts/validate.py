#!/usr/bin/env python3
"""
validate.py — Validate cross-references in HP Library Jekyll site.

Checks:
  1. Each book in books.yml has a matching _data/<data_key>/ directory
  2. Each book's data_key has chapters.yml
  3. Each chapter slug in chapters.yml has a corresponding HTML file
  4. Each chapter's sidebar_include (if set) or convention sidebar file exists
  5. Each book's theme_css has a corresponding CSS file
  6. Each book's mathjax.yml exists (if referenced)

Usage:
  python scripts/validate.py [--root PATH]
"""

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("PyYAML required: pip install pyyaml", file=sys.stderr)
    sys.exit(1)


def validate(root: Path) -> list[str]:
    """Run all validations and return list of error messages."""
    errors = []

    books_file = root / "_data" / "books.yml"
    if not books_file.exists():
        errors.append(f"Missing: {books_file}")
        return errors

    books = yaml.safe_load(books_file.read_text(encoding="utf-8"))
    if not books:
        errors.append("books.yml is empty")
        return errors

    for book in books:
        slug = book.get("slug", "?")
        data_key = book.get("data_key")
        if not data_key:
            errors.append(f"[{slug}] Missing data_key in books.yml")
            continue

        # Check data directory
        data_dir = root / "_data" / data_key
        if not data_dir.is_dir():
            errors.append(f"[{slug}] Missing data directory: _data/{data_key}/")
            continue

        # Check chapters.yml
        chapters_file = data_dir / "chapters.yml"
        if not chapters_file.exists():
            errors.append(f"[{slug}] Missing: _data/{data_key}/chapters.yml")
            continue

        chapters = yaml.safe_load(chapters_file.read_text(encoding="utf-8"))
        if not chapters:
            errors.append(f"[{slug}] chapters.yml is empty")
            continue

        # Check each chapter
        book_dir = root / "books" / slug
        for ch in chapters:
            ch_slug = ch.get("slug", "?")
            if ch_slug == "index":
                # Check index.html
                index_file = book_dir / "index.html"
                if not index_file.exists():
                    errors.append(f"[{slug}] Missing: books/{slug}/index.html")
                continue

            # Check chapter HTML file
            ch_url = ch.get("url", "")
            ch_filename = ch_url.rstrip("/").split("/")[-1] if ch_url else f"{ch_slug}.html"
            ch_file = book_dir / ch_filename
            if not ch_file.exists():
                errors.append(f"[{slug}] Missing chapter file: books/{slug}/{ch_filename}")

            # Check sidebar (convention-based)
            sidebar_file = root / "_includes" / "sidebars" / data_key / f"{ch_slug}.html"
            if not sidebar_file.exists():
                errors.append(f"[{slug}] Missing sidebar: _includes/sidebars/{data_key}/{ch_slug}.html")

        # Check theme CSS
        theme_css = book.get("theme_css")
        if theme_css:
            css_file = root / "css" / "themes" / f"{theme_css}.css"
            if not css_file.exists():
                errors.append(f"[{slug}] Missing theme CSS: css/themes/{theme_css}.css")

        # Check mathjax.yml
        mathjax_file = data_dir / "mathjax.yml"
        if not mathjax_file.exists():
            errors.append(f"[{slug}] Missing: _data/{data_key}/mathjax.yml (optional)")

    return errors


def main():
    parser = argparse.ArgumentParser(description="Validate HP Library cross-references.")
    parser.add_argument("--root", type=Path, default=Path("."),
                        help="Jekyll site root directory")
    args = parser.parse_args()

    if not (args.root / "_config.yml").exists():
        print(f"Error: {args.root} does not look like a Jekyll site", file=sys.stderr)
        sys.exit(1)

    errors = validate(args.root)

    if errors:
        print(f"Found {len(errors)} issue(s):\n")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("All validations passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()
