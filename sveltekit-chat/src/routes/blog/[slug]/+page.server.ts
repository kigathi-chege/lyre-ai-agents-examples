import { error } from "@sveltejs/kit";
import { sanitizeRichHtml } from "@kigathi/ai-agents/sanitize";
import { getBlogPostBySlug, stripHtml } from "$lib/blog/posts";

export const load = ({ params }) => {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    throw error(404, "Blog post not found.");
  }

  const safeContent = sanitizeRichHtml(post.content);

  return {
    post: {
      ...post,
      content: safeContent,
      textContent: stripHtml(safeContent),
    },
  };
};
