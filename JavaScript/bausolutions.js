(() => {
  // === Utilities ===
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Toast helpers (Bootstrap 5)
  function showToast(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const t = bootstrap.Toast.getOrCreateInstance(el);
    t.show();
  }

  // === Anti-spam config ===
  const MIN_DELAY_MS = 3000;            // reject if form submitted quicker than this
  const MAX_AGE_MS   = 20 * 60 * 1000;  // reject if form older than this (20 min)
  const MAX_URLS_IN_MESSAGE = 1;        // allow at most 1 link in message
  const SUSPICIOUS_PATTERNS = /(casino|viagra|loan|crypto|bitcoin|seo|guest\s*post)/i;

  // === On page ready ===
  document.addEventListener('DOMContentLoaded', () => {
    // set render timestamp
    const t0 = document.getElementById('t0');
    if (t0) t0.value = Date.now().toString();

    // randomize honeypot name to break brittle scripts
    const hp = document.querySelector('input.hp-field');
    if (hp) {
      hp.name = 'website_' + Math.random().toString(36).slice(2, 9);
      hp.value = ''; // make sure it's empty
    }

    // optional: pre-init EmailJS (only if you actually use it; otherwise remove)
    if (window.emailjs && emailjs.init) {
      // TODO: put your EmailJS Public Key here
      // emailjs.init("Ib3LPJQWavUBFpeXR");
    }
  });

  // === Validation & submission ===
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitButton');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic field refs
      const nameEl = document.getElementById('name');
      const emailEl = document.getElementById('email');
      const subjEl = document.getElementById('subject');
      const msgEl = document.getElementById('message');

      // 0) Lock button to stop double-submits
      if (submitBtn) submitBtn.disabled = true;

      try {
        // 1) Honeypot
        const hpFilled = !!($('input.hp-field')?.value?.trim());
        if (hpFilled) throw new Error('Spam detected (honeypot).');

        // 2) Timing checks
        const t0 = Number(document.getElementById('t0')?.value || 0);
        const age = Date.now() - t0;
        if (isNaN(t0) || age < MIN_DELAY_MS || age > MAX_AGE_MS) {
          throw new Error('Suspicious timing.');
        }

        // 3) Required fields (you already have required in HTML; we double-check server-style)
        const name = (nameEl?.value || '').trim();
        const email = (emailEl?.value || '').trim();
        const subject = (subjEl?.value || '').trim();
        const message = (msgEl?.value || '').trim();

        if (!name || !email || !subject || !message) {
          throw new Error('Please fill in all fields.');
        }

        // 4) Content heuristics: don’t allow links in name/subject; limit in message
        const urlRegex = /https?:\/\/|www\./gi;
        if (urlRegex.test(name) || urlRegex.test(subject)) {
          throw new Error('Links are not allowed in name or subject.');
        }
        const messageUrlCount = (message.match(urlRegex) || []).length;
        if (messageUrlCount > MAX_URLS_IN_MESSAGE) {
          throw new Error('Too many links in the message.');
        }

        // 5) Quick spam phrase sniff
        const looksSpammy = SUSPICIOUS_PATTERNS.test(message) || age < (MIN_DELAY_MS + 2000);

        // 6) (Optional) Adaptive Turnstile: only require if looksSpammy
        if (looksSpammy) {
          const tsBox = document.getElementById('turnstile-box');
          if (tsBox) tsBox.style.display = 'block';

          // If you’re actually using Turnstile, you need to verify the token server-side.
          // Get the token from the injected widget
          const tsToken = (window.turnstile && $('textarea[name="cf-turnstile-response"]')?.value) || '';
          // Send tsToken to your backend along with the form (see server sample below).
          // If you don’t have a backend yet, comment this out and rely on the other checks.
        }

        // 7) === Send the message ===
        // Pick ONE path:
        // A) Using EmailJS (frontend only)
        if (window.emailjs) {
          // Replace with your EmailJS service/template IDs and fields mapping
           const result = await emailjs.send("bausolutions_msgservice", "bausolutions_msgtemplate", {
             from_name: name,
             from_email: email,
             subject: subject,
             message: message
          // });
          // If success:
          showToast('emailSuccessToast');
          form.reset();
          // reset anti-spam timestamp after successful send
          const t0 = document.getElementById('t0');
          if (t0) t0.value = Date.now().toString();
        } else {
          // B) Using your own backend endpoint (recommended)
           const resp = await fetch('/api/contact', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ name, email, subject, message, t0, tsToken })
           });
          // if (!resp.ok) throw new Error('Server rejected');
          showToast('emailSuccessToast');
          form.reset();
          const t0 = document.getElementById('t0');
          if (t0) t0.value = Date.now().toString();
        }

      } catch (err) {
        console.warn(err);
        showToast('emailFailToast');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
})();



