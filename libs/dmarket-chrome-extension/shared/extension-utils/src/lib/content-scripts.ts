import browser from 'webextension-polyfill';

export async function getIsContentScriptsRegistered() {
  const registeredContentScripts = await browser.scripting.getRegisteredContentScripts({
    ids: ['google'],
  });

  let isContentScriptsRegistered = false;

  for (const registeredContentScript of registeredContentScripts) {
    if (registeredContentScript.id === 'google') {
      isContentScriptsRegistered = true;
      break;
    }
  }

  return isContentScriptsRegistered;
}

/**
 * Only use in `background/index.ts`!
 */
export async function registerContentScripts() {
  await browser.scripting.registerContentScripts([
    {
      id: 'google',
      runAt: 'document_start',
      matches: [
        'https://www.google.com.ar/search*',
        'https://www.google.com.au/search*',
        'https://www.google.at/search*',
        'https://www.google.com.bd/search*',
        'https://www.google.be/search*',
        'https://www.google.com.br/search*',
        'https://www.google.ca/search*',
        'https://www.google.cl/search*',
        'https://www.google.cn/search*',
        'https://www.google.com.co/search*',
        'https://www.google.cz/search*',
        'https://www.google.dk/search*',
        'https://www.google.com.eg/search*',
        'https://www.google.fi/search*',
        'https://www.google.fr/search*',
        'https://www.google.de/search*',
        'https://www.google.gr/search*',
        'https://www.google.com.hk/search*',
        'https://www.google.hu/search*',
        'https://www.google.co.in/search*',
        'https://www.google.co.id/search*',
        'https://www.google.ie/search*',
        'https://www.google.co.il/search*',
        'https://www.google.it/search*',
        'https://www.google.co.jp/search*',
        'https://www.google.co.ke/search*',
        'https://www.google.com.my/search*',
        'https://www.google.com.mx/search*',
        'https://www.google.nl/search*',
        'https://www.google.co.nz/search*',
        'https://www.google.com.ng/search*',
        'https://www.google.no/search*',
        'https://www.google.com.pk/search*',
        'https://www.google.com.ph/search*',
        'https://www.google.pl/search*',
        'https://www.google.pt/search*',
        'https://www.google.ru/search*',
        'https://www.google.com.sa/search*',
        'https://www.google.com.sg/search*',
        'https://www.google.co.za/search*',
        'https://www.google.co.kr/search*',
        'https://www.google.es/search*',
        'https://www.google.se/search*',
        'https://www.google.ch/search*',
        'https://www.google.com.tw/search*',
        'https://www.google.co.th/search*',
        'https://www.google.com.tr/search*',
        'https://www.google.ae/search*',
        'https://www.google.co.uk/search*',
        'https://www.google.com/search*',
        'https://www.google.co.ve/search*',
        'https://www.google.com.vn/search*',
      ],
      js: ['content_google.js'],
    },
  ]);
}
