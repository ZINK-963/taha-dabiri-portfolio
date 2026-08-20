(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- سال جاری در فوتر ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- منوی موبایل ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      mobileNav.hidden = !isOpen;
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        mobileNav.hidden = true;
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- انیمیشن تایپ اسم در هیرو ---------- */
  (function typeGreeting() {
    const line = document.getElementById('typeLine');
    const cursor = document.getElementById('typeCursor');
    const subRole = document.getElementById('heroSubRole');
    if (!line) return;

    const revealSub = () => subRole && subRole.classList.add('reveal');

    if (reduceMotion) { revealSub(); return; }

    // متن اصلی (شامل اسپن accent) رو نگه می‌داریم، همه‌ی نودها رو خالی می‌کنیم
    // و بعد کاراکتر به کاراکتر دوباره تایپ می‌کنیم — اگه جاوااسکریپت اجرا نشه
    // متن اصلی دست‌نخورده باقی می‌مونه.
    const nodes = [];
    line.childNodes.forEach((node) => {
      if (node === cursor) return;
      if (node.nodeType === Node.TEXT_NODE) {
        nodes.push({ node, text: node.textContent });
        node.textContent = '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        nodes.push({ node, text: node.textContent });
        node.textContent = '';
      }
    });

    let ni = 0, ci = 0;
    const SPEED = 55;

    function tick() {
      if (ni >= nodes.length) {
        if (cursor) cursor.classList.add('done');
        revealSub();
        return;
      }
      const current = nodes[ni];
      ci++;
      current.node.textContent = current.text.slice(0, ci);
      if (ci >= current.text.length) { ni++; ci = 0; }
      setTimeout(tick, SPEED);
    }
    setTimeout(tick, 350);
  })();


  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const halos = [
      { el: document.getElementById('halo1'), strength: 26 },
      { el: document.getElementById('halo2'), strength: 18 },
      { el: document.getElementById('halo3'), strength: 34 },
    ].filter(h => h.el);

    const orbHalo = document.getElementById('orbHalo');
    const glassOrb = document.getElementById('glassOrb');

    let targetX = 0, targetY = 0, curX = 0, curY = 0;

    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth) - 0.5;
      targetY = (e.clientY / window.innerHeight) - 0.5;
    }, { passive: true });

    function animateHalos() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;

      halos.forEach(({ el, strength }) => {
        el.style.transform = `translate(${curX * strength}px, ${curY * strength}px)`;
      });

      if (orbHalo) orbHalo.style.transform = `translate(${curX * 14}px, ${curY * 14}px) scale(1)`;
      if (glassOrb) glassOrb.style.transform = `translate(${curX * 8}px, ${curY * 8}px)`;

      requestAnimationFrame(animateHalos);
    }
    requestAnimationFrame(animateHalos);
  }

  /* ---------- شمارنده‌ی اعداد هیرو ---------- */
  const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  function toPersianNumber(n) {
    return String(n).split('').map(d => (/\d/.test(d) ? persianDigits[+d] : d)).join('');
  }

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) {
      el.textContent = toPersianNumber(target);
      return;
    }
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = toPersianNumber(value);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- پر شدن لوله‌های مهارت ---------- */
  function fillTube(tube) {
    const level = tube.getAttribute('data-level') || '0';
    const liquid = tube.querySelector('.tube-liquid');
    if (liquid) liquid.style.setProperty('--fill', level + '%');
  }

  /* ---------- انیمیشن ظهور با اسکرول ---------- */
  const revealTargets = document.querySelectorAll(
    '.section-head, .about-text, .mini-card, .skill-tube-item, .work-card, .contact-panel'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const counters = document.querySelectorAll('.meta-num');
  const tubes = document.querySelectorAll('.skill-tube');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(el => revealObserver.observe(el));

    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => counterObserver.observe(el));

    const tubeObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fillTube(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    tubes.forEach(el => tubeObserver.observe(el));
  } else {
    // پشتیبان برای مرورگرهای بدون IntersectionObserver
    revealTargets.forEach(el => el.classList.add('is-visible'));
    counters.forEach(animateCount);
    tubes.forEach(fillTube);
  }

  /* ---------- فرم تماس ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form && status) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnLabel = submitBtn?.querySelector('.btn-label');
    const defaultLabel = btnLabel?.textContent || 'ارسال پیام';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        status.textContent = 'لطفاً همه‌ی فیلدها را پر کن.';
        status.style.color = '#ff8a80';
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        status.textContent = 'ایمیل واردشده معتبر به‌نظر نمی‌رسه.';
        status.style.color = '#ff8a80';
        return;
      }

      if (form.action.includes('YOUR_FORM_ID')) {
        status.style.color = '#ff8a80';
        status.textContent = 'فرم هنوز به Formspree وصل نشده — کد فرم رو توی action جایگزین کن.';
        return;
      }

      status.style.color = '';
      status.textContent = 'در حال ارسال...';
      if (submitBtn) submitBtn.disabled = true;
      if (btnLabel) btnLabel.textContent = 'در حال ارسال...';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          status.style.color = '';
          status.textContent = `ممنون ${name}! پیامت با موفقیت ارسال شد و به‌زودی جواب می‌دم.`;
          form.reset();
        } else {
          throw new Error('submit failed');
        }
      } catch (err) {
        status.style.color = '#ff8a80';
        status.textContent = 'ارسال پیام با خطا مواجه شد. لطفاً دوباره امتحان کن یا مستقیم ایمیل بزن.';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnLabel) btnLabel.textContent = defaultLabel;
      }
    });
  }
  /* ---------- اسلایدر لمسی کارت‌های نمونه‌کار ---------- */
  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const track = slider.querySelector('.work-slider-track');
    const slides = Array.from(track.children);
    const dotsWrap = slider.querySelector('.work-slider-dots');
    const prevBtn = slider.querySelector('.slider-arrow--prev');
    const nextBtn = slider.querySelector('.slider-arrow--next');
    if (!track || slides.length < 2) return;

    let index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'work-slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `عکس ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap?.appendChild(dot);
    });
    const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
    nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); next(); });

    // سواپ با لمس
    let startX = 0, startY = 0, deltaX = 0, dragging = false, decided = false, horizontal = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      deltaX = 0; dragging = true; decided = false; horizontal = false;
      track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      deltaX = x - startX;
      const deltaY = y - startY;

      if (!decided) {
        if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
          horizontal = Math.abs(deltaX) > Math.abs(deltaY);
          decided = true;
        }
      }
      if (horizontal) {
        if (e.cancelable) e.preventDefault(); // فقط وقتی افقیه صفحه رو نبر پایین/بالا
        const base = -index * slider.clientWidth;
        track.style.transform = `translateX(${base + deltaX}px)`;
      }
    }, { passive: false });

    track.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      if (horizontal && Math.abs(deltaX) > slider.clientWidth * 0.18) {
        deltaX < 0 ? next() : prev();
      } else {
        goTo(index);
      }
    });

    window.addEventListener('resize', () => goTo(index));
  });

})();
