/* eslint-disable max-len */
import { dmExtDmarketOfficialUrl } from '@myth/dm-ext-shared-constants';
import domLoaded from 'dom-loaded';
import { $, $$ } from 'select-dom';
import { getI18nMessage } from './utils';

function getResultRootElement(targetElement: HTMLElement) {
  if (!targetElement?.parentElement || targetElement.parentElement.classList.contains('v7W49e')) {
    return;
  }
  if (targetElement.parentElement.classList.contains('MjjYud')) {
    return targetElement.parentElement;
  }

  return getResultRootElement(targetElement.parentElement);
}

function isLinkMainElement(targetElement: HTMLElement): boolean {
  const parentIsTable = targetElement?.parentElement?.nodeName === 'TABLE';
  if (!targetElement?.parentElement || parentIsTable) {
    return parentIsTable;
  }
  return isLinkMainElement(targetElement.parentElement);
}

(async function () {
  try {
    await domLoaded;
    const dmLinkElements = $$(`#search a[href^="${dmExtDmarketOfficialUrl}"]`);
    if (!dmLinkElements.length) return;
    const isGoogleDarkMode =
      window.getComputedStyle(document.body).getPropertyValue('background-color') !==
      'rgb(255, 255, 255)';
    const isImageSearchPageSelected = !!document.querySelector('#search div[data-id="mosaic"]');
    for (const index of dmLinkElements.keys()) {
      const dmLinkElement = dmLinkElements[index];
      const linkImages = dmLinkElement.querySelectorAll('img');
      if (linkImages.length > 1) {
        continue;
      } else {
        const imgParents = Array.from(linkImages).map((img) => img.parentElement);
        const isAdImage = imgParents.some((parent) => parent?.classList?.contains('ez24Df'));
        if (isAdImage) {
          continue;
        }
      }
      const dmResultElement = getResultRootElement(dmLinkElement);
      if (dmResultElement) {
        const googleResultsElement = dmResultElement.parentElement;
        if (googleResultsElement) {
          googleResultsElement.prepend(dmResultElement);
        }
      }
      const widget = document.createElement('div');
      widget.setAttribute('title', getI18nMessage('dm_ext_verified_dmarket_domain'));
      widget.style.position = 'absolute';
      widget.style.top = '0px';
      const isTitleLink = dmLinkElement?.querySelectorAll(':scope > h3')?.length > 0;
      widget.style.left = isTitleLink || isImageSearchPageSelected ? '0' : '-120px';
      const fill = isGoogleDarkMode ? '#fff' : '#0D0E0E';
      widget.innerHTML = `<svg width="147" height="24" viewBox="0 0 147 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M29.0015 6.27979H34.3866C35.6339 6.27979 36.7403 6.51403 37.7056 6.98253C38.6709 7.45102 39.4193 8.11563 39.9507 8.97636C40.4822 9.83708 40.7479 10.8449 40.7479 11.9998C40.7479 13.1547 40.4822 14.1625 39.9507 15.0232C39.4193 15.8839 38.6709 16.5485 37.7056 17.017C36.7403 17.4855 35.6339 17.7198 34.3866 17.7198H29.0015V6.27979ZM34.2565 15.1376C35.2326 15.1376 36.0136 14.8598 36.5993 14.3041C37.1958 13.7485 37.4941 12.9804 37.4941 11.9998C37.4941 11.0192 37.1958 10.2511 36.5993 9.69544C36.0136 9.13979 35.2326 8.86196 34.2565 8.86196H32.2228V15.1376H34.2565Z" fill="${fill}"/><path d="M52.3149 17.7198L52.2824 11.6566L49.3539 16.5921H47.9222L45.01 11.82V17.7198H42.0328V6.27979H44.6846L48.6869 12.8823L52.5915 6.27979H55.2434L55.2759 17.7198H52.3149Z" fill="${fill}"/><path d="M65.1855 15.4972H60.3698L59.475 17.7198H56.1886L61.2158 6.27979H64.3883L69.4318 17.7198H66.0803L65.1855 15.4972ZM64.2419 13.1111L62.7777 9.4503L61.3134 13.1111H64.2419Z" fill="${fill}"/><path d="M75.3234 14.68H73.5663V17.7198H70.345V6.27979H75.5512C76.5816 6.27979 77.4764 6.45411 78.2356 6.80276C78.9948 7.14051 79.5805 7.6308 79.9927 8.27361C80.4048 8.90554 80.6109 9.65186 80.6109 10.5126C80.6109 11.3406 80.4157 12.0652 80.0252 12.6862C79.6456 13.2963 79.0979 13.7757 78.382 14.1244L80.8387 17.7198H77.3896L75.3234 14.68ZM77.3571 10.5126C77.3571 9.97872 77.189 9.5647 76.8527 9.27053C76.5165 8.97636 76.0176 8.82927 75.356 8.82927H73.5663V12.1796H75.356C76.0176 12.1796 76.5165 12.0379 76.8527 11.7546C77.189 11.4605 77.3571 11.0465 77.3571 10.5126Z" fill="${fill}"/><path d="M86.7808 13.5687L85.5768 14.8598V17.7198H82.3881V6.27979H85.5768V11.0356L89.9858 6.27979H93.5325L88.8795 11.3461L93.7765 17.7198H90.0346L86.7808 13.5687Z" fill="${fill}"/><path d="M104.175 15.2193V17.7198H95.0317V6.27979H103.964V8.78024H98.2205V10.7087H103.28V13.1274H98.2205V15.2193H104.175Z" fill="${fill}"/><path d="M108.797 8.84561H105.299V6.27979H115.5V8.84561H112.018V17.7198H108.797V8.84561Z" fill="${fill}"/><path fill-rule="evenodd" clip-rule="evenodd" d="M5.49312 22.6704L8.42581 17.6094C8.46537 17.5411 8.5387 17.499 8.61809 17.499H13.8564C14.1484 17.499 14.4183 17.3428 14.5645 17.0885C14.7574 16.7523 15.0514 16.2403 15.3799 15.6685C15.7042 15.1038 16.0621 14.4807 16.3891 13.9108C16.5125 13.6962 16.6314 13.4891 16.7426 13.2955C16.9443 12.9444 17.1205 12.6376 17.251 12.4108C17.3235 12.2839 17.3604 12.1418 17.3604 12.0003C17.3604 11.8582 17.3235 11.7161 17.251 11.5892C17.1205 11.3624 16.9443 11.0556 16.7426 10.7045C16.6314 10.5109 16.5125 10.3038 16.3891 10.0892C15.989 9.39199 15.5428 8.61523 15.1683 7.96326C14.9267 7.54262 14.7149 7.17392 14.5645 6.91208C14.4183 6.65775 14.1484 6.50099 13.8564 6.50099H8.61809C8.5387 6.50099 8.46537 6.4589 8.4258 6.39063L5.49314 1.33019C5.40814 1.18353 5.51487 1.00055 5.68541 1.00055L17.0157 1C17.3077 1 17.5776 1.15677 17.7238 1.41109L23.6805 11.5892C23.753 11.7161 23.7899 11.8582 23.7899 12.0003C23.7899 12.1418 23.753 12.2839 23.6805 12.4108L17.7238 22.5895C17.5776 22.8432 17.3077 23 17.0157 23H5.68541C5.51487 23 5.40814 22.817 5.49312 22.6704ZM4.40354 11.9974C4.40467 11.8527 4.36841 11.7075 4.29421 11.577C4.00161 11.062 3.47658 10.1376 2.95157 9.21325C2.42665 8.28904 1.90174 7.36486 1.60919 6.84992C1.4636 6.593 1.4636 6.27683 1.60919 6.02048L4.39516 1.32622C4.48149 1.18076 4.69399 1.18194 4.77867 1.32836L10.7059 11.577C10.7801 11.708 10.8163 11.8539 10.8152 12.0003C10.8163 12.1461 10.7801 12.292 10.7059 12.423L4.77867 22.6716C4.69399 22.8181 4.48149 22.8192 4.39516 22.6738L1.60919 17.9795C1.4636 17.7232 1.4636 17.407 1.60919 17.1507C2.19434 16.1201 3.70905 13.4529 4.29421 12.423C4.36841 12.2931 4.40467 12.1478 4.40354 12.0026V12.0003V11.9974Z" fill="#51D883"/><path fill-rule="evenodd" clip-rule="evenodd" d="M141.571 5.05176V13.9847C141.571 15.7741 140.763 17.4478 139.414 18.4623C139.368 18.4969 139.319 18.5265 139.267 18.5517L134.472 20.8978C134.217 21.0226 133.923 21.0339 133.661 20.9243C132.625 20.4913 129.913 19.3226 128.798 18.5137C127.406 17.504 126.571 15.8047 126.571 13.9856V5.05176C126.571 4.50679 127.008 4.06216 127.553 4.05194L130.321 4H134.071H137.821L140.59 4.05194C141.135 4.06216 141.571 4.50679 141.571 5.05176ZM136.931 10.2314C137.224 9.93686 137.224 9.45937 136.931 9.16485C136.638 8.87034 136.163 8.87034 135.87 9.16485L133.1 11.9498L132.164 11.0083C131.871 10.7138 131.396 10.7138 131.103 11.0083C130.811 11.3028 130.811 11.7803 131.103 12.0748L132.57 13.5496C132.711 13.691 132.902 13.7705 133.1 13.7705C133.299 13.7705 133.49 13.691 133.631 13.5496L136.931 10.2314Z" fill="url(#paint0_linear_21_12)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M141.571 5.05176V13.9847C141.571 15.7741 140.763 17.4478 139.414 18.4623C139.368 18.4969 139.319 18.5265 139.267 18.5517L134.472 20.8978C134.217 21.0226 133.923 21.0339 133.661 20.9243C132.625 20.4913 129.913 19.3226 128.798 18.5137C127.406 17.504 126.571 15.8047 126.571 13.9856V5.05176C126.571 4.50679 127.008 4.06216 127.553 4.05194L130.321 4H134.071H137.821L140.59 4.05194C141.135 4.06216 141.571 4.50679 141.571 5.05176ZM136.931 10.2314C137.224 9.93686 137.224 9.45937 136.931 9.16485C136.638 8.87034 136.163 8.87034 135.87 9.16485L133.1 11.9498L132.164 11.0083C131.871 10.7138 131.396 10.7138 131.103 11.0083C130.811 11.3028 130.811 11.7803 131.103 12.0748L132.57 13.5496C132.711 13.691 132.902 13.7705 133.1 13.7705C133.299 13.7705 133.49 13.691 133.631 13.5496L136.931 10.2314Z" fill="black" fill-opacity="0.04"/><defs><linearGradient id="paint0_linear_21_12" x1="139.571" y1="6.011" x2="123.035" y2="17.9626" gradientUnits="userSpaceOnUse"><stop stop-color="#42DDFF"/><stop offset="1" stop-color="#55E089"/></linearGradient></defs></svg>`;
      const dmLinkInfoElement = $('div', dmLinkElement);
      if (dmLinkInfoElement) {
        if (dmLinkInfoElement?.parentElement) {
          if (isTitleLink || isImageSearchPageSelected) {
            widget.style.maxWidth = 'calc(100% - 20px)';
            widget.style.position = 'relative';
          } else {
            dmLinkInfoElement.parentElement.style.backgroundColor = 'transparent';
            dmLinkInfoElement.parentElement.style.top = '0.25em';
            dmLinkInfoElement.parentElement.style.width = '23px';
            dmLinkInfoElement.parentElement.style.height = '25px';
          }
        }
        dmLinkInfoElement.replaceWith(widget);
        const dmLinkMoreOptionsElement = dmLinkElement.parentElement?.nextElementSibling;
        if (dmLinkMoreOptionsElement) {
          dmLinkMoreOptionsElement.remove();
        }
      } else if (isLinkMainElement(dmLinkElement)) {
        const spanElement = document.createElement('span');
        spanElement.style.position = 'absolute';
        spanElement.style.right = '0';
        spanElement.style.top = '0.45em';
        spanElement.style.width = '36px';
        spanElement.style.height = '36px';
        spanElement.append(widget);
        dmLinkElement.append(spanElement);
      }
    }
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error(error);
  }
})();
