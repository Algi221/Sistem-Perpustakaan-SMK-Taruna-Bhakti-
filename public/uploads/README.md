# Uploads Folder

Folder ini berisi file-file yang diupload oleh user melalui aplikasi.

## Struktur

- Profile images dari user akan disimpan langsung di folder `uploads/`
- Format nama file: `profile_<user_id>_<timestamp>.<ext>`

## Catatan

- Folder ini akan dibuat otomatis oleh aplikasi jika belum ada
- File di folder ini dapat diakses melalui URL: `/uploads/<filename>`
- Pastikan folder ini memiliki permission write yang sesuai

