## 🔧 Fix Errors & Setup Instructions

### ✅ Masalah yang Sudah Diperbaiki:

1. **Missing @types/react** - ✅ Ditambahkan ke `package.json`
2. **Hero image import error** - ✅ Diubah ke public path `/hero.png`  
3. **PDFPreviewCard type issues** - ✅ Type definitions diperbaiki

---

### 🚀 Setup Langkah-Langkah:

#### **Step 1: Install Dependencies**
Jalankan command ini di terminal:
```bash
npm install
```
Ini akan install `@types/react`, `@types/react-dom`, dan `pdfjs-dist`.

#### **Step 2: Siapkan Hero Image**
Letakkan file hero image di folder `public/` dengan nama:
- `hero.png` (recommended format)

**Atau** jika ingin menggunakan asset lokal:
1. Letakkan file di `components/assets/image/hero.png`
2. Update `Hero.tsx` line 104 dari:
   ```tsx
   src="/hero.png"
   ```
   Menjadi:
   ```tsx
   src={new URL('../assets/image/hero.png', import.meta.url).href}
   ```

#### **Step 3: Siapkan Certificate PDFs**
Letakkan file PDF sertifikat di folder `public/certificates/`:
- `cert-1.pdf`
- `cert-2.pdf`
- `cert-3.pdf`
- `cert-4.pdf`
- `cert-5.pdf`
- `cert-6.pdf`

#### **Step 4: Test Aplikasi**
```bash
npm run dev
```

---

### 📁 Folder Structure yang Diperlukan:

```
public/
├── hero.png                    # Hero section image
├── resume.pdf                  # CV file (untuk download CV button)
└── certificates/
    ├── cert-1.pdf
    ├── cert-2.pdf
    ├── cert-3.pdf
    ├── cert-4.pdf
    ├── cert-5.pdf
    └── cert-6.pdf
```

---

### 🎨 File yang Diubah:

1. ✅ `package.json` - Added `@types/react` dan `@types/react-dom`
2. ✅ `components/sections/Hero.tsx` - Hapus import heroImage, use public path
3. ✅ `components/ui/PDFPreviewCard.tsx` - Fix type definitions

---

### 🛠️ Build & Deploy:

**Development:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
```

**Preview Build:**
```bash
npm run preview
```

---

### ⚠️ Catatan Penting:

1. **Folder `public/` adalah root path** - File di folder ini dapat diakses dengan path `/filename`
2. **Semua images & PDFs harus di `public/`** untuk deployment yang smooth
3. **Pertama kali install, perlu run `npm install`** untuk install dependencies baru
4. **Jika masih ada error setelah install**, coba:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### 📝 Customization:

Jika ingin mengubah path hero image di Hero.tsx (line 104):

**Option 1: Public Folder (Recommended)**
```tsx
src="/hero.png"  // Letakkan di public/hero.png
```

**Option 2: Local Assets**
```tsx
src={new URL('../assets/image/hero.png', import.meta.url).href}
```
Letakkan file di `components/assets/image/hero.png`

**Option 3: External URL**
```tsx
src="https://example.com/image.jpg"
```

---

### 🎉 Done!

Setelah mengikuti langkah-langkah di atas, semua error harus hilang dan aplikasi siap dijalankan!
