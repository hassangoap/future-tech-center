// 1. المنتجات الافتراضية إذا كانت الذاكرة فارغة
const defaultProducts = [
    {
        id: 1,
        title: "كاميرا مراقبة Hikvision 5MP IP",
        category: "camera",
        price: 1250,
        oldPrice: 1500,
        image: "Hikvision.jpg",
        hidden: false
    },
    {
        id: 2,
        title: "جهاز بصمة حضور وانصراف ZKTeco",
        category: "fingerprint",
        price: 3400,
        oldPrice: null,
        image: "phngar.jpg",
        hidden: false
    },
    {
        id: 3,
        title: "طابعة HP Laserjet Pro",
        category: "printer",
        price: 6800,
        oldPrice: null,
        image: "prant.png",
        hidden: false
    },
    {
        id: 4,
        title: "سويتش شبكات TP-Link 16 Port",
        category: "network",
        price: 2100,
        oldPrice: 2350,
        image: "swatch.png",
        hidden: false
    }
];

// جلب العروض من LocalStorage
let offers = JSON.parse(localStorage.getItem('myOffers'));
if (!offers || offers.length === 0) {
    offers = defaultProducts;
    localStorage.setItem('myOffers', JSON.stringify(offers));
}

// دالة تحويل اسم القسم للعربية
function getCategoryName(cat) {
    const map = {
        'camera': 'كاميرات مراقبة',
        'fingerprint': 'أجهزة بصمة',
        'printer': 'طابعات',
        'network': 'شبكات'
    };
    return map[cat] || 'عام';
}

// دالة حفظ البيانات وتحديث الجدول
function saveOffers() {
    localStorage.setItem('myOffers', JSON.stringify(offers));
    renderOffersTable();
}

// عرض المنتجات في جدول لوحة التحكم
function renderOffersTable() {
    const tbody = document.getElementById('offersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    offers.forEach(offer => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${offer.image}" alt="${offer.title}" class="offer-thumb" onerror="this.src='logo.png'"></td>
            <td><strong>${offer.title}</strong></td>
            <td><span class="badge-cat">${getCategoryName(offer.category)}</span></td>
            <td>${offer.price} ج.م</td>
            <td><span class="status-badge ${offer.hidden ? 'hidden' : 'active'}">${offer.hidden ? 'مخفي' : 'نشط'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="editOffer(${offer.id})" title="تعديل المنتج">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-icon btn-toggle" onclick="toggleOfferVisibility(${offer.id})" title="${offer.hidden ? 'إظهار' : 'إخفاء'}">
                        <i class="fa-solid ${offer.hidden ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteOffer(${offer.id})" title="حذف">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// فتح النافذة للإضافة
function openOfferModal() {
    document.getElementById('offerForm').reset();
    document.getElementById('offerId').value = ''; // تفريغ الـ ID
    document.getElementById('modalTitle').innerText = 'إضافة منتج جديد';
    document.getElementById('saveBtn').innerText = 'حفظ المنتج';
    document.getElementById('offerModal').style.display = 'flex';
}

// إغلاق النافذة
function closeOfferModal() {
    document.getElementById('offerModal').style.display = 'none';
}

// دالة تجهيز النموذج للتعديل عند الضغط على زر التعديل ✏️
function editOffer(id) {
    const offer = offers.find(o => o.id === id);
    if (!offer) return;

    // تعبئة بيانات المنتج داخل حقول النافذة المنبثقة
    document.getElementById('offerId').value = offer.id;
    document.getElementById('offerTitle').value = offer.title;
    document.getElementById('offerCategory').value = offer.category;
    document.getElementById('offerPrice').value = offer.price;
    document.getElementById('offerOldPrice').value = offer.oldPrice || '';
    document.getElementById('offerImage').value = offer.image;

    // تغيير عنوان النافذة بزر التعديل
    document.getElementById('modalTitle').innerText = 'تعديل بيانات المنتج';
    document.getElementById('saveBtn').innerText = 'تحديث البيانات';
    document.getElementById('offerModal').style.display = 'flex';
}

// معالجة حفظ المنتج (سواء كان إضافة أو تعديل)
function handleOfferSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('offerId').value;
    const title = document.getElementById('offerTitle').value;
    const category = document.getElementById('offerCategory').value;
    const price = parseFloat(document.getElementById('offerPrice').value);
    const oldPrice = parseFloat(document.getElementById('offerOldPrice').value) || null;
    const image = document.getElementById('offerImage').value;

    if (id) {
        // إذا كان يمتلك ID إذن نحن نقوم بالتعديل
        const index = offers.findIndex(o => o.id == id);
        if (index !== -1) {
            offers[index] = {
                ...offers[index],
                title,
                category,
                price,
                oldPrice,
                image
            };
        }
    } else {
        // إذا كان الـ ID فارغاً إذن هذا منتج جديد
        const newProduct = {
            id: Date.now(),
            title,
            category,
            price,
            oldPrice,
            image,
            hidden: false
        };
        offers.push(newProduct);
    }

    saveOffers();
    closeOfferModal();
}

// إخفاء أو إظهار المنتج
function toggleOfferVisibility(id) {
    const offer = offers.find(o => o.id === id);
    if (offer) {
        offer.hidden = !offer.hidden;
        saveOffers();
    }
}

// حذف المنتج
function deleteOffer(id) {
    if (confirm('هل أنت تأكد من إزالة هذا المنتج؟')) {
        offers = offers.filter(o => o.id !== id);
        saveOffers();
    }
}

// تشغيل الجدول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', renderOffersTable);