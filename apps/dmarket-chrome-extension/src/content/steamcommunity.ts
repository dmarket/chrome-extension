import {
  DmExtTabStatus,
  MessageActionNames,
  statusIconConfig,
} from '@myth/dm-ext-shared-constants';
import {
  injectStyleLink,
  isActionMessage,
  isApiMessage,
  optionsStorage,
} from '@myth/dm-ext-shared-extension-utils';
import { ExtensionMessagingService } from '@myth/dm-ext-shared-utils';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';
import { $ } from 'select-dom';
import { getI18nMessage } from './utils';

const offerIdApi = '/is-trade-our';
const bannerId = 'steamcommunity_traderOfferCheck_banner';
const widgetId = 'steamcommunity_traderOfferCheck_widget';
const closeBtnId = 'steamcommunity_traderOfferCheck_tradeUnverified_continueTradeBtn';
const steamBannerSelector = '.trade_partner_header.top';
const bannerBreakPoint = 600;
const bannerAppendTimeout = 200;

const tradeOfferWidgetConfig = {
  verified: {
    icon: chrome.runtime.getURL(`/assets/img/${statusIconConfig[DmExtTabStatus.Safe].imageUrl}`),
    title: getI18nMessage('steamcommunity_traderOfferCheck_tradeVerified_title'),
    titleBanner: getI18nMessage('steamcommunity_traderOfferCheck_tradeVerified_titleBanner'),
    subtitle: getI18nMessage('steamcommunity_traderOfferCheck_tradeVerified_subtitle'),
    safetyGuidelines: '',
    continueTrade: '',
  },
  unverified: {
    icon: chrome.runtime.getURL(`/assets/img/${statusIconConfig[DmExtTabStatus.Alert].imageUrl}`),
    title: getI18nMessage('steamcommunity_traderOfferCheck_tradeUnverified_title'),
    titleBanner: getI18nMessage('steamcommunity_traderOfferCheck_tradeUnverified_titleBanner'),
    subtitle: getI18nMessage('steamcommunity_traderOfferCheck_tradeUnverified_subtitle'),
    safetyGuidelines: getI18nMessage(
      'steamcommunity_traderOfferCheck_tradeUnverified_safetyGuidelines',
    ),
    continueTrade: getI18nMessage('steamcommunity_traderOfferCheck_tradeUnverified_continueTrade'),
  },
};

const buildWidget = (tradeVerified: boolean): HTMLDivElement => {
  const statusWidget = document.createElement('div');
  statusWidget.id = widgetId;
  const config = tradeOfferWidgetConfig[tradeVerified ? 'verified' : 'unverified'];
  // eslint-disable-next-line max-len
  statusWidget.innerHTML = `<section class="flex flex-col bg-zinc-800 gap-4 items-center justify-start mt-4 p-4 text-white"><img alt=${config.title} width="72px" height="72px" class="block max-w-[72px]" src=${config.icon}><div class="flex flex-col gap-2"><h2 class="text-center font-bold leading-8 text-lg text-white">${config.title}</h2><p class="text-center text-sm text-stone-300">${config.subtitle}</div>${tradeVerified ? '' : `<div class="flex gap-4 flex-nowrap flex-row w-full"><a class="flex bg-neutral-700 font-semibold grow h-[50px] items-center justify-center rounded-lg text-base" href=https://dmarket.com/blog/anti-scam-check-list rel="noopener noreferrer" target=_blank>${config.safetyGuidelines} </a><button class="font-semibold grow h-[50px] rounded-lg text-base bg-alert-gradient" id=${closeBtnId} tabindex=0>${config.continueTrade}</button></div>`}</section>`;
  return statusWidget;
};

const buildBanner = (tradeVerified: boolean): HTMLDivElement => {
  const statusBanner = document.createElement('div');
  statusBanner.id = bannerId;
  const config = tradeOfferWidgetConfig[tradeVerified ? 'verified' : 'unverified'];
  // eslint-disable-next-line max-len
  statusBanner.innerHTML = `<section class="flex flex-row bg-zinc-800 gap-4 items-center justify-start mb-2.5 py-4 px-8 text-white"><img width="48px" height="48px" alt=${config.titleBanner} class="block max-w-[48px]" src=${config.icon}><h2 class="text-center font-bold leading-8 text-lg text-white">${config.titleBanner}</h2></section>`;
  return statusBanner;
};

function verifyTradeOffer(messagingService: ExtensionMessagingService) {
  const url = window?.location.href;
  if (url) {
    const splitUrl = url.split('/').filter(Boolean);
    const tradeOfferId = splitUrl[splitUrl.length - 1];
    if (tradeOfferId && Number.isInteger(+tradeOfferId)) {
      messagingService.postApiMessage({
        dmExtApi: `${offerIdApi}/${tradeOfferId}`,
      });
    }
  }
}

const appendBanner = async (tradeVerified: boolean) => {
  const statusBanner = buildBanner(tradeVerified);
  const tradeHeader = await elementReady(steamBannerSelector, {
    stopOnDomReady: false,
    timeout: 5000,
  });
  if (tradeHeader && !$(`#${bannerId}`)) {
    tradeHeader?.insertAdjacentElement('afterend', statusBanner);
  }
};

(async function () {
  try {
    await domLoaded;
    const trades = await elementReady('#trade_yours.ready', {
      stopOnDomReady: false,
      timeout: 30000,
    });
    if (!trades) return;
    let tradeVerified: boolean | null = null;
    const handleBackgroundMessages = async (message: unknown) => {
      if (isApiMessage(message) && message.dmExtApi.startsWith(offerIdApi)) {
        const tradeRule = await elementReady('.trade_rule.maketrade', {
          stopOnDomReady: false,
          timeout: 5000,
        });
        if (!tradeRule) return;
        tradeVerified = (message?.body?.['isTradeOur'] as boolean) ?? true;
        injectStyleLink(chrome.runtime.getURL('/styles.css'));
        await appendBanner(tradeVerified);
        const statusWidget = buildWidget(tradeVerified);
        if (!$(`#${widgetId}`)) {
          tradeRule?.insertAdjacentElement('beforebegin', statusWidget);
          const closeBtn = $(`#${closeBtnId}`);
          if (closeBtn) {
            closeBtn.addEventListener('click', () => statusWidget.remove());
          }
        }
      }
      if (isActionMessage(message) && message.action === MessageActionNames.CloseTradeOfferWidget) {
        const statusWidget = $(`#${widgetId}`);
        statusWidget?.remove();
      }
      if (isActionMessage(message) && message.action === MessageActionNames.ShowTradeOfferWidget) {
        verifyTradeOffer(messagingService);
      }
    };
    const messagingService = new ExtensionMessagingService({
      onMessage: async (msg: unknown) => await handleBackgroundMessages(msg),
      onDisconnect: () => void 0,
    });
    const { tradeBotsVerification } = await optionsStorage.getAll();
    if (!tradeBotsVerification) return;
    verifyTradeOffer(messagingService);
    let bannerPosition = window.innerWidth > bannerBreakPoint ? 'top' : 'area';
    window.addEventListener('resize', () => {
      setTimeout(() => {
        const newBannerPosition = $(`${steamBannerSelector}`)?.parentElement?.className.includes(
          'trade_right',
        )
          ? 'area'
          : 'top';
        if (newBannerPosition !== bannerPosition && tradeVerified !== null) {
          $(`#${bannerId}`)?.remove();
          appendBanner(tradeVerified);
        }
        bannerPosition = newBannerPosition;
      }, bannerAppendTimeout);
    });
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error(error);
  }
})();
