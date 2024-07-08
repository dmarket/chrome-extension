const { PurgeCSS } = require('purgecss');
const fs = require('fs');
const { writeFile, stat } = require('fs/promises');

(async () => {
  const purgeCSSResult = await new PurgeCSS().purge('./purgecss.config.js');

  await Promise.all([
    ...purgeCSSResult.map(async ({ css, file }) => {
      const initialSize = (await stat(file)).size / 1024;

      if (fs.existsSync(file)) {
        await writeFile(file, css);
      }

      const postSize = (await stat(file)).size / 1024;
      console.log(`${file}: ${initialSize} -> ${postSize} KB`);
    }),
  ]);
})();
