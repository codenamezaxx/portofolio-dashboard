# 📋 Setup PDF Worker untuk Vite

## ⚠️ Step yang HARUS dilakukan:

### **1. Copy PDF Worker File**

PDF worker file harus di-copy dari `node_modules` ke folder `public` agar Vite bisa serve-nya tanpa bundling.

#### **Opsi A: Manual Copy (Paling Mudah)**

1. Buka file explorer
2. Navigate ke: `node_modules/pdfjs-dist/build/`
3. Cari file: `pdf.worker.min.js`
4. Copy file tersebut
5. Paste ke folder: `public/`
6. Result: `public/pdf.worker.min.js` ✅

#### **Opsi B: Command Line (Windows)**

```powershell
# Dari root project folder, jalankan:
Copy-Item -Path "node_modules/pdfjs-dist/build/pdf.worker.min.js" -Destination "public/" -Force
```

#### **Opsi C: Command Line (Linux/Mac)**

```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/
```

---

## 📊 Verifikasi

Setelah copy, struktur folder harus terlihat seperti ini:

```
project-root/
├── node_modules/
├── public/
│   ├── hero.png
│   ├── certificates/
│   │   ├── cert-1.pdf
│   │   ├── cert-2.pdf
│   │   └── ...
│   └── pdf.worker.min.js  ✅ FILE INI HARUS ADA
├── src/
├── package.json
└── ...
```

---

## 🚀 Testing

Setelah copy file, run dev server:

```bash
npm run dev
```

Buka http://localhost:3000 dan scroll ke Achievements section.

Check browser F12 console - seharusnya lihat:

```
✅ PDF.js worker initialized from public folder
✅ Loading PDF from: /certificates/cert-1.pdf
✅ PDF preview generated successfully
```

---

## 🔧 Troubleshooting

### ❌ Masih error "Failed to load worker"

**Solusi:**
1. Pastikan file `pdf.worker.min.js` ada di `public/` folder
2. Jalankan `npm install` lagi
3. Clear browser cache (Ctrl+Shift+Del atau Cmd+Shift+Del)
4. Reload page (F5)

### ❌ Error "Loading PDF from: undefined"

**Penyebab:** PDF path tidak valid
**Solusi:** Check `data/portfolio.ts` - pastikan `pdfPath` dimulai dengan `/`

```typescript
// ✅ Benar
pdfPath: "/certificates/cert-1.pdf"

// ❌ Salah
pdfPath: "certificates/cert-1.pdf"
```

### ❌ Error di console tapi tidak menampilkan preview

**Ini normal!** Component sudah diupdate untuk:
1. Fallback "Buka" button jika preview gagal
2. Tetap bisa download file
3. Bisa manual open PDF di tab baru

---

## 💡 Why This Works

**Sebelumnya (❌ Error):**
- Coba load worker dari CDN dengan ES module import
- Bundler menambahkan `?import` query string
- CDN protocol-relative URL tidak compatible
- Error: "error loading dynamically imported module"

**Sekarang (✅ Works):**
- Worker di-serve langsung dari `public/` folder
- Tidak di-bundling atau di-import sebagai module
- Loaded sebagai static asset
- Reliabel & tidak ada CORS issues

---

## 📝 Recap

**File yang sudah di-update:**
- ✅ `lib/pdfUtil.ts` - Worker setup perbaikan
- ✅ `components/ui/PDFPreviewCard.tsx` - Better fallback buttons
- ✅ `data/portfolio.ts` - ACHIEVEMENTS data (hanya 5 items)

**Step yang perlu dilakukan:**
1. Copy `pdf.worker.min.js` ke `public/` folder
2. Jalankan `npm run dev`
3. Test di http://localhost:3000
4. Check console untuk confirm sukses

---

## 🎯 Expected Behavior

✅ Preview image loading + muncul sebagai background  
✅ Download button bekerja  
✅ No console errors (atau warning saja)  
✅ Fallback "Buka" button jika preview gagal (tetap bisa digunakan)  
✅ All 5 certificates dapat di-download  

**Semua OK? Success! 🎉**
