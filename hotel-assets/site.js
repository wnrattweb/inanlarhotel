(() => {
  'use strict';
  if (document.documentElement.dataset.languageRedirect === 'true') return;
  const en = document.documentElement.lang === 'en';
  const text = (tr, english) => en ? english : tr;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu-panel');
  const setMenu = open => {
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', text(open ? 'Menüyü kapat' : 'Menüyü aç', open ? 'Close menu' : 'Open menu'));
    document.body.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a')?.focus();
    else menuToggle.focus();
  };
  menuToggle?.addEventListener('click', () => setMenu(menu.hidden));
  document.addEventListener('keydown', event => {
    if (!menu || menu.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); setMenu(false); }
    if (event.key === 'Tab') {
      const focusable = [menuToggle, ...menu.querySelectorAll('a, button')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const slides = [...document.querySelectorAll('.hero-slide')];
  if (slides.length) {
    let index = 0, paused = reduced.matches, timer;
    const pause = document.querySelector('[data-slide="pause"]');
    const show = i => {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, j) => { slide.classList.toggle('is-active', j === index); slide.setAttribute('aria-hidden', String(j !== index)); });
      document.querySelector('.slide-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      document.querySelector('.slide-caption').textContent = slides[index].dataset.caption;
    };
    const schedule = () => {
      clearInterval(timer);
      if (!paused && !document.hidden) timer = setInterval(() => show(index + 1), 7000);
      pause.setAttribute('aria-pressed', String(paused));
      pause.setAttribute('aria-label', text(paused ? 'Slaytı oynat' : 'Slaytı duraklat', paused ? 'Play slideshow' : 'Pause slideshow'));
      pause.textContent = paused ? '▷' : 'Ⅱ';
    };
    document.querySelector('[data-slide="prev"]').addEventListener('click', () => { show(index - 1); schedule(); });
    document.querySelector('[data-slide="next"]').addEventListener('click', () => { show(index + 1); schedule(); });
    pause.addEventListener('click', () => { paused = !paused; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', () => { if (reduced.matches) paused = true; schedule(); });
    show(0); schedule();
  }

  const filters = [...document.querySelectorAll('.gallery-filters button')];
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    const items = [...document.querySelectorAll('.gallery-page .gallery-item')];
    filters.forEach(b => { b.setAttribute('aria-pressed', String(b === button)); b.classList.toggle('active', b === button); });
    items.forEach(item => { item.hidden = filter !== '*' && !item.matches(filter); item.classList.toggle('filtered', filter !== '*'); });
    const count = items.filter(item => !item.hidden).length;
    const status = document.querySelector('.filter-status');
    if (status) status.textContent = text(`${count} fotoğraf gösteriliyor.`, `${count} photos shown.`);
  }));

  const dialog = document.querySelector('.lightbox');
  const photos = [...document.querySelectorAll('[data-lightbox]')];
  if (dialog && photos.length) {
    let active = [], index = 0, opener = null, startX = 0;
    const picture = dialog.querySelector('img');
    const show = i => {
      index = (i + active.length) % active.length;
      const link = active[index];
      picture.src = link.href;
      picture.alt = link.dataset.caption || link.querySelector('img')?.alt || '';
      dialog.querySelector('figcaption').textContent = picture.alt;
      dialog.querySelector('.lightbox-counter').textContent = `${index + 1} / ${active.length}`;
    };
    photos.forEach(link => link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (typeof dialog.showModal !== 'function') return;
      event.preventDefault(); opener = link;
      active = photos.filter(photo => !photo.closest('[hidden]'));
      show(active.indexOf(link)); dialog.showModal();
      document.body.classList.add('dialog-open'); dialog.querySelector('.lightbox-close').focus();
    }));
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
    dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); opener?.focus(); });
    dialog.addEventListener('touchstart', event => { startX = event.changedTouches[0].clientX; }, {passive:true});
    dialog.addEventListener('touchend', event => { const dx = event.changedTouches[0].clientX - startX; if (Math.abs(dx) > 60) show(index + (dx < 0 ? 1 : -1)); }, {passive:true});
  }

  document.querySelectorAll('[data-contact-form]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = name => String(data.get(name) || '').trim();
    const subject = value('subject') || text('İnanlar Hotel İletişim', 'İnanlar Hotel Enquiry');
    const body = [text('Ad Soyad: ', 'Name: ') + value('name'), 'Email: ' + value('email'), ...(value('phone') ? [text('Telefon: ', 'Phone: ') + value('phone')] : []), '', value('message')].join('\n');
    const link = document.createElement('a');
    link.href = `mailto:info@inanlarhotel.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.hidden = true; document.body.appendChild(link); link.click(); link.remove();
    form.querySelector('.form-status').textContent = text('E-posta taslağınızı açmanız istendi. Gönderimi e-posta uygulamanızdan tamamlayın. Açılmazsa info@inanlarhotel.com adresine yazabilirsiniz.', 'Your email draft has been requested. Complete sending in your email app. If it does not open, write to info@inanlarhotel.com.');
  }));

  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('is-pending'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll('.section-title, .room-grid-item, .countup-box, .restaurant-menu-item').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('reveal', 'is-pending'); observer.observe(el); }
    });
  }
})();
