import domLoaded from 'dom-loaded';

(async function () {
  try {
    await domLoaded;
    document?.body?.classList?.add('dmExtensionInstalled');
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error(error);
  }
})();
