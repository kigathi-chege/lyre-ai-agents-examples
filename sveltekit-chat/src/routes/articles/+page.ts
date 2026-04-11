import { getBlogPosts } from "$lib/blog/posts";

export const load = () => {
  return {
    posts: getBlogPosts(),
  };
};
