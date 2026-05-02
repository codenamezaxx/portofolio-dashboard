## 📋 Panduan Implementasi Fitur PDF Preview + Download Sertifikat

### ✅ Apa yang Sudah Diimplementasikan:

1. **PDF Rendering Library**: `pdfjs-dist` sudah ditambahkan ke `package.json`
2. **PDF Utility**: File `lib/pdfUtil.ts` untuk handle PDF rendering
3. **PDFPreviewCard Component**: `components/ui/PDFPreviewCard.tsx` - komponen card dengan preview
4. **Updated Achievement Interface**: Menambahkan field `pdfPath`
5. **Updated Achievements Section**: Menggunakan PDFPreviewCard baru

---

### 🚀 Langkah Setup:

#### **Step 1: Install Dependencies**
```bash
npm install
```
Ini akan install `pdfjs-dist` yang diperlukan untuk render PDF.

#### **Step 2: Siapkan File PDF Sertifikat**
- Letakkan file PDF sertifikat di folder: `public/certificates/`
- Nama file harus sesuai dengan yang terdaftar di `data/portfolio.ts`:
  - `cert-1.pdf`
  - `cert-2.pdf`
  - `cert-3.pdf`
  - `cert-4.pdf`
  - `cert-5.pdf`
  - `cert-6.pdf`

#### **Step 3: Verifikasi Path di portfolio.ts**
Pastikan pdfPath di `data/portfolio.ts` sudah benar:
```typescript
export const ACHIEVEMENTS: Achievement[] = [
  { 
    id: 1, 
    title: "Sertifikat 1", 
    category: "Kursus Online", 
    year: "2020", 
    pdfPath: "/certificates/cert-1.pdf"  // Path dari folder public
  },
  // ... dan seterusnya
];
```

#### **Step 4: Test Aplikasi**
```bash
npm run dev
```

### 🎨 Fitur Card Achievement:

Setiap card sekarang memiliki:

1. **PDF Preview Background**: 
   - Halaman pertama PDF di-render sebagai background (dengan opacity 20%)
   - Menjadi lebih terlihat saat hover (opacity 40%)

2. **Loading State**: 
   - Menampilkan loading animation saat render PDF

3. **Error Handling**: 
   - Jika PDF tidak bisa di-render, akan show warning icon

4. **Download Button**: 
   - Button "Download PDF" di bawah card
   - Disabled otomatis jika PDF tidak tersedia

5. **Hover Effect**: 
   - Card naik sedikit saat hover (`whileHover={{ y: -5 }}`)
   - Border dan preview menjadi lebih terang

---

### 📝 Customization:

#### **Jika ingin mengubah jumlah sertifikat:**
1. Update `types.ts` jika ada field baru yang diperlukan
2. Tambah/hapus item di `ACHIEVEMENTS` array di `portfolio.ts`
3. Pastikan file PDF sesuai ada di `public/certificates/`

#### **Jika ingin mengubah appearance:**
- Edit `components/ui/PDFPreviewCard.tsx` untuk styling
- Update `lib/pdfUtil.ts` untuk mengubah PDF rendering settings

#### **Jika ingin mengubah PDF worker source:**
Di `lib/pdfUtil.ts`, baris ini bisa dikustomisasi:
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

---

### ⚠️ Troubleshooting:

1. **PDF tidak tampil:**
   - Pastikan file PDF ada di `public/certificates/`
   - Check browser console untuk error messages
   - Pastikan `npm install` sudah dijalankan

2. **Preview loading lama:**
   - Rendering PDF first time memang memakan waktu
   - Ini normal, browser akan cache setelahnya

3. **CORS Error:**
   - Pastikan PDF diakses dari path yang sama (relative path dengan `/`)

---

### 🔧 File yang Diubah/Ditambah:

**Ditambahkan:**
- ✅ `lib/pdfUtil.ts` - PDF utility functions
- ✅ `components/ui/PDFPreviewCard.tsx` - Achievement card component
- ✅ `public/certificates/` - Folder untuk PDF files

**Diubah:**
- ✅ `types.ts` - Menambah `pdfPath` field
- ✅ `data/portfolio.ts` - Menambah `pdfPath` ke achievements
- ✅ `package.json` - Menambah `pdfjs-dist` dependency
- ✅ `components/sections/Achievements.tsx` - Menggunakan PDFPreviewCard

---

### 📦 Dependencies Baru:
- `pdfjs-dist@^4.0.379` - Mozilla's PDF.js library untuk rendering PDF

---

### 🎯 Fitur Siap:

✅ PDF Preview (halaman pertama) sebagai background  
✅ Download PDF functionality  
✅ Loading & error states  
✅ Responsive design (mobile-friendly)  
✅ Smooth animations (Framer Motion)  
✅ Dark/Cream theme compatible  

Semuanya siap digunakan! 🎉
