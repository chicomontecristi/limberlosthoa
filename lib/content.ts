import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * Read all Markdown files from a content subfolder at build time.
 * Returns an array of { slug, frontmatter, body } sorted by `order` (asc)
 * if present, otherwise by `date` (desc), otherwise by slug.
 */
export interface MarkdownItem {
  slug: string;
  frontmatter: Record<string, any>;
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

export function readCollection(folder: string): MarkdownItem[] {
  const dir = path.join(CONTENT_DIR, folder);
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"));

  const items: MarkdownItem[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const parsed = matter(raw);
    return {
      slug: file.replace(/\.md$/, ""),
      frontmatter: parsed.data,
      body: parsed.content,
    };
  });

  // Sort: order ASC if present, else date DESC, else slug ASC.
  items.sort((a, b) => {
    if (a.frontmatter.order != null && b.frontmatter.order != null) {
      return a.frontmatter.order - b.frontmatter.order;
    }
    if (a.frontmatter.date && b.frontmatter.date) {
      return (
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
      );
    }
    return a.slug.localeCompare(b.slug);
  });

  return items;
}

export function readPage(file: string): MarkdownItem | null {
  const fullPath = path.join(CONTENT_DIR, file);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);
  return {
    slug: file.replace(/\.md$/, ""),
    frontmatter: parsed.data,
    body: parsed.content,
  };
}
