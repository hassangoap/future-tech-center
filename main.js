document.getElementById('whatsappForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // استخراج البيانات من النموذج
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const service = document.getElementById('service_type').value;
    const address = document.getElementById('address').value;

    // أدخل رقم الواتساب الخاص بك هنا (مبتدئاً بكود الدولة +20)
    const whatsappNumber = "201157143707"; 

    // تجهيز نص الرسالة
    const message = `طلب جديد من الموقع %0A%0A` +
                    `*الاسم:* ${encodeURIComponent(name)}%0A` +
                    `*رقم الهاتف:* ${encodeURIComponent(phone)}%0A` +
                    `*الخدمة المطلوبة:* ${encodeURIComponent(service)}%0A` +
                    `*العنوان:* ${encodeURIComponent(address)}`;

    // فتح رابط الواتساب
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
});

let cart = [];

// إضافة منتج للسلة
function addToCart(title, price) {
    const existingProduct = cart.find(item => item.title === title);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ title: title, price: price, quantity: 1 });
    }
    updateCartUI();
    alert(`تمت إضافة "${title}" إلى السلة بنجاح`);
}

// تحديث واجهة السلة والعداد
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotal = document.getElementById('cartTotal');

    // تحديث العداد
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(cartCount) cartCount.innerText = totalItems;

    // تحديث المحتوى الداخلي للسلة
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p>السلة فارغة حالياً</p>';
        cartTotal.innerText = '0';
        return;
    }

    let itemsHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.title}</strong><br>
                    <small>${item.price} ج.م × ${item.quantity}</small>
                </div>
                <div>
                    <span>${itemTotal} ج.م</span>
                    <button onclick="removeFromCart(${index})" style="color:red; border:none; background:none; cursor:pointer; margin-right:10px;">✕</button>
                </div>
            </div>
        `;
    });

    cartItemsList.innerHTML = itemsHTML;
    cartTotal.innerText = total;
}

// حذف منتج من السلة
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// إظهار/إخفاء نافذة السلة عند الضغط على أيقونة السلة
document.querySelector('.cart-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    toggleCart();
});

function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = (cartModal.style.display === 'flex') ? 'none' : 'flex';
}

// إرسال طلب الشراء عبر الواتساب
function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert('سلتك فارغة!');
        return;
    }

    const whatsappNumber = "201157143707"; // أضف رقم الهاتف الخاص بك هنا
    let message = "طلب شراء جديد من المتجر:%0A%0A";

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `• ${item.title} (الكمية: ${item.quantity}) - ${itemTotal} ج.م%0A`;
    });

    message += `%0A*الإجمالي:* ${total} ج.م`;

    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
}
// فتح نافذة حجز الكورس
function openEnrollModal(courseName, price) {
    document.getElementById('modalCourseTitle').innerText = `حجز: ${courseName}`;
    document.getElementById('selectedCourseName').value = courseName;
    document.getElementById('courseModal').style.display = 'flex';
}

// إغلاق نافذة حجز الكورس
function closeEnrollModal() {
    document.getElementById('courseModal').style.display = 'none';
}

// معالجة نموذج التسجيل وإرساله عبر الواتساب
document.getElementById('courseEnrollForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const courseName = document.getElementById('selectedCourseName').value;
    const name = document.getElementById('studentName').value;
    const phone = document.getElementById('studentPhone').value;
    const level = document.getElementById('studentLevel').value;

    const whatsappNumber = "201157143707"; // رقم الواتساب الخاص بالمركز

    const message = `طلب حجز كورس تدريبي جديد:%0A%0A` +
                    `*الدورة:* ${encodeURIComponent(courseName)}%0A` +
                    `*اسم المتدرب:* ${encodeURIComponent(name)}%0A` +
                    `*رقم الهاتف:* ${encodeURIComponent(phone)}%0A` +
                    `*المستوى:* ${encodeURIComponent(level)}`;

    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
    closeEnrollModal();
});
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    if (index >= slides.length) currentSlideIndex = 0;
    if (index < 0) currentSlideIndex = slides.length - 1;

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    showSlide(currentSlideIndex);
}

function currentSlide(index) {
    currentSlideIndex = index;
    showSlide(currentSlideIndex);
}

// التغيير التلقائي للصور كل 4 ثوانٍ
setInterval(() => {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
}, 4000);
function updateVisitorCount() {
    // جلب عدد الزيارات الحالي أو البدء برقم شرفي مثل 1000
    let count = localStorage.getItem('site_visitors');
    
    if (!count) {
        count = 1024; // بداية العداد للزوار الجدد
    } else {
        count = parseInt(count) + 1;
    }
    
    // حفظ الرقم الجديد وتحديث الشاشة
    localStorage.setItem('site_visitors', count);
    document.getElementById('visitorCount').innerText = count.toLocaleString('ar-EG');
}

// تشغيل العداد عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateVisitorCount);
// انيميشن تصاعد الأرقام حركياً
const counters = document.querySelectorAll('.counter');
const speed = 200; 

counters.forEach(counter => {
    const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const inc = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + inc);
            setTimeout(updateCount, 20);
        } else {
            counter.innerText = target.toLocaleString('ar-EG');
        }
    };
    updateCount();
});
function filterProducts(category) {
    // تحديث الشكل النشط للأزرار
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // إخفاء وإظهار المنتجات حسب التصنيف
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        if (category === 'all' || product.getAttribute('data-category') === category) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });
}
// فتح نافذة المعاينة الكبيرة للصورة
function openImageModal(imgSrc, captionText) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');

    modal.style.display = 'flex';
    modalImg.src = imgSrc;
    caption.innerText = captionText;
}

// إغلاق نافذة المعاينة
function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
}

// إغلاق النافذة بضغط زر Esc على لوحة المفاتيح
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closeImageModal();
    }
});
// فتح وإغلاق القائمة في الهواتف
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuBtnIcon = document.querySelector('#menuBtn i');
    
    navLinks.classList.toggle('active');
    
    // تغيير أيقونة القائمة بين (Bars) و (Close X)
    if (navLinks.classList.contains('active')) {
        menuBtnIcon.className = 'fa-solid fa-xmark';
    } else {
        menuBtnIcon.className = 'fa-solid fa-bars';
    }
}

// إغلاق القائمة تلقائياً عند الضغط على أي رابط
function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuBtnIcon = document.querySelector('#menuBtn i');
    
    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuBtnIcon.className = 'fa-solid fa-bars';
    }
}
// قراءة وتوزيع المنتجات حسب الأقسام
function loadOffersToStore() {
    const productsGrid = document.querySelector('.products-grid');
    const storedOffers = JSON.parse(localStorage.getItem('myOffers'));

    if (!storedOffers || storedOffers.length === 0) return;

    productsGrid.innerHTML = '';

    storedOffers.forEach(offer => {
        if (offer.hidden) return; // إخفاء المنتجات المعطلة

        const productHTML = `
            <div class="product-card" data-category="${offer.category}">
                <span class="product-badge sale">جديد</span>
                <div class="product-img-holder" onclick="openImageModal(this.querySelector('img').src, '${offer.title}')">
                    <img src="${offer.image}" alt="${offer.title}">
                    <div class="zoom-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
                </div>
                <div class="product-info">
                    <span class="category-name">${getCategoryName(offer.category)}</span>
                    <h3>${offer.title}</h3>
                    <div class="price-container">
                        <span class="price">${offer.price} ج.م</span>
                        ${offer.oldPrice ? `<span class="old-price">${offer.oldPrice} ج.م</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-primary add-to-cart-btn" onclick="addToCart('${offer.title}', ${offer.price})">
                            <i class="fa-solid fa-cart-plus"></i> أضف للسلة
                        </button>
                        <a href="https://wa.me/201157143707?text=استفسار%20عن%20${encodeURIComponent(offer.title)}" target="_blank" class="quick-buy-btn">
                            <i class="fa-brands fa-whatsapp"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
        productsGrid.innerHTML += productHTML;
    });
}

// دالة لتصفية المنتجات حسب الزر المكبوس
function filterProducts(category) {
    const cards = document.querySelectorAll('.product-card');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // تفعيل الزر النشط
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // إظهار وإخفاء الكروت بناءً على القسم
    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', loadOffersToStore);

// القائمة الافتراضية للمنتجات (في حال لم يتم إضافة منتجات من لوحة التحكم بعد)
const defaultProducts = [
    {
        id: 1,
        title: "كاميرا مراقبة Hikvision 5MP IP",
        category: "camera",
        price: 1250,
        oldPrice: 1500,
        image: "images/Hikvision.jpg",
        hidden: false
    },
    {
        id: 2,
        title: "جهاز بصمة حضور وانصراف ZKTeco",
        category: "fingerprint",
        price: 3400,
        oldPrice: null,
        image: "images/phngar.jpg",
        hidden: false
    },
    {
        id: 3,
        title: "طابعة HP Laserjet Pro",
        category: "printer",
        price: 6800,
        oldPrice: null,
        image: "images/prant.png",
        hidden: false
    },
    {
        id: 4,
        title: "سويتش شبكات TP-Link 16 Port",
        category: "network",
        price: 2100,
        oldPrice: 2350,
        image: "images/swatch.png",
        hidden: false
    }
];

// دالة تحويل رمز القسم إلى اسم عربي
function getCategoryName(cat) {
    const categories = {
        'camera': 'كاميرات مراقبة',
        'fingerprint': 'أجهزة بصمة',
        'printer': 'طابعات ومستلزمات',
        'network': 'معدات شبكات'
    };
    return categories[cat] || 'منتجات عامة';
}

// دالة جلب وعرض المنتجات من الـ LocalStorage
function loadOffersToStore() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return; // حماية في حال عدم وجود // قائمة المنتجات المعروضة في المتجر مباشرة
const productsData = [
    {
        id: 1,
        title: "كاميرا مراقبة Hikvision 5MP IP",
        category: "camera",
        price: 1200,
        oldPrice: 1400,
        image: "camera1.jpg"
    },
    {
        id: 2,
        title: "جهاز بصمة حضور وانصراف ZKTeco",
        category: "fingerprint",
        price: 2500,
        oldPrice: null,
        image: "fingerprint1.jpg"
    },
    {
        id: 3,
        title: "راوتر وسويتش شبكات TP-Link 16 Port",
        category: "network",
        price: 1800,
        oldPrice: 2000,
        image: "network1.jpg"
    }
];


   // قراءة