// ==========================================
// 1. مصفوفة بيانات المنتجات (مقسمة حسب الأقسام)
// ==========================================
const productsData = [
    // --- قسم كاميرات المراقبة (camera) ---
    {
        id: 1,
        title: "طقم كاميرات Hikvision HD 5MP (4 كاميرات)",
        category: "camera",
        price: 4800,
        image: "2.jpg",
        description: "شامل جهاز DVR 4 قنوات، هارد 1 تيرا، وباور سبلاي متكامل."
    },
    {
        id: 2,
        title: "كاميرا مراقبة IP لاسلكية متحركة 360°",
        category: "camera",
        price: 1350,
        image: "1.jpg",
        description: "دقة 3 ميجابكسل، تتبع حركة ذكي، ورؤية ليلية بالألوان."
    },

    // --- قسم البرمجيات والتطبيقات (software) ---
    {
        id: 3,
        title: "برنامج المستقبل لإدارة المبيعات والمخازن (POS)",
        category: "software",
        price: 2500,
        image: "es.jpeg",
        description: "ترخيص مدى الحياة، يدعم الفواتير الإلكترونية، والطباعة الحرارية."
    },
    {
        id: 4,
        title: "تصميم موقع إلكتروني تعريفي للمؤسسات",
        category: "software",
        price: 3500,
        image: "cameras-bg.jpg",
        description: "متوافق مع الهواتف، شامل الاستضافة والدومين لمدة عام، وربط الواتساب."
    },

    // --- قسم أجهزة البصمة (fingerprint) ---
    {
        id: 5,
        title: "جهاز حضور وانصراف ZKTeco MB20",
        category: "fingerprint",
        price: 3100,
        image: "phngar.jpg",
        description: "يدعم بصمة الوجه، الأصبع، والكارت، مع برنامج التقارير بالعربي."
    },

    // --- قسم الطابعات ومستلزماتها (printer) ---
    {
        id: 6,
        title: "طابعة فواتير حرارية USB / Ethernet",
        category: "printer",
        price: 2200,
        image: "3.jpg",
        description: "سرعة طباعة عالية 80mm، قص آلي للفواتير، متوافقة مع كافة برامج POS."
    },

    // --- قسم الشبكات والسيرفرات (network) ---
    {
        id: 7,
        title: "سويتش شبكة TP-Link 16 Port Gigabit",
        category: "network",
        price: 1850,
        image: "swatch.png",
        description: "هيكل معدني قوي، نقل بيانات سريع ومناسب للشركات وأنظمة الكاميرات."
    },
    {
        id: 8,
        title: "راوتر وسيرفر توزيع شبكات Mikrotik hEX",
        category: "network",
        price: 2900,
        image: "5.jpg",
        description: "إدارة وتوزيع السرعات واليوزرات للمؤسسات والشبكات السلكية."
    }
];

// ==========================================
// 2. إدارة السلة وتخزين البيانات المحلية
// ==========================================
let cart = JSON.parse(localStorage.getItem('tech_store_cart')) || [];

// عرض المنتجات في الصفحة عند التحميل
document.addEventListener("DOMContentLoaded", () => {
    displayProducts('all');
    updateCartUI();
    initSliders();
    initCounters();
});

// دالة عرض المنتجات بناءً على الفلتر
function displayProducts(categoryFilter) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const filteredProducts = categoryFilter === 'all' 
        ? productsData 
        : productsData.filter(p => p.category === categoryFilter);

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 20px;">لا توجد منتجات متاحة في هذا القسم حالياً.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-box" onclick="openImageModal('${product.image}', '${product.title}')">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.title}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-bottom">
                    <span class="product-price">${product.price} ج.م</span>
                    <button class="btn-primary" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-cart-plus"></i> أضف للسلة
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// دالة تصفية المنتجات عند الضغط على الأزرار
function filterProducts(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayProducts(category);
}

// ==========================================
// 3. وظائف سلة الشراء وإتمام الطلب
// ==========================================
function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    alert(`تم إضافة "${product.title}" إلى السلة بنجاح.`);
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotal = document.getElementById('cartTotal');

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartCount) cartCount.innerText = totalCount;
    if (cartTotal) cartTotal.innerText = totalPrice;

    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p style="text-align:center; color:#64748b;">السلة فارغة حالياً</p>';
        return;
    }

    cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
            <div>
                <strong style="display:block; font-size:0.95rem;">${item.title}</strong>
                <small style="color:#64748b;">${item.price} ج.م × ${item.quantity}</small>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <button onclick="changeQuantity(${item.id}, -1)" style="padding:2px 8px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${item.id}, 1)" style="padding:2px 8px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">+</button>
                <button onclick="removeFromCart(${item.id})" style="color:#ef4444; border:none; background:none; cursor:pointer; margin-right:5px;"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('tech_store_cart', JSON.stringify(cart));
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    }
}

function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert('السلة فارغة!');
        return;
    }

    let message = "السلام عليكم، أريد إتمام طلب المنتجات التالية من الموقع:\n\n";
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `${index + 1}. ${item.title}\n   - الكمية: ${item.quantity}\n   - السعر: ${itemTotal} ج.م\n`;
    });

    message += `\n*الإجمالي العام: ${total} ج.م*`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/201157143707?text=${encodedMessage}`, '_blank');
}

// ==========================================
// 4. النوافذ المنبثقة للصور والكورسات والتقييمات
// ==========================================
function openImageModal(src, title) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    if (modal && modalImg) {
        modal.style.display = 'block';
        modalImg.src = src;
        if (caption) caption.innerText = title;
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.style.display = 'none';
}

function openEnrollModal(courseTitle, price) {
    document.getElementById('modalCourseTitle').innerText = `حجز: ${courseTitle}`;
    document.getElementById('selectedCourseName').value = courseTitle;
    document.getElementById('courseModal').style.display = 'block';
}

function closeEnrollModal() {
    document.getElementById('courseModal').style.display = 'none';
}

function openReviewModal() {
    document.getElementById('reviewModal').style.display = 'block';
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

function submitReview(event) {
    event.preventDefault();
    const name = document.getElementById('reviewName').value;
    const role = document.getElementById('reviewRole').value || 'عميل المركز';
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value;

    const grid = document.getElementById('testimonialsGrid');
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    
    let starsHtml = '';
    for (let i = 0; i < rating; i++) starsHtml += '<i class="fa-solid fa-star"></i>';

    card.innerHTML = `
        <div class="stars">${starsHtml}</div>
        <p class="review-text">"${comment}"</p>
        <div class="client-info">
            <strong>${name}</strong>
            <span>${role}</span>
        </div>
    `;

    grid.prepend(card);
    closeReviewModal();
    document.getElementById('reviewForm').reset();
    alert('شكراً لك! تم نشر تعليقك بنجاح.');
}

// ==========================================
// 5. التحكم بالنظام والسلايدر والقوائم
// ==========================================
let currentSlideIndex = 0;
function initSliders() {
    const slides = document.querySelectorAll('.hero-slider .slide');
    if (slides.length === 0) return;
    setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.hero-slider .slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    if (slides.length === 0) return;

    slides[currentSlideIndex].classList.remove('active');
    if (dots[currentSlideIndex]) dots[currentSlideIndex].classList.remove('active');

    currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;

    slides[currentSlideIndex].classList.add('active');
    if (dots[currentSlideIndex]) dots[currentSlideIndex].classList.add('active');
}

function toggleMenu() {
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.toggle('active');
}

function closeMenu() {
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.remove('active');
}

// العدادات التفاعلية
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const speed = target / 100;
        const update = () => {
            count += speed;
            if (count < target) {
                counter.innerText = Math.ceil(count);
                setTimeout(update, 20);
            } else {
                counter.innerText = target;
            }
        };
        update();
    });
}

// معالجة نموذج صيانة/معاينة عبر الواتساب
const whatsappForm = document.getElementById('whatsappForm');
if (whatsappForm) {
    whatsappForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const service = document.getElementById('service_type').value;
        const address = document.getElementById('address').value;

        const text = `طلب جديد عبر الموقع:\n- الاسم: ${name}\n- الهاتف: ${phone}\n- الخدمة: ${service}\n- العنوان: ${address}`;
        window.open(`https://wa.me/201157143707?text=${encodeURIComponent(text)}`, '_blank');
    });
}

// معالجة نموذج حجز الكورس عبر الواتساب
const courseEnrollForm = document.getElementById('courseEnrollForm');
if (courseEnrollForm) {
    courseEnrollForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const course = document.getElementById('selectedCourseName').value;
        const name = document.getElementById('studentName').value;
        const phone = document.getElementById('studentPhone').value;
        const level = document.getElementById('studentLevel').value;

        const text = `حجز دورة تدريبية:\n- الكورس: ${course}\n- الاسم: ${name}\n- الهاتف: ${phone}\n- المستوى: ${level}`;
        window.open(`https://wa.me/201157143707?text=${encodeURIComponent(text)}`, '_blank');
        closeEnrollModal();
    });
}
