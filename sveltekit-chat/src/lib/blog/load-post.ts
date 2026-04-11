import { error } from "@sveltejs/kit";
import { sanitizeRichHtml } from "@kigathi/ai-agents/sanitize";
import { getBlogPostBySlug, stripHtml } from "$lib/blog/posts";

export type LoadedBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  textContent: string;
};

export function loadBlogPostOrThrow(slug: string): LoadedBlogPost {
  const post = getBlogPostBySlug(slug);

  if (!post) {
    throw error(404, "Blog post not found.");
  }

  const safeContent = sanitizeRichHtml(post.content);

  return {
    ...post,
    content: safeContent,
    textContent: stripHtml(safeContent),
  };
}
