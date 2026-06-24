# Open Bugs

## BUG-002 - Load project gagal

Status: Fixed
Priority: Critical

Steps:
1. Buat Project baru
2. Tambahkan Shape
3. Save
4. Kembali ke Dashboard
5. Masuk ke project yang tadi disave

Expected:
Shape yang sebelumnya ditambahkan muncul kembali di canvas

Actual:
Canvas kosong

Notes:
Jika cek data pada table *projects*, *canvas_state* tersimpan.

## BUG-001 - Element tidak bisa diklik ketika sudah masuk ke canvas

Status: Done
Priority: Critical

Steps:
1. Buat Project baru
2. Tambahkan Shape
3. Klik area canvas kosong
4. Klik Shape yang tadi dibuat

Expected:
Shape bisa diklik dan muncul titik-titik untuk resize, dan ketika Shape di drag ikut pindah.

Actual:
Shape ketika diklik tidak terjadi apa-apa

Notes:
Sepertinya area klik Shape tidak sejajar dengan area yang tampil.