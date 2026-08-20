(() => {
  const form = document.getElementById('audience-form');
  const website = document.getElementById('website');
  if (!form || !website) return;

  // Multi-step forms should not rely on browser-native validation because
  // invalid controls may be hidden when the final submit occurs.
  form.noValidate = true;

  function clearWebsiteError() {
    const field = website.closest('.field');
    field?.classList.remove('has-validation-error');
    field?.querySelectorAll('.website-validation-error').forEach(node => node.remove());
    website.removeAttribute('aria-invalid');
    website.removeAttribute('aria-describedby');
  }

  function normalizeWebsite() {
    const raw = website.value.trim();
    if (!raw) {
      clearWebsiteError();
      return true;
    }

    let candidate = raw;
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) candidate = `https://${candidate}`;

    try {
      const url = new URL(candidate);
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error('Unsupported URL');
      website.value = url.href;
      clearWebsiteError();
      return true;
    } catch {
      clearWebsiteError();
      const field = website.closest('.field');
      if (!field) return false;

      field.classList.add('has-validation-error');
      const error = document.createElement('div');
      error.className = 'inline-validation-error website-validation-error';
      error.id = 'website-validation-error';
      error.setAttribute('role', 'alert');
      error.textContent = 'Enter a valid website address, such as example.com, or leave this optional field blank.';
      field.appendChild(error);

      website.setAttribute('aria-invalid', 'true');
      website.setAttribute('aria-describedby', error.id);
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => website.focus({ preventScroll: true }), 260);
      return false;
    }
  }

  website.addEventListener('blur', normalizeWebsite);
  website.addEventListener('input', clearWebsiteError);

  // Register before flow-v3 so invalid website input is stopped while Step 1
  // is still visible and focusable.
  document.addEventListener('click', event => {
    const next = event.target.closest?.('[data-next="2"]');
    if (!next || !form.contains(next)) return;
    if (normalizeWebsite()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
})();
