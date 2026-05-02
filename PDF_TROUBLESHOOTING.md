# 🔧 PDF Certificates Troubleshooting Guide

## 📋 Masalah yang Sudah Diperbaiki:

✅ **Missing cert-6.pdf** - Diupdate ACHIEVEMENTS untuk hanya 5 sertifikat  
✅ **PDF Worker CDN Issue** - Ditambahkan fallback ke local worker  
✅ **Better Error Handling** - PDFPreviewCard sekarang punya fallback button  
✅ **Better Logging** - Console logs untuk debugging  

---

## 🚀 Checklist Sebelum Run:

### 1️⃣ **Pastikan File PDF Ada**
Folder `public/certificates/` harus berisi:
- ✅ cert-1.pdf
- ✅ cert-2.pdf
- ✅ cert-3.pdf
- ✅ cert-4.pdf
- ✅ cert-5.pdf

Cek dengan command:
```bash
# Windows
dir public\certificates\

# Linux/Mac
ls -la public/certificates/
```

### 2️⃣ **Pastikan Dependencies Terinstall**
```bash
npm install
```

Output harus include:
- ✅ `pdfjs-dist`
- ✅ `@types/react`
- ✅ `@types/react-dom`

Verify dengan:
```bash
npm list pdfjs-dist
```

### 3️⃣ **Hapus Cache & Install Ulang Jika Perlu**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🐛 Debugging Steps:

### **Step 1: Buka Browser Dev Tools (F12)**

### **Step 2: Buka Console Tab**

### **Step 3: Lihat Logs**
Anda seharusnya melihat:
```
Loading PDF from: /certificates/cert-1.pdf
PDF preview generated successfully
PDF downloaded: Sertifikat_1_2020.pdf
```

### **Step 4: Jika Ada Error, Lihat Message**

Contoh error dan solusi:

| Error | Penyebab | Solusi |
|-------|---------|--------|
| `Cannot find module 'pdfjs-dist'` | Module belum terinstall | Jalankan `npm install` |
| `Failed to load PDF worker` | CDN atau worker issue | Browser akan fallback otomatis |
| `Loading PDF from: undefined` | pdfPath tidak valid | Cek portfolio.ts ACHIEVEMENTS |
| `CORS error` | File tidak accessible | Pastikan file di `public/` |

---

## 🎯 How It Works:

```
User membuka halaman Achievements
         ↓
Component mount → useEffect dipicu
         ↓
PDFUtil.getPDFPreview(pdfPath)
         ↓
✅ PDF berhasil load
   ├→ Render halaman 1 ke canvas
   ├→ Convert ke image data URL
   └→ Set sebagai background
         ↓
❌ PDF gagal load
   ├→ Set error state
   └→ Show fallback "Buka" button
         ↓
User bisa:
   ├→ Download PDF (langsung download)
   └→ Buka PDF (buka di tab baru)
```

---

## 💡 Fitur Baru:

### **1. Better Error Handling**
- Loading indicator saat render PDF
- Fallback "Buka" button jika preview gagal
- Console logs untuk debugging

### **2. PDF Worker Fallback**
- Coba CDN dulu (lebih cepat)
- Fallback ke local worker jika CDN gagal
- Tidak akan crash app

### **3. Improved Download**
- Better filename handling
- Error logging

---

## 🎯 Expected Behavior:

**Saat pertama kali load:**
```
✅ Loading indicator muncul (1-2 detik)
✅ PDF preview background muncul (semi-transparent)
✅ Download button ready
✅ Jika preview gagal, "Buka" button tersedia
```

**Saat hover:**
```
✅ Card naik sedikit
✅ Preview background lebih terang (opacity 40%)
✅ Border lebih terang
```

**Saat click Download:**
```
✅ File di-download ke local computer
✅ Filename: "Sertifikat_1_2020.pdf"
```

**Saat click Buka (jika preview gagal):**
```
✅ PDF dibuka di tab baru
✅ Browser PDF viewer menampilkan file
```

---

## ⚠️ Known Issues & Workarounds:

### **Issue: Preview tidak muncul, tapi download bekerja**
- Ini normal! PDF bisa di-download tanpa perlu preview
- Fallback "Buka" button akan tersedia

### **Issue: Download tidak bekerja**
- Check browser console untuk errors
- Pastikan file ada di `public/certificates/`
- Try click "Buka" button instead

### **Issue: PDF crash atau freeze**
- PDF besar (>10MB) bisa lambat
- Compress PDF atau split to smaller files
- Browser akan show timeout message

---

## 🔍 Browser Console Commands (untuk testing):

Buka F12 → Console, paste:

```javascript
// Test 1: Check if file exists
fetch('/certificates/cert-1.pdf')
  .then(r => console.log('File exists:', r.status))
  .catch(e => console.error('File not found:', e));

// Test 2: Check pdfjs-dist
import('pdfjs-dist')
  .then(() => console.log('pdfjs-dist loaded'))
  .catch(e => console.error('pdfjs-dist error:', e));

// Test 3: Manual render
async function testPDF() {
  const pdfjsLib = await import('pdfjs-dist');
  const pdf = await pdfjsLib.getDocument('/certificates/cert-1.pdf').promise;
  console.log('PDF pages:', pdf.numPages);
}
testPDF();
```

---

## 📞 Support:

Jika masih error, check:
1. ✅ Semua PDF ada di `public/certificates/`
2. ✅ `npm install` sudah dijalankan
3. ✅ Browser console untuk error messages
4. ✅ Vite dev server running (`npm run dev`)
5. ✅ No CORS issues (file harus di `public/`)

---

## 🎉 Success Indicators:

✅ Achievements section loading tanpa error  
✅ Cards muncul dengan preview atau fallback  
✅ Download button bekerja  
✅ No console errors  
✅ PDF terbuka saat click "Buka"  

Semua OK? Selesai! 🚀
