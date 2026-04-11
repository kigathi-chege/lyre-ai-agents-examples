import { loadBlogPostOrThrow } from "$lib/blog/load-post";

export const load = ({ params }) => {
  return {
    post: loadBlogPostOrThrow(params.slug),
  };
};
