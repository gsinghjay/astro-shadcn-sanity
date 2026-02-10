module.exports = {
  ci: {
    collect: {
      staticDistDir: './astro-app/dist',
      url: [
        'http://localhost/index.html',
        'http://localhost/home/index.html',
      ],
      numberOfRuns: 3,
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
