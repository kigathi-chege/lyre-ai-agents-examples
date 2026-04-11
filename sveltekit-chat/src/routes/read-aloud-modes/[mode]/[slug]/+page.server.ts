import { error } from "@sveltejs/kit";
import { loadBlogPostOrThrow } from "$lib/blog/load-post";

const SUPPORTED_MODES = new Set([
  "browser-minimal",
  "browser-full",
  "endpoint-minimal",
  "endpoint-full",
  "data-api-minimal",
  "data-api-full",
  "datasource-api-minimal",
  "datasource-api-full",
  "data-direct-minimal",
  "data-direct-full",
  "datasource-direct-minimal",
  "datasource-direct-full",
]);

export const load = ({ params }) => {
  if (!SUPPORTED_MODES.has(params.mode)) {
    throw error(404, "Read-aloud mode not found.");
  }

  return {
    mode: params.mode,
    post: loadBlogPostOrThrow(params.slug),
  };
};
