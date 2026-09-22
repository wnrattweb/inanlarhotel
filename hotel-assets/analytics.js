/* Local previews never send production analytics. No form content is sent to Analytics. */
(() => {
 'use strict';
 if(document.documentElement.dataset.languageRedirect === 'true') return;
 const config=window.INANLAR_HOTEL_SETTINGS;
 if(!config || !config.productionHosts.includes(location.hostname) || !/^G-[A-Z0-9]+$/.test(config.ga4MeasurementId)) return;
 window.dataLayer=window.dataLayer||[];
 window.gtag=function(){window.dataLayer.push(arguments)};
 window.gtag('js',new Date());
 // One page_view only: the legacy UA loader is replaced by its connected GA4 destination.
 window.gtag('config',config.ga4MeasurementId,{page_location:location.origin+location.pathname,page_title:document.title});
 const tag=document.createElement('script');tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.ga4MeasurementId);document.head.appendChild(tag);
 document.addEventListener('click',event=>{
  const a=event.target.closest('a');if(!a)return;
  const href=a.getAttribute('href')||'';
  let name=a.hasAttribute('data-reservation')?'reservation_click':href.startsWith('tel:')?'phone_click':href.startsWith('mailto:')?'email_click':null;
  if(name)window.gtag('event',name,{page_language:document.documentElement.lang});
 });
})();
