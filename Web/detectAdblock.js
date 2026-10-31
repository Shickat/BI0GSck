window.addEventListener('load', function () {
      const baitContainer = document.createElement('div');
      baitContainer.style.cssText = `
        position: absolute !important;
        left: -9999px !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
        pointer-events: none !important;
      `;

      const baitClasses = [
        'ad', 'ads', 'adsbox', 'adsense', 'adsbygoogle', 'ads-banner', 'ad-unit',
        'ad-zone', 'ad-slot', 'ad-area', 'ad-header', 'ad-footer', 'ad-sidebar',
        'adcontent', 'admodule', 'sponsor', 'sponsored', 'sponsor-link',
        'text-ad', 'textads', 'ad-placeholder', 'ad-container', 'ad-wrapper',
        'ad-label', 'ad-marker', 'adblocker', 'adblock-detected', 'adblocker-message',
        'google-ads', 'googlead', 'google_ads', 'google_ads_iframe', 'googleAd',
        'dfp-ad', 'dfp-ad-wrapper', 'banner-ad', 'banner_ads', 'bannerad',
        'ad-banner-top', 'ad-leaderboard', 'ad728x90', 'ad300x250', 'right-ads',
        'adblock', 'blockads', 'adsense-content', 'adswrapper', 'publi', 'reklama',
        'promo', 'adnotice', 'ads-right', 'ads-left', 'ads-top', 'ads-bottom',
        'page-ad', 'page-ads', 'popads', 'mid-ads', 'bigad', 'smallad', 'adstrip',
        'adspace', 'advert', 'advertising', 'advertisement', 'sponsorbox', 'sponsor-wrap'
      ];

      const baitIds = [
        'ad', 'ads', 'ad-container', 'adsense', 'google_ads_iframe', 'banner-ad',
        'adblocker', 'adblock-message', 'adblocker-overlay', 'sponsored', 'sponsor',
        'right-ads', 'left-ads', 'top-ads', 'bottom-ads', 'text-ads', 'inline-ad',
        'ad-sidebar', 'ads-wrapper', 'dfp-ad', 'leaderboard', 'adspace', 'reklama',
        'publi', 'page-ads', 'mid-ads', 'bigad', 'smallad', 'popup-ads', 'blockads',
        'adsframe', 'adv-top', 'adv-bottom', 'adv-block', 'adnotice', 'adunit1',
        'sponsor-block', 'sponsor-box', 'sponsor-banner'
      ];

      baitClasses.forEach(className => {
        const div = document.createElement('div');
        div.className = className;
        div.style.cssText = 'width:1px; height:1px; position: absolute; left: -9999px; top: -9999px;';
        baitContainer.appendChild(div);
      });

      baitIds.forEach(id => {
        const div = document.createElement('div');
        div.id = id;
        div.style.cssText = 'width:1px; height:1px; position: absolute; left: -9999px; top: -9999px;';
        baitContainer.appendChild(div);
      });

      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'width:1px; height:1px; position: absolute; left: -9999px; top: -9999px;';
      iframe.src = 'about:blank';
      iframe.dataset.testSrc = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      baitContainer.appendChild(iframe);

      document.body.appendChild(baitContainer);

      function isElementBlocked(el) {
        if (!el) return true;
        const style = window.getComputedStyle(el);
        return (
          el.offsetParent === null ||
          el.offsetHeight === 0 ||
          el.offsetWidth === 0 ||
          style.getPropertyValue('display') === 'none' ||
          style.getPropertyValue('visibility') === 'hidden' ||
          style.getPropertyValue('opacity') === '0'
        );
      }

      setTimeout(() => {
        let blocked = false;

        for (const child of baitContainer.children) {
          if (isElementBlocked(child)) {
            blocked = true;
            break;
          }
        }

        const adDiv = document.getElementById('ads');
        if (!adDiv || isElementBlocked(adDiv)) {
          blocked = true;
        }

        if (blocked) {
          const pageContent = document.getElementById('page-content');
          const alertBox = document.createElement('div');
          alertBox.id = 'adblock-alert';
          alertBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            padding: 20px 25px;
            max-width: 340px;
            width: 90%;
            text-align: center;
            font-family: 'Segoe UI', sans-serif;
            font-size: 1rem;
            color: #222;
            z-index: 2147483647;
            pointer-events: auto;
          `;

          alertBox.innerHTML = `
            <img src="https://blog.orange.es/wp-content/uploads/2020/05/adblock-logo.jpg" alt="Adblock" style="width: 80px; height: auto; margin-bottom: 15px;">
            <p style="margin-bottom: 10px;">
              Por favor, desactiva el bloqueador para poder continuar navegando.
            </p>
            <button id="reload-btn" style="
              margin-top: 12px;
              padding: 10px 18px;
              font-size: 1rem;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              transition: background-color 0.3s ease;
            ">🔄 Ya lo he desactivado, recargar</button>
          `;

          alertBox.querySelector('#reload-btn').addEventListener('mouseenter', () => {
            alertBox.querySelector('#reload-btn').style.backgroundColor = '#0056b3';
          });
          alertBox.querySelector('#reload-btn').addEventListener('mouseleave', () => {
            alertBox.querySelector('#reload-btn').style.backgroundColor = '#007bff';
          });

          alertBox.querySelector('#reload-btn').addEventListener('click', () => {
            location.reload();
          });

          document.body.appendChild(alertBox);

          if (pageContent) {
            pageContent.style.filter = 'blur(5px)';
            pageContent.style.pointerEvents = 'none';
            pageContent.style.userSelect = 'none';
          } else {
            Array.from(document.body.children).forEach(child => {
              if (child !== alertBox) {
                child.style.filter = 'blur(5px)';
                child.style.pointerEvents = 'none';
                child.style.userSelect = 'none';
              }
            });
          }
        } else {
          document.body.classList.add('ad-ok');
        }

        baitContainer.remove();
      }, 300);
    });