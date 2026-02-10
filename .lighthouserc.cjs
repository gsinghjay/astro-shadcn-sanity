module.exports = {
  ci: {
    collect: {
      staticDistDir: './astro-app/dist',
      numberOfRuns: 3,
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
