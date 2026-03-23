export default defineNuxtPlugin(() => {
  return {
    provide: {
      aiAgents: {
        run: (body) =>
          $fetch('/api/chat', {
            method: 'POST',
            body,
          }),
      },
    },
  };
});
