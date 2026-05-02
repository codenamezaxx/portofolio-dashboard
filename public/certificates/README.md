# Sertifikat PDFs

Letakkan file-file sertifikat PDF Anda di folder ini dengan nama:
- `cert-1.pdf`
- `cert-2.pdf`
- `cert-3.pdf`
- `cert-4.pdf`
- `cert-5.pdf`
- `cert-6.pdf`

## Cara kerja fitur ini:

1. **PDF Preview**: Halaman pertama dari setiap PDF akan dirender dan ditampilkan sebagai background pada card achievement
2. **Download**: Pengunjung dapat mengklik tombol "Download PDF" untuk mengunduh sertifikat
3. **Automatic Rendering**: Sistem menggunakan pdfjs-dist untuk automatic render PDF ke canvas

## Setup:

1. Pastikan sudah install dependency dengan menjalankan:
   ```bash
   npm install
   ```

2. Letakkan file PDF sertifikat Anda di folder ini

3. File akan otomatis diproses ketika halaman dimuat

## Catatan:

- Pastikan file PDF bersifat **public** dan tidak sensitif
- File PDF harus dalam format yang valid dan readable
- Rendering pertama kali mungkin memakan waktu beberapa detik
