// eslint-disable-next-line @typescript-eslint/no-var-requires
const ghPages = require('gh-pages');

ghPages.publish(
  './',
  {
    src: ['dist/**/*', 'database/**/*', 'media/**/*', 'package.json', 'yarn.lock', '.env.example', 'log4js.json'],
    branch: 'dist',
  },
  (e) => {
    if (e) {
      console.error(e);
    }
  },
);
