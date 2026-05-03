'use strict';

const NAV_H = 64;

const SECTION_POS = {
  home:     { col: 0, row: 0 },
  schedule: { col: 1, row: 0 },
  howto:    { col: 0, row: 1 },
  rsvp:     { col: 1, row: 1 },
};

let current = 'home';

// ─── Navigation ──────────────────────────────────────────────

function updateScrollHint() {
  const panel = document.getElementById(`panel-${current}`);
  const hint  = document.getElementById('scroll-hint');
  if (!panel || !hint) return;
  const scrollable = panel.scrollHeight > panel.clientHeight + 10;
  const atBottom   = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 48;
  hint.classList.toggle('visible', scrollable && !atBottom);
}

function navigateTo(id) {
  if (!SECTION_POS[id]) return;
  const { col, row } = SECTION_POS[id];
  const w = window.innerWidth;
  const h = window.innerHeight - NAV_H;

  document.getElementById('panner').style.transform =
    `translate(${-col * w}px, ${-row * h}px)`;

  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.nav === id)
  );

  const panel = document.getElementById(`panel-${id}`);
  if (panel) panel.scrollTop = 0;

  current = id;

  // Update URL hash without adding a browser history entry on every scroll,
  // but DO push a real entry so back/forward works between sections.
  const newHash = id === 'home' ? '' : `#${id}`;
  if (window.location.hash !== newHash) {
    history.pushState({ section: id }, '', newHash || window.location.pathname);
  }

  setTimeout(updateScrollHint, 750);
}

function setupNav(content) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const id = btn.dataset.nav;
    btn.textContent = content.nav[id] || id;
    btn.addEventListener('click', () => navigateTo(id));
  });

  // Keyboard: left/right/up/down arrows
  document.addEventListener('keydown', e => {
    const { col, row } = SECTION_POS[current];
    const moves = {
      ArrowRight: { col: col + 1, row },
      ArrowLeft:  { col: col - 1, row },
      ArrowDown:  { col, row: row + 1 },
      ArrowUp:    { col, row: row - 1 },
    };
    if (!moves[e.key]) return;
    const target = Object.entries(SECTION_POS).find(
      ([, p]) => p.col === moves[e.key].col && p.row === moves[e.key].row
    );
    if (target) navigateTo(target[0]);
  });

  // Touch swipe
  let touchX = 0, touchY = 0;
  document.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return;

    const { col, row } = SECTION_POS[current];
    let targetCol = col, targetRow = row;

    if (Math.abs(dx) > Math.abs(dy)) {
      targetCol = dx < 0 ? col + 1 : col - 1;
    } else {
      targetRow = dy < 0 ? row + 1 : row - 1;
    }

    const hit = Object.entries(SECTION_POS).find(
      ([, p]) => p.col === targetCol && p.row === targetRow
    );
    if (hit) navigateTo(hit[0]);
  }, { passive: true });

  // Reposition on resize (no animation during resize)
  window.addEventListener('resize', () => {
    const panner = document.getElementById('panner');
    panner.style.transition = 'none';
    navigateTo(current);
    requestAnimationFrame(() => { panner.style.transition = ''; });
  });
}

// ─── Stars ───────────────────────────────────────────────────

function generateStars() {
  const container = document.getElementById('stars');
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 180; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() < 0.72 ? 1 : 2;
    s.style.cssText = `
      left: ${(Math.random() * 100).toFixed(2)}vw;
      top:  ${(Math.random() * 100).toFixed(2)}vh;
      width: ${size}px; height: ${size}px;
      --delay: ${(Math.random() * 5).toFixed(2)}s;
      --dur:   ${(2 + Math.random() * 4).toFixed(2)}s;
    `;
    frag.appendChild(s);
  }
  container.appendChild(frag);
}

// ─── Splash blurb rotator (Minecraft style) ──────────────────

function startBlurbs(blurbs) {
  const el = document.getElementById('splash-text');
  if (!el || !blurbs.length) return;
  let i = 0;

  const show = () => {
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = blurbs[i % blurbs.length];
      el.style.opacity = '1';
      i++;
    }, 380);
  };

  show();
  setInterval(show, 5000);
}

// ─── Content builders ────────────────────────────────────────

function buildHome(c, panel) {
  panel.innerHTML = `
    <div class="home-content">
      <div class="logo-wrapper">
        <img src="images/logo.png" alt="${esc(c.site.logoAlt)}" class="logo-img" />
        <div id="splash-text" class="splash-text" aria-live="polite"></div>
      </div>
      <div class="home-theme">${esc(c.site.theme)}</div>
      <div class="home-tagline">${esc(c.home.tagline)}</div>
      <a href="${esc(c.site.mapsUrl)}" target="_blank" rel="noopener noreferrer" class="home-address">📍 ${esc(c.site.address)}</a>
    </div>
  `;
  startBlurbs(c.home.blurbs);
}

function buildSchedule(c, panel) {
  const { schedule } = c;

  const screeningsHtml = schedule.screenings.map(s => `
    <div class="screening">
      <div class="screening-date-bar">
        <span class="screening-date">${esc(s.date)}</span>
        <span class="screening-dusk">🌇 Dusk: ${esc(s.dusk)}</span>
      </div>
      <div class="movies-row">
        ${movieCardHtml(s.kids,   'kids',   schedule.kidsLabel)}
        ${movieCardHtml(s.adults, 'adults', schedule.adultsLabel)}
      </div>
    </div>
  `).join('');

  panel.innerHTML = `
    <h2 class="section-heading">${esc(schedule.heading)}</h2>
    <p class="section-sub">${esc(schedule.subheading)}</p>
    <p class="section-note">${esc(schedule.rainNote)}</p>
    <div class="screenings-list">${screeningsHtml}</div>
  `;
}

function movieCardHtml(movie, type, label) {
  return `
    <div class="movie-card">
      <div class="movie-card-header">
        <span class="audience-tag ${esc(type)}">${esc(label)}</span>
        <span class="movie-rating-badge">${esc(movie.rating)}</span>
      </div>
      <h3 class="movie-title">${esc(movie.title)}</h3>
      <div class="movie-meta">${esc(String(movie.year))} · ${esc(movie.runtime)}</div>
      <div class="movie-times">${esc(movie.startTime)} → ${esc(movie.endTime)}</div>
      <p class="movie-desc">${esc(movie.description)}</p>
      <div class="movie-links">
        <a href="${esc(movie.imdb)}" target="_blank" rel="noopener noreferrer" class="movie-link">IMDB ↗</a>
        <a href="${esc(movie.csm)}"  target="_blank" rel="noopener noreferrer" class="movie-link">Common Sense ↗</a>
      </div>
    </div>
  `;
}

function buildHowto(c, panel) {
  const { howto } = c;
  const rulesHtml = howto.rules.map(rule => `
    <div class="rule-card">
      <span class="rule-icon" aria-hidden="true">${rule.icon}</span>
      <div class="rule-body">
        <div class="rule-title">${esc(rule.title)}</div>
        <p class="rule-text">${esc(rule.text)}</p>
      </div>
    </div>
  `).join('');

  panel.innerHTML = `
    <h2 class="section-heading">${esc(howto.heading)}</h2>
    <p class="section-sub">${esc(howto.intro)}</p>
    <div class="rules-list">${rulesHtml}</div>
  `;
}

function buildRsvp(c, panel) {
  const { rsvp } = c;
  panel.innerHTML = `
    <div class="rsvp-content">
      <div class="pixel-divider" aria-hidden="true"></div>
      <h2 class="section-heading">${esc(rsvp.heading)}</h2>
      <p class="rsvp-intro">${esc(rsvp.intro)}</p>
      <div class="rsvp-address-box">
        <span class="rsvp-address-label">${esc(rsvp.addressLabel)}</span>
        ${esc(rsvp.address)}
      </div>
      <div class="rsvp-form-section">
        <p class="rsvp-action-label">${esc(rsvp.rsvpLabel)}</p>
        <a href="${esc(rsvp.rsvpUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${esc(rsvp.rsvpCta)}</a>
      </div>
    </div>
  `;
}

// ─── Tiny HTML escaper (prevents XSS from JSON values) ───────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Bootstrap ───────────────────────────────────────────────

function initSite(content) {
  document.title = content.site.title;
  setupNav(content);
  buildHome(content,     document.getElementById('panel-home'));
  buildSchedule(content, document.getElementById('panel-schedule'));
  buildHowto(content,    document.getElementById('panel-howto'));
  buildRsvp(content,     document.getElementById('panel-rsvp'));

  // Attach scroll listeners to every panel
  document.querySelectorAll('.panel').forEach(panel => {
    panel.addEventListener('scroll', updateScrollHint, { passive: true });
  });

  // Honor any hash in the URL (no pan animation on first load)
  navigateFromHash(false);
  setTimeout(updateScrollHint, 800);
}

// Navigate to whatever section the hash points at (no animation on first load)
function navigateFromHash(animate) {
  const id = window.location.hash.replace('#', '') || 'home';
  if (SECTION_POS[id]) {
    if (!animate) {
      document.getElementById('panner').style.transition = 'none';
      navigateTo(id);
      requestAnimationFrame(() => {
        document.getElementById('panner').style.transition = '';
      });
    } else {
      navigateTo(id);
    }
  }
}

window.addEventListener('popstate', () => navigateFromHash(true));

document.addEventListener('DOMContentLoaded', () => {
  generateStars();

  fetch('content.json')
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(initSite)
    .catch(err => {
      console.error('Failed to load content.json:', err);
      document.getElementById('panel-home').innerHTML = `
        <div style="padding:40px;text-align:center;font-family:monospace;color:#e2e2e2;">
          <p style="font-size:18px;margin-bottom:16px;">Scott Road Cinema</p>
          <p style="color:#888;line-height:1.8;">
            This site needs to be served by a local web server.<br>
            Run one of these in your project folder:<br><br>
            <code style="background:#111;padding:4px 8px;border-radius:2px;">npx serve .</code>
            &nbsp; or &nbsp;
            <code style="background:#111;padding:4px 8px;border-radius:2px;">python -m http.server</code>
          </p>
        </div>
      `;
    });
});
