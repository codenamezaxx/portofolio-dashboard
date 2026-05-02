# ⚡ Git Setup - Quick Commands

## ✅ Status Saat Ini

```bash
# Cek status
git status
# Output: On branch master, nothing to commit

# Cek commit
git log --oneline
# Output: cb65e82 Initial commit: Portfolio website v1.0

# Cek git config
git config --local user.name
# Output: Zakky Ahmad El-Kholily

git config --local user.email
# Output: zakky.ahmad@protonmail.com
```

---

## 🚀 Untuk Push ke GitHub (Pilih Salah Satu)

### **Quick Start - Copy Paste Commands:**

**1. Siapkan repo GitHub:**
   - Buka https://github.com/new
   - Isi form (jangan init dengan file)
   - Copy HTTPS URL: `https://github.com/USERNAME/REPO_NAME.git`

**2. Jalankan command ini di project folder:**

```bash
# Ganti USERNAME dan REPO_NAME dengan punya Anda!
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Verify
git remote -v

# Push (akan minta Personal Access Token)
git push -u origin master
```

**3. Ketika diminta credentials:**
   - Username: masukkan GitHub username
   - Password: paste Personal Access Token (bukan password)
     
   [Buat token di: https://github.com/settings/tokens?type=beta]

---

## 📋 Commands Reference

```bash
# Status
git status
git log --oneline

# Local config
git config --local user.name
git config --local user.email

# Remote
git remote add origin <URL>
git remote -v
git remote remove origin

# Push
git push -u origin master
git push origin master

# Pull
git pull origin master
```

---

## 🎯 Expected Result Setelah Push

✅ Repository muncul di https://github.com/USERNAME/REPO_NAME  
✅ Semua files visible  
✅ Initial commit terlihat di commit history  
✅ Green checkmark di repo  

---

## 📞 Bantuan

1. **GitHub belum punya akun?**
   - Daftar di https://github.com/signup

2. **Lupa repository URL?**
   - Buka https://github.com/new
   - Isi form dan create repo
   - Copy URL dari halaman repo

3. **Lupa cara buat Personal Access Token?**
   - https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

4. **Masih error?**
   - Lihat `GIT_PUSH_GUIDE.md` untuk troubleshooting lengkap

---

## 🔄 Commit History

```
cb65e82 (HEAD -> master) Initial commit: Portfolio website v1.0
```

**Isi commit:**
- 49 files
- Semua source code
- Configuration files
- Documentation
- PDF worker setup
- Certificates
- Resume & assets

---

**Siap push? Execute commands di terminal! 🚀**
