# Tez UP Shop - Savdo va Ombor Boshqaruvi Tizimi (POS & ERP)

Zamonaviy do'konlar, chakana va ulgurji savdo nuqtalari hamda omborlar uchun mo'ljallangan to'liq funksional savdo, hisob-kitob va ombor boshqaruvi tizimi.

---

## 🌟 Asosiy Xususiyatlar

### 1. 🛒 Savdo va Kassa (POS - Point of Sale)
- **Tezkor kassa:** Shtrix-kod skaneri va qidiruv orqali mahsulotlarni tezkor savatga qo'shish.
- **Ko'p rejimli to'lov:** Naqd, plastik karta, o'tkazma yoki qarz/nasiyaga savdo qilish imkoniyati.
- **Kassir smenalari:** Smenani ochish, yopish, kassa qoldig'i hisob-kitobi.
- **Chek chiqarish:** Savdoni tasdiqlovchi cheklarni shakllantirish va chop etish.

### 2. 📦 Mahsulotlar va Kategoriyalar Boshqaruvi
- Mahsulotlarni toifalar va birliklar bo'yicha saralash (dona, kg, litr va hk).
- Shtrix-kodlar, tannarx va sotish narxlarini nazorat qilish.
- Qoldiq kamayishi haqidagi ogohlantirishlar (kam qolgan tovarlar).

### 3. 🏢 Ombor va Qoldiqlar Nazorati (Warehouse & Inventory)
- Bir nechta omborlar o'rtasida mahsulotlar harakati.
- Omborga kirim qilish, hisobdan chiqarish (spisanie) va qayta hisoblash (inventarizatsiya).
- Ombordagi jami qiymat va qoldiqlar statistikasi.

### 4. 🤝 Xaridorlar va Ta'minotchilar
- **Mijozlar bazasi:** Doimiy mijozlar, chegirmalar va ularning xarid tarixi.
- **Nasiya/Qarz daftari:** Mijozlarning qarzdorliklarini kuzatib borish.
- **Ta'minotchilar bilan hisob-kitob:** Xaridlar (purchases) va ta'minotchi oldidagi qarzlar monitoringi.

### 5. 👥 Xodimlar va Foydalanuvchi Huquqlari
- Kassirlar, omborchilar va administratorlar uchun alohida kirish va vazifalar.
- Har bir xodim amalga oshirgan savdolar monitoringi.

### 6. 📊 Tahlil va Hisobotlar (Reports & Dashboard)
- Kunlik, oylik va davriy savdo ko'rsatkichlari.
- Eng ko'p sotilgan tovarlar, sof foyda va tushum dinamikasi (interaktiv grafiklar - Recharts).
- Ombor aylanmasi va moliyaviy hisobotlar.

### 7. ⚙️ Tizim Sozlamalari
- Do'kon rekvizitlari, chek formati, valyuta va tizim konfiguratsiyalari.

---

## 🛠 Texnologiyalar Steki

- **Frontend kutubxonasi:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Yig'uvchi (Bundler):** [Vite 8](https://vitejs.dev/)
- **Stillashtirish:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Holat boshqaruvi (State Management):** [Zustand](https://zustand-demo.pmnd.rs/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Grafiklar:** [Recharts](https://recharts.org/)
- **Ikonkalar:** [Lucide React](https://lucide.dev/)
- **Sanalar bilan ishlash:** [date-fns](https://date-fns.org/)
- **Linter:** [Oxlint](https://oxc.rs/)

---

## 🚀 O'rnatish va Ishga Tushirish

### Talablar
- [Node.js](https://nodejs.org/) (v18 yoki undan yuqori)
- [Git](https://git-scm.com/)

### 1. Repozitoriyani klonlash:
```bash
git clone https://github.com/itcloud-uz/tez-up-shop.git
cd tez-up-shop
```

### 2. Bog'liqliklarni o'rnatish:
```bash
npm install
```

### 3. Loyihani ishlab chiqish (Development) rejimida ishga tushirish:
```bash
npm run dev
```
Dastur ishga tushgach, brauzeringizda `http://localhost:5173` manziliga o'ting.

### 4. Production uchun yig'ish (Build):
```bash
npm run build
```
Tayyor fayllar `dist` papkasida hosil bo'ladi.

### 5. Production versiyani tekshirish:
```bash
npm run preview
```

---

## 📂 Loyiha Tuzilmasi

```
tez-up-shop/
├── public/                 # Statik fayllar
├── src/
│   ├── assets/             # Rasmlar, ikonlar
│   ├── components/
│   │   ├── layout/         # Asosiy skelet, Sidebar, Topbar
│   │   └── ui/             # Reusable UI elementlar (Button, Input, Modal, Table, Toast, ...)
│   ├── data/               # Boshlang'ich/Mock ma'lumotlar
│   ├── pages/              # Asosiy sahifalar (Dashboard, POS, Products, Sales, Reports, ...)
│   ├── store/              # Zustand orqali global holatlar (useStore)
│   ├── types/              # TypeScript interfeyslari va turlari
│   ├── utils/              # Yordamchi funksiyalar (formatlash, hisob-kitob)
│   ├── App.tsx             # Marshrutlar (Routes)
│   ├── main.tsx            # Kirish nuqtasi
│   └── index.css           # Asosiy uslublar
├── package.json            # Paketlar ro'yxati
└── vite.config.ts          # Vite konfiguratsiyasi
```

---

## 📄 Litsenziya

Ushbu loyiha xususiy ishlab chiqilgan bo'lib, **IT Cloud** jamoasiga tegishli.
