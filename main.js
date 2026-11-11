/* Future Tech Center — no external runtime dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') {
    const boot = async () => {
      let data = root.FTC_DATA;
      if (location.protocol !== 'file:' && data?.hosting !== 'github-pages') {
        try {
          const response = await fetch('api/catalog', { cache: 'no-store', signal: AbortSignal.timeout(8000) });
          if (!response.ok) throw new Error('catalog unavailable');
          data = await response.json();
        } catch {
          const notice = document.getElementById('catalogConnection');
          if (notice) { notice.textContent = 'تُعرض نسخة الكتالوج المرفقة لتعذر تحديث البيانات. تواصل مع المركز لتأكيد السعر والتوافر.'; notice.hidden = false; }
        }
      }
      api.start(data);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const CART_KEY = 'ftc_quote_v2';
  const MAX_QUANTITY = 99;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const normalizeDigits = value => String(value ?? '').replace(/[٠-٩۰-۹]/g, c => String('٠١٢٣٤٥٦٧٨٩'.includes(c) ? '٠١٢٣٤٥٦٧٨٩'.indexOf(c) : '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));
  function normalizePhone(value) {
    let phone = normalizeDigits(value).trim().replace(/[\s().-]/g, '');
    if (phone.startsWith('00')) phone = '+' + phone.slice(2);
    if (/^01[0125]\d{8}$/.test(phone)) return phone;
    if (phone.startsWith('+20')) return /^\+201[0125]\d{8}$/.test(phone) ? phone : null;
    return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
  }
  function normalizeText(value) {
    return normalizeDigits(value).toLocaleLowerCase('ar').normalize('NFKD').replace(/[\u064b-\u065f\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();
  }
  function normalizeCart(raw, products) {
    if (!Array.isArray(raw)) return [];
    const known = new Set(products.filter(p => p.visible !== false && p.availability !== 'out-of-stock').map(p => p.id));
    const quantities = new Map();
    raw.slice(0, 1000).forEach(item => {
      if (!item || !Number.isInteger(item.id) || !known.has(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1) return;
      quantities.set(item.id, Math.min(MAX_QUANTITY, (quantities.get(item.id) || 0) + item.quantity));
    });
    return Array.from(quantities, ([id, quantity]) => ({ id, quantity }));
  }
  function filterProducts(products, { category = 'all', query = '', sort = 'default', availability = 'all', pricing = 'all' } = {}) {
    const words = normalizeText(query).split(/\s+/).filter(Boolean);
    const results = products.filter(p => p.visible !== false && (category === 'all' || p.category === category) && (availability === 'all' || p.availability === availability) && (pricing !== 'priced' || p.price !== null) && (pricing !== 'quote' || p.price === null) && words.every(word => normalizeText([p.title,p.description,p.sku,p.brand].join(' ')).includes(word)));
    if (sort === 'price-asc' || sort === 'price-desc') results.sort((a,b) => (a.price === null)-(b.price === null) || (sort === 'price-asc' ? a.price-b.price : b.price-a.price) || a.id-b.id);
    if (sort === 'name') results.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    if (sort === 'default') results.sort((a,b) => Number(!!b.featured)-Number(!!a.featured));
    return results;
  }
  function cartTotal(cart, products) {
    const prices = new Map(products.map(p => [p.id, Math.round((p.price ?? 0) * 100)]));
    return normalizeCart(cart, products).reduce((sum, item) => sum + prices.get(item.id) * item.quantity, 0) / 100;
  }
  function articleUrl(path, base) {
    const url = new URL(path, base);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Unsupported article URL');
    return url.href;
  }
  const clean = value => String(value ?? '').trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  function buildQuoteMessage(cart, products, details = {}) {
    const items = normalizeCart(cart, products);
    if (!items.length) return '';
    const lines = ['السلام عليكم، أود تأكيد التوافر وعرض السعر لهذه المنتجات:', ''];
    items.forEach((item, index) => {
      const product = products.find(p => p.id === item.id);
      lines.push(`${index + 1}. ${product.title}${product.sku ? ' [' + product.sku + ']' : ''}`, product.price === null ? `الكمية: ${item.quantity} — مطلوب عرض سعر` : `الكمية: ${item.quantity} × ${product.price} ج.م = ${Math.round(product.price * 100) * item.quantity / 100} ج.م`, '');
    });
    const unknown = items.some(item => products.find(p => p.id === item.id).price === null);
    lines.push(`${unknown ? 'إجمالي المنتجات المسعّرة فقط' : 'إجمالي المنتجات المبدئي'}: ${cartTotal(items, products)} ج.م`, ...(unknown ? ['تتضمن القائمة منتجات يُحدد سعرها لاحقًا، وهذا ليس الإجمالي النهائي.'] : []), 'الأسعار والتوافر والتركيب والشحن تحتاج تأكيد المركز.', '', `الاسم: ${clean(details.name)}`, `الهاتف: ${normalizePhone(details.phone) || clean(details.phone)}`, `الاستلام: ${details.delivery === 'shipping' ? 'طلب شحن أو توصيل' : 'استلام بالتنسيق مع المركز'}`);
    if (details.delivery === 'shipping') lines.push(`عنوان التوصيل: ${clean(details.address)}`);
    lines.push(`طريقة الدفع المفضلة: ${clean(details.payment) || 'الاتفاق مع المركز'}`);
    if (clean(details.notes)) lines.push(`ملاحظات: ${clean(details.notes)}`);
    lines.push('', 'يرجى تأكيد المواصفات والضمان والإجمالي النهائي قبل تنفيذ الطلب.');
    return lines.join('\n');
  }
  function buildPrintableQuote(cart, products, business, date = new Date()) {
    const items = normalizeCart(cart, products);
    const rows = items.map((item, i) => {
      const p = products.find(product => product.id === item.id);
      return `<tr><td>${i + 1}</td><td>${escapeHtml(p.title)}</td><td>${item.quantity}</td><td>${p.price === null ? 'عرض سعر' : p.price}</td><td>${p.price === null ? 'يحدد لاحقًا' : Math.round(p.price * 100) * item.quantity / 100}</td></tr>`;
    }).join('');
    const unknown = items.some(item => products.find(p=>p.id===item.id).price === null);
    return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>قائمة منتجات مبدئية</title><style>body{font:14px/2 Tahoma,Arial,sans-serif;padding:30px;color:#122d48}h1{font-size:24px}table{width:100%;border-collapse:collapse;margin:25px 0}th,td{padding:12px;border:1px solid #cbd5e1;text-align:right}th{background:#f0f5fa}.total{font-size:20px;font-weight:bold}.note{font-size:12px;color:#465a70}bdi{direction:ltr}</style></head><body><h1>${escapeHtml(business.name)}</h1><p>قائمة منتجات مبدئية — ليست فاتورة أو تأكيد طلب</p><p>${escapeHtml(date.toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo' }))} · هاتف <bdi>${escapeHtml(business.phone)}</bdi></p><table><thead><tr><th>م</th><th>المنتج</th><th>الكمية</th><th>سعر الوحدة (ج.م)</th><th>الإجمالي (ج.م)</th></tr></thead><tbody>${rows}</tbody></table><p class="total">${unknown ? 'إجمالي المنتجات المسعّرة فقط (باقي الأسعار تحدد لاحقًا)' : 'إجمالي المنتجات المبدئي'}: ${cartTotal(items, products)} ج.م</p><p class="note">يُؤكد السعر والتوافر والمواصفات والضمان مع المركز. لا يشمل الإجمالي رسوم تركيب أو شحن إضافية. لا يوجد دفع إلكتروني أو تأكيد تلقائي داخل الموقع.</p></body></html>`;
  }
  function start(data) {
    if (!data || !data.business || !Array.isArray(data.products)) return;
    const { business, courses, articles, categories } = data;
    const products = data.products.filter(p=>p.visible !== false);
    const byId = id => document.getElementById(id);
    const icon = name => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;
    const number = n => new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(n);
    const money = n => n === null ? '<span class="quote-price">اطلب عرض سعر</span>' : `${number(n)} <small>ج.م</small>`;
    const availabilityLabel = p => ({available:'متاح', 'on-request':'التوافر عند التواصل','out-of-stock':'غير متاح حاليًا'}[p.availability] || 'التوافر عند التواصل');
    let productPage = 1; const pageSize = 12;
    let cart = [];
    let storageAvailable = true;
    let activeCategory = 'all';
    let toastTimer;
    const productsGrid = byId('productsGrid');
    const toastElement = byId('toast');
    function toast(message) {
      if (!toastElement) return;
      toastElement.textContent = message;
      toastElement.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toastElement.hidden = true; }, 3500);
    }
    function saveCart() {
      try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); storageAvailable = true; }
      catch { storageAvailable = false; }
    }
    if (productsGrid) {
      try {
        const stored = localStorage.getItem(CART_KEY);
        const legacy = stored === null ? localStorage.getItem('tech_store_cart') : null;
        try { cart = normalizeCart(JSON.parse(stored ?? legacy ?? '[]'), products); }
        catch { cart = []; }
        saveCart();
        if (legacy !== null) localStorage.removeItem('tech_store_cart');
      } catch { storageAvailable = false; }
    }
    function categoryLabel(id) { return categories.find(c => c.id === id)?.label || ''; }
    function renderProducts() {
      if (!productsGrid) return;
      const query = byId('productSearch').value;
      const results = filterProducts(products, { category: activeCategory, query, sort: byId('productSort').value, availability: byId('productAvailability')?.value || 'all', pricing: byId('productPricing')?.value || 'all' });
      const pages = Math.max(1,Math.ceil(results.length/pageSize)); productPage = Math.min(productPage,pages);
      const start = (productPage-1)*pageSize; const shown = results.slice(start,start+pageSize);
      byId('productCount').textContent = results.length ? `عرض ${number(start+1)}–${number(start+shown.length)} من ${number(results.length)} منتج` : 'لا توجد منتجات مطابقة';
      byId('clearSearch').hidden = !query;
      productsGrid.innerHTML = shown.length ? shown.map(p => `<article class="product-card"><button type="button" class="product-image-button" data-product="${p.id}" aria-label="عرض تفاصيل ${escapeHtml(p.title)}"><span class="product-tag">${escapeHtml(p.featured ? 'اختيار مميز' : p.tag)}</span><img src="${escapeHtml(p.image)}" alt="${p.illustration ? 'رسم توضيحي: ' : ''}${escapeHtml(p.title)}" width="300" height="180" loading="lazy" decoding="async"></button><div class="product-info"><div class="product-meta"><span class="product-category">${escapeHtml(categoryLabel(p.category))}</span><small class="availability ${p.availability === 'available' ? 'is-available' : p.availability === 'out-of-stock' ? 'is-unavailable' : ''}">${availabilityLabel(p)}</small></div><h3>${escapeHtml(p.title)}</h3><p class="product-description">${escapeHtml(p.description)}</p><div class="product-bottom"><span class="product-price">${money(p.price)}</span><button type="button" class="button button-primary product-add" data-add="${p.id}" ${p.availability === 'out-of-stock' ? 'disabled' : ''} aria-label="أضف ${escapeHtml(p.title)} إلى الطلب">${icon('plus')} أضف للطلب</button></div><button class="text-button product-details-button" type="button" data-product="${p.id}">عرض التفاصيل ${icon('arrow')}</button></div></article>`).join('') : `<div class="empty-state">${icon('search')}<h3>ما لقيناش منتج بالبحث ده</h3><p>جرّب اسم تاني أو اختار قسم مختلف.</p><button class="button button-outline" type="button" data-reset-search>عرض كل المنتجات</button></div>`;
      const pagination = byId('productPagination');
      if (pagination) { pagination.hidden = pages < 2; pagination.innerHTML = `<button class="button button-outline" type="button" data-product-page="${productPage-1}" ${productPage===1?'disabled':''}>السابق</button><span>صفحة ${number(productPage)} من ${number(pages)}</span><button class="button button-outline" type="button" data-product-page="${productPage+1}" ${productPage===pages?'disabled':''}>التالي</button>`; }
    }
    function renderCart() {
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      if (byId('cartCount')) byId('cartCount').textContent = number(count);
      if (byId('listCount')) byId('listCount').textContent = number(count);
      const list = byId('cartItems');
      if (!list) return;
      byId('quoteSummary').hidden = !cart.length;
      const unknown = cart.some(item => products.find(p=>p.id===item.id)?.price === null);
      const anyPriced = cart.some(item => products.find(p=>p.id===item.id)?.price !== null);
      byId('cartTotal').textContent = unknown && !anyPriced ? 'يُحدد بعد عرض السعر' : number(cartTotal(cart, products)) + ' ج.م';
      if(byId('quoteUnknown')) byId('quoteUnknown').hidden = !unknown;
      if(byId('quoteTotalLabel'))byId('quoteTotalLabel').textContent = unknown ? 'إجمالي المنتجات المسعّرة فقط' : 'إجمالي المنتجات المبدئي';
      list.innerHTML = cart.length ? cart.map(item => {
        const p = products.find(product => product.id === item.id);
        return `<article class="cart-row"><img src="${escapeHtml(p.image)}" alt="" width="70" height="74"><div><h3>${escapeHtml(p.title)}</h3><p>${p.price === null ? 'السعر يحدد عند التواصل' : `${number(p.price)} ج.م × ${number(item.quantity)} = ${number(p.price * item.quantity)} ج.م`}</p><div class="quantity-controls"><button type="button" data-qty="${p.id}" data-delta="-1" aria-label="تقليل كمية ${escapeHtml(p.title)}">${icon('minus')}</button><span aria-label="الكمية">${number(item.quantity)}</span><button type="button" data-qty="${p.id}" data-delta="1" aria-label="زيادة كمية ${escapeHtml(p.title)}" ${item.quantity >= MAX_QUANTITY ? 'disabled' : ''}>${icon('plus')}</button></div></div><button type="button" class="icon-button remove-item" data-remove="${p.id}" aria-label="حذف ${escapeHtml(p.title)} من الطلب">${icon('delete')}</button></article>`;
      }).join('') : `<div class="empty-state">${icon('cart')}<h3>قائمة طلباتك لسه فاضية</h3><p>اختار من الكتالوج وأضف المنتجات اللي محتاجها.</p><button class="button button-primary" type="button" data-browse-products>استكشف المنتجات ${icon('arrow')}</button></div>`;
    }
    function addToCart(id) {
      const product = products.find(p => p.id === id);
      if (!product || product.availability === 'out-of-stock') return;
      const item = cart.find(p => p.id === id);
      if (item && item.quantity >= MAX_QUANTITY) { toast('الحد الأقصى 99 قطعة من كل منتج. للطلبات الأكبر تواصل مع المركز.'); return; }
      if (item) item.quantity += 1;
      else cart.push({ id, quantity: 1 });
      saveCart(); renderCart();
      toast(storageAvailable ? 'أُضيف المنتج لقائمة طلباتك' : 'أُضيف المنتج. القائمة متاحة خلال هذه الزيارة فقط لأن حفظ المتصفح غير متاح.');
    }
    function syncModalState() {
      document.body.classList.toggle('modal-open', !!document.querySelector('dialog[open]'));
    }
    function openDialog(id) {
      const dialog = byId(id);
      if (!dialog || dialog.open) return;
      document.querySelectorAll('dialog[open]').forEach(d => d.close());
      dialog.showModal(); syncModalState();
    }
    function closeDialog(dialog) { if (dialog?.open) dialog.close(); syncModalState(); }
    function setupDialog(dialog) {
      dialog.addEventListener('close', syncModalState);
      dialog.addEventListener('click', event => {
        const rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog);
      });
    }
    document.querySelectorAll('dialog').forEach(setupDialog);
    function showProduct(id) {
      const p = products.find(product => product.id === id);
      if (!p || !byId('productDetails')) return;
      byId('productDetails').innerHTML = `<div class="product-detail-grid"><img class="product-detail-image" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" width="280" height="260"><div><span class="product-tag">${escapeHtml(categoryLabel(p.category))}</span><h2 id="productTitle">${escapeHtml(p.title)}</h2><p>${escapeHtml(p.description)}</p><p class="product-detail-code">كود المنتج: <bdi>${escapeHtml(p.sku || String(p.id))}</bdi> · ${availabilityLabel(p)}</p>${p.illustration ? '<small class="subtle-note">الصورة توضيحية لفئة المنتج. الموديل النهائي حسب الاتفاق.</small>' : ''}<span class="product-price">${money(p.price)}</span><button type="button" class="button button-primary button-wide" data-add="${p.id}" ${p.availability === 'out-of-stock' ? 'disabled' : ''}>${icon('plus')} أضف لقائمة الطلبات</button><p class="subtle-note">يُؤكد التوافر والمواصفات والضمان مع المركز قبل الشراء.</p></div></div>`;
      openDialog('productDialog');
    }
    function showCourse(id) {
      const course = courses.find(c => c.id === id);
      if (!course) return;
      byId('courseId').value = course.id;
      byId('selectedCourse').textContent = `${course.title} · ${course.duration} · رسوم الكتالوج: ${number(course.price)} ج.م`;
      byId('courseStatus').hidden = true;
      openDialog('courseDialog');
    }
    function closeMenu(restoreFocus = false) {
      const nav = byId('mainNav'); const button = byId('menuButton');
      if (!nav || !button) return;
      nav.classList.remove('open'); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'فتح القائمة');
      if (restoreFocus) button.focus();
    }
    function resetSearch() {
      activeCategory = 'all'; productPage = 1; byId('productSearch').value = ''; byId('productSort').value = 'default';
      for(const id of ['productAvailability','productPricing'])if(byId(id))byId(id).value='all';
      document.querySelectorAll('[data-category]').forEach(button => { const active = button.dataset.category === 'all'; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
      renderProducts();
    }
    function whatsapp(message, statusId) {
      const url = new URL(`https://wa.me/${business.whatsapp}`);
      url.searchParams.set('text', message);
      window.open(url.href, '_blank', 'noopener,noreferrer');
      const status = byId(statusId);
      if (status) {
        status.replaceChildren(document.createTextNode('الرسالة جاهزة للمراجعة والإرسال. لو واتساب ما فتحش، '));
        const link = document.createElement('a'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'افتح الرسالة من هنا'; status.append(link); status.hidden = false;
      }
    }
    function validateForm(form, phoneId) {
      const phone = phoneId && byId(phoneId);
      if (phone) phone.setCustomValidity(normalizePhone(phone.value) ? '' : 'أدخل رقم موبايل مصري صحيحًا من 11 رقمًا أو رقمًا دوليًا يبدأ بعلامة +.');
      for (const field of form.querySelectorAll('input[required]:not([type="tel"]),textarea[required]')) {
        field.setCustomValidity(field.value.trim() ? '' : 'يرجى كتابة البيانات المطلوبة.');
      }
      if (!form.reportValidity()) return false;
      if (phone) phone.value = normalizePhone(phone.value);
      return true;
    }
    document.addEventListener('input', event => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) event.target.setCustomValidity('');
    });
    function formValues(form) { return Object.fromEntries(new FormData(form).entries()); }
    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest('button');
      if (button?.matches('[data-open]')) openDialog(button.dataset.open);
      if (button?.matches('[data-close]')) closeDialog(button.closest('dialog'));
      if (button?.matches('[data-add]')) { addToCart(Number(button.dataset.add)); if (button.closest('#productDialog')) closeDialog(byId('productDialog')); }
      if (button?.matches('[data-product]')) showProduct(Number(button.dataset.product));
      if (button?.matches('[data-course]')) showCourse(button.dataset.course);
      if (button?.matches('[data-qty]')) {
        const id = Number(button.dataset.qty); const delta = Number(button.dataset.delta); const item = cart.find(p => p.id === id);
        if (item && [-1, 1].includes(delta)) {
          item.quantity = Math.min(MAX_QUANTITY, item.quantity + delta); cart = cart.filter(p => p.quantity > 0); saveCart(); renderCart();
          const next = byId('cartItems').querySelector(`[data-qty="${id}"][data-delta="${delta}"]:not(:disabled)`) || byId('cartItems').querySelector('button');
          next?.focus();
        }
      }
      if (button?.matches('[data-remove]')) {
        cart = cart.filter(item => item.id !== Number(button.dataset.remove)); saveCart(); renderCart();
        (byId('cartItems').querySelector('button') || byId('quoteDialog').querySelector('[data-close]'))?.focus(); toast('تم حذف المنتج من القائمة');
      }
      if(button?.matches('[data-product-page]')){productPage=Number(button.dataset.productPage);renderProducts();byId('products').scrollIntoView({behavior:'instant'});}
      if (button?.matches('[data-category]')) {
        productPage = 1;
        activeCategory = categories.some(c => c.id === button.dataset.category) ? button.dataset.category : 'all';
        document.querySelectorAll('[data-category]').forEach(item => { const active = item.dataset.category === activeCategory; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
        renderProducts();
      }
      if (button?.matches('[data-reset-search]')) resetSearch();
      if (button?.matches('[data-browse-products]')) { closeDialog(button.closest('dialog')); byId('products')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); byId('productSearch')?.focus({ preventScroll: true }); }
      if (button?.matches('[data-service]')) {
        byId('serviceType').value = button.dataset.service;
        byId('maintenance')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        byId('serviceName')?.focus({ preventScroll: true });
      }
      if (button?.matches('[data-share-path]')) share(button.dataset.shareTitle, button.dataset.sharePath);
      else if (button?.matches('[data-share-title]')) share(button.dataset.shareTitle, location.href);
      const navLink = event.target.closest('#mainNav a');
      if (navLink) closeMenu();
      if (!event.target.closest('.nav-row')) closeMenu();
    });
    byId('menuButton')?.addEventListener('click', () => {
      const nav = byId('mainNav'); const open = nav.classList.toggle('open');
      byId('menuButton').setAttribute('aria-expanded', String(open)); byId('menuButton').setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && byId('mainNav')?.classList.contains('open')) closeMenu(true); });
    window.addEventListener('resize', () => { if (window.innerWidth > 960) closeMenu(); });
    byId('productSearch')?.addEventListener('input', () => {productPage=1;renderProducts();});
    byId('productSort')?.addEventListener('change', () => {productPage=1;renderProducts();});
    for(const id of ['productAvailability','productPricing'])byId(id)?.addEventListener('change',()=>{productPage=1;renderProducts();});
    byId('clearSearch')?.addEventListener('click', () => { productPage = 1; byId('productSearch').value = ''; renderProducts(); byId('productSearch').focus(); });
    byId('orderDelivery')?.addEventListener('change', () => {
      const shipping = byId('orderDelivery').value === 'shipping'; byId('orderAddressField').hidden = !shipping; byId('orderAddress').required = shipping;
      if (!shipping) byId('orderAddress').setCustomValidity('');
    });
    byId('clearCart')?.addEventListener('click', () => { cart = []; saveCart(); renderCart(); toast('تم إفراغ قائمة الطلبات'); byId('cartItems').querySelector('button')?.focus(); });
    byId('printQuote')?.addEventListener('click', () => {
      if (!cart.length) return;
      const frame = document.createElement('iframe'); frame.title = 'طباعة قائمة المنتجات'; frame.setAttribute('aria-hidden', 'true'); frame.setAttribute('tabindex', '-1');
      Object.assign(frame.style, { position: 'fixed', width: '1px', height: '1px', top: '0', left: '-10000px', border: '0' });
      frame.onload = () => { frame.contentWindow.addEventListener('afterprint', () => frame.remove(), { once: true }); frame.contentWindow.focus(); frame.contentWindow.print(); };
      frame.srcdoc = buildPrintableQuote(cart, products, business); document.body.append(frame);
      setTimeout(() => frame.remove(), 60000);
    });
    byId('checkoutForm')?.addEventListener('submit', event => {
      event.preventDefault(); if (!cart.length || !validateForm(event.currentTarget, 'orderPhone')) return;
      whatsapp(buildQuoteMessage(cart, products, formValues(event.currentTarget)), 'checkoutStatus');
    });
    if (byId('serviceDate')) {
      const today = new Date(); const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      byId('serviceDate').min = localDate;
    }
    byId('serviceForm')?.addEventListener('submit', event => {
      event.preventDefault(); if (!validateForm(event.currentTarget, 'servicePhone')) return;
      const f = formValues(event.currentTarget);
      const lines = ['السلام عليكم، أود الاستفسار عن طلب خدمة من الموقع:', `الاسم: ${clean(f.name)}`, `الهاتف: ${f.phone}`, `الخدمة: ${clean(f.service)}`, `المنطقة: ${clean(f.address)}`];
      if (f.date) lines.push(`يوم مناسب للتواصل: ${f.date}`);
      lines.push(`التفاصيل: ${clean(f.details)}`, '', 'يرجى تأكيد التكلفة والموعد قبل الحجز.');
      whatsapp(lines.join('\n'), 'serviceStatus');
    });
    byId('courseForm')?.addEventListener('submit', event => {
      event.preventDefault(); if (!validateForm(event.currentTarget, 'studentPhone')) return;
      const f = formValues(event.currentTarget); const course = courses.find(c => c.id === f.course); if (!course) return;
      whatsapp(['السلام عليكم، أود الاستفسار عن التدريب:', `الدورة: ${course.title}`, `المدة بالكتالوج: ${course.duration}`, `الرسوم بالكتالوج: ${course.price} ج.م`, `الاسم: ${clean(f.name)}`, `الهاتف: ${f.phone}`, `المستوى: ${clean(f.level)}`, '', 'يرجى تأكيد ميعاد الدفعة والرسوم ومحتوى التدريب قبل الحجز.'].join('\n'), 'courseStatus');
    });
    byId('feedbackForm')?.addEventListener('submit', event => {
      event.preventDefault(); if (!validateForm(event.currentTarget)) return;
      const f = formValues(event.currentTarget);
      whatsapp(['ملاحظات على تجربة خدمات مركز المستقبل التقني:', `الاسم: ${clean(f.name)}`, `التقييم: ${Number(f.rating)} من 5`, `الملاحظة: ${clean(f.comment)}`].join('\n'), 'feedbackStatus');
    });
    async function share(title, path) {
      const url = articleUrl(path, document.baseURI);
      if (navigator.share) {
        try { await navigator.share({ title, text: title, url }); return; }
        catch (error) { if (error.name === 'AbortError') return; }
      }
      try { await navigator.clipboard.writeText(url); toast('تم نسخ رابط المقال'); }
      catch {
        let dialog = byId('shareFallback');
        if (!dialog) {
          dialog = document.createElement('dialog'); dialog.id = 'shareFallback'; dialog.setAttribute('aria-labelledby', 'shareFallbackTitle');
          dialog.innerHTML = `<div class="dialog-top"><h2 id="shareFallbackTitle">مشاركة المقال</h2><button class="icon-button" data-close aria-label="إغلاق المشاركة">${icon('close')}</button></div><div class="dialog-body"><div class="field"><label for="shareUrl">انسخ الرابط للمشاركة</label><input id="shareUrl" readonly dir="ltr"></div></div>`;
          document.body.append(dialog); setupDialog(dialog);
        }
        byId('shareUrl').value = url; openDialog('shareFallback'); byId('shareUrl').select();
      }
    }
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
    document.querySelectorAll('.brand strong,[data-business-name]').forEach(el=>el.textContent=business.name);
    if(data.content){
      const title=byId('home')?.querySelector('h1');if(title)title.textContent=data.content.heroTitle;
      const copy=byId('home')?.querySelector('.hero-description');if(copy)copy.textContent=data.content.heroText;
      const announcement=byId('siteAnnouncement');if(announcement){announcement.textContent=data.content.announcement;announcement.hidden=!data.content.announcement;}
      if(byId('courses'))byId('courses').hidden=!data.content.showCourses;
      document.querySelectorAll('a[href="#courses"]').forEach(el=>el.hidden=!data.content.showCourses);
    }
    document.querySelectorAll('[data-phone]').forEach(el => { el.href = `tel:${business.phone.replace(/[ ()-]/g, '')}`; el.querySelector('bdi').textContent = business.phone; });
    document.querySelectorAll('[data-email]').forEach(el => { el.href = `mailto:${business.email}`; el.querySelector('bdi').textContent = business.email; });
    document.querySelectorAll('[data-tagline]').forEach(el=>el.textContent=business.tagline);
    document.querySelectorAll('[data-location]').forEach(el => { el.textContent = business.location; });
    document.querySelectorAll('[data-whatsapp]').forEach(el => { el.href = `https://wa.me/${business.whatsapp}`; });
    document.querySelectorAll('[data-social]').forEach(el => { el.hidden=!business[el.dataset.social]; if (business[el.dataset.social]) el.href = business[el.dataset.social]; });
    if (byId('categoryFilters')) byId('categoryFilters').innerHTML = categories.map(c => `<button type="button" class="filter-button ${c.id === 'all' ? 'active' : ''}" data-category="${escapeHtml(c.id)}" aria-pressed="${c.id === 'all'}">${escapeHtml(c.label)}</button>`).join('');
    if (byId('coursesGrid')) byId('coursesGrid').innerHTML = courses.map(c => `<article class="course-card"><span class="course-icon">${icon(c.icon)}</span><span class="course-duration">${icon('clock')} ${escapeHtml(c.duration)}</span><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.description)}</p><div class="course-footer"><strong>${money(c.price)}</strong><span>رسوم الكتالوج</span></div><button type="button" class="button button-outline button-wide" data-course="${escapeHtml(c.id)}">استفسر عن الدورة ${icon('arrow')}</button></article>`).join('');
    if (byId('articlesGrid')) byId('articlesGrid').innerHTML = articles.map(a => `<article class="news-card"><a href="${escapeHtml(a.path)}" aria-label="اقرأ ${escapeHtml(a.title)}"><img src="${escapeHtml(a.image)}" alt="${escapeHtml(a.title)}" width="400" height="220" loading="lazy" decoding="async"></a><div class="news-meta"><span>${escapeHtml(a.category)}</span><time datetime="${escapeHtml(a.date)}">${escapeHtml(new Date(a.date + 'T12:00:00Z').toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }))}</time></div><h3><a href="${escapeHtml(a.path)}">${escapeHtml(a.title)}</a></h3><p>${escapeHtml(a.description)}</p><div class="news-actions"><a class="text-button" href="${escapeHtml(a.path)}">اقرأ المقال ${icon('arrow')}</a><button type="button" class="icon-button" data-share-path="${escapeHtml(a.path)}" data-share-title="${escapeHtml(a.title)}" aria-label="مشاركة ${escapeHtml(a.title)}">${icon('share')}</button></div></article>`).join('');
    if (productsGrid && 'IntersectionObserver' in window) {
      const visible = new Map();
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => visible.set(entry.target.id, entry));
        const top = [...visible.values()].filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) document.querySelectorAll('#mainNav a').forEach(a => a.classList.toggle('active', a.hash === '#' + top.target.id));
      }, { rootMargin: '-100px 0px -55% 0px', threshold: 0 });
      document.querySelectorAll('section[id],footer[id]').forEach(section => observer.observe(section));
    }
    window.addEventListener('storage', event => {
      if (!productsGrid || (event.key !== CART_KEY && event.key !== null)) return;
      try { cart = normalizeCart(JSON.parse(event.newValue || '[]'), products); }
      catch { cart = []; }
      renderCart();
    });
    renderProducts(); renderCart();
  }
  return { normalizeDigits, normalizePhone, normalizeText, normalizeCart, filterProducts, cartTotal, buildQuoteMessage, buildPrintableQuote, articleUrl, escapeHtml, start };
});
