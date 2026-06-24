# Product Requirements Document (PRD)
## Canvas UI & Color Manager

### 1. Overview & Goals
**Canvas UI & Color Manager** adalah aplikasi web berbasis browser yang berfungsi sebagai sandbox desain untuk membuat mockup UI mobile secara cepat tanpa perlu menulis kode Android. Aplikasi ini berfokus pada kebebasan mendesain secara visual menggunakan kanvas dengan koordinat absolut dan manajemen warna berbasis Material 3 Color Tokens. 

Tujuan utama dari aplikasi ini adalah mempermudah transisi desain warna dari mockup visual ke kode Jetpack Compose.

---

### 2. User Stories

#### 2.1 Project Management
* **Sebagai** seorang Designer/Developer, **saya ingin** membuat project baru dengan memberikan nama dan memilih Color Pack yang sesuai, **sehingga** saya dapat memulai proses desain mockup menggunakan warna dari palet tersebut.
* **Sebagai** seorang Designer/Developer, **saya ingin** melihat daftar project yang telah saya buat di dashboard, **sehingga** saya bisa membuka kembali project tersebut atau menghapusnya jika sudah tidak diperlukan.
* **Sebagai** seorang Designer/Developer, **saya ingin** mengganti Color Pack yang dihubungkan ke project saya kapan saja, **sehingga** visual kanvas langsung memperbarui penampilannya menggunakan palet warna baru dari Color Pack terpilih.
* **Sebagai** seorang Designer/Developer, **saya ingin** perubahan yang saya lakukan di kanvas tersimpan secara otomatis atau manual dengan handal, **sehingga** saya tidak kehilangan progres.

#### 2.2 Canvas & Component Manipulation
* **Sebagai** seorang Designer/Developer, **saya ingin** menambahkan komponen bentuk (Shape) seperti Rectangle (dengan radius border yang dapat diatur) dan Circle ke dalam kanvas, **sehingga** saya dapat merepresentasikan elemen UI seperti tombol, kartu, dan avatar.
* **Sebagai** seorang Designer/Developer, **saya ingin** menambahkan komponen Text dengan pengaturan ukuran, ketebalan, jarak antar huruf (letter spacing), dan tinggi baris (line height) ke dalam kanvas, **sehingga** saya dapat membuat mockup teks/label yang realistis.
* **Sebagai** seorang Designer/Developer, **saya ingin** menggeser, memutar (rotate), mengatur opacity, dan mengubah ukuran komponen secara visual atau melalui Properties Panel, **sehingga** tata letak mockup presisi.
* **Sebagai** seorang Designer/Developer, **saya ingin** mengatur urutan tumpukan komponen (Z-Index / Layer Order) seperti membawa ke depan (*Bring to Front*), mengirim ke belakang (*Send to Back*), **sehingga** elemen overlap dapat ditampilkan dengan benar.
* **Sebagai** seorang Designer/Developer, **saya ingin** mengubah nama layer komponen, **sehingga** saya dapat mengorganisasi struktur kanvas dengan lebih rapi.

#### 2.3 Color Binding & Theme System
* **Sebagai** seorang Designer/Developer, **saya ingin** menghubungkan warna Fill Shape dan warna Text ke token warna Material 3 dari Color Pack yang aktif (bukan Hex hardcode), **sehingga** ketika token warna diubah, semua komponen yang terikat dalam project akan ter-update secara otomatis.
* **Sebagai** seorang Designer/Developer, **saya ingin** mengaktifkan toggle Light/Dark Mode di kanvas secara realtime, **sehingga** saya bisa mengevaluasi tampilan mockup di kedua mode warna tersebut secara langsung tanpa memuat ulang halaman.

#### 2.4 Export Features
* **Sebagai** seorang Developer, **saya ingin** mengekspor visual kanvas aktif menjadi file PNG sesuai dengan dimensi mockup, **sehingga** saya dapat membagikannya kepada tim atau klien.
* **Sebagai** seorang Android Developer, **saya ingin** mengekspor konfigurasi Color Pack yang terhubung ke project menjadi file Kotlin (`Color.kt`) yang siap pakai untuk Jetpack Compose, **sehingga** saya tidak perlu menyalin kode Hex secara manual satu per satu.

#### 2.5 Color Pack Management
* **Sebagai** seorang Designer/Developer, **saya ingin** membuat Color Pack baru berisi daftar token warna Material 3 global beserta nilai Hex-nya untuk varian Light dan Dark Mode, **sehingga** saya memiliki palet warna baru yang dapat digunakan oleh banyak project.
* **Sebagai** seorang Designer/Developer, **saya ingin** melihat daftar seluruh Color Pack yang tersedia di dashboard, **sehingga** saya bisa mengelola palet warna secara global.
* **Sebagai** seorang Designer/Developer, **saya ingin** mengedit nama dan nilai token warna di dalam Color Pack global, **sehingga** seluruh project yang menggunakan Color Pack tersebut langsung berganti warna secara otomatis sesuai perubahan terbaru.
* **Sebagai** seorang Designer/Developer, **saya ingin** menghapus Color Pack yang tidak terpakai, **sehingga** daftar palet warna tetap bersih dan rapi.
* **Sebagai** seorang Designer/Developer, **saya ingin** memilih salah satu Color Pack dari daftar saat membuat project baru, **sehingga** project langsung terhubung ke palet warna tersebut.

---

### 3. Business Rules

#### 3.1 Shared Color Pack Strategy
* **Single Source of Truth**: Color Pack adalah entitas global yang mandiri dan digunakan bersama oleh banyak project secara bersamaan. Tidak ada mekanisme penyalinan data (*copy/snapshot*) atau penyimpanan warna secara terpisah di dalam project.
* **Relasi Referensi**: Setiap project hanya menyimpan referensi berupa `color_pack_id`.
* **Efek Perubahan Instan**: Karena Color Pack bersifat bersama (*shared*), segala perubahan pada nilai Hex warna token di dalam suatu Color Pack akan langsung berdampak secara realtime pada seluruh project yang terhubung ke Color Pack tersebut.
* **Kemudahan Pergantian Palet**: User dapat mengganti Color Pack yang digunakan oleh sebuah Project kapan saja melalui penyesuaian `color_pack_id`. Perubahan ini akan langsung mengganti skema warna rendering kanvas secara keseluruhan tanpa mekanisme penggabungan (*merge*) warna.
* **Aturan Penghapusan**: Sistem menolak penghapusan Color Pack global apabila masih ada project aktif yang merujuk/menggunakan `color_pack_id` dari Color Pack tersebut (`RESTRICT`).

---

### 4. Acceptance Criteria

#### 4.1 Project & Persistence Criteria
* **AC 4.1.1**: Form pembuatan project harus memvalidasi nama project (tidak boleh kosong) dan mewajibkan pemilihan satu Color Pack yang tersedia.
* **AC 4.1.2**: Database project tidak boleh menduplikasi token warna. Project hanya menyimpan referensi foreign key `color_pack_id` dan memuat data warna langsung dari tabel token warna terkait.
* **AC 4.1.3**: Saat memuat ulang (reload) atau membuka kembali project dari dashboard, seluruh state kanvas beserta nilai token warna dari Color Pack yang terhubung harus dikembalikan ke kondisi terakhir.
* **AC 4.1.4**: Editor harus menyediakan opsi bagi user untuk mengganti Color Pack yang terhubung ke project aktif. Saat diganti, referensi `color_pack_id` pada project diperbarui dan warna komponen langsung menyesuaikan.
* **AC 4.1.5**: Penghapusan project tidak boleh menghapus Color Pack yang terikat dengannya di database (Color Pack bersifat reusable untuk project lain).

#### 4.2 Canvas & Component Manipulation Criteria
* **AC 4.2.1**: Kanvas memiliki ukuran statis 1200px x 1200px dengan rasio mobile portrait (rendering di dalam box penampung berskala).
* **AC 4.2.2**: Komponen Rectangle harus mendukung konfigurasi radius sudut secara independen pada keempat sudutnya (Top Left, Top Right, Bottom Left, Bottom Right).
* **AC 4.2.3**: Perubahan koordinat (X, Y), ukuran (Width, Height), rotasi, dan opacity di Properties Panel harus langsung ter-update di kanvas (dua arah/two-way binding).
* **AC 4.2.4**: Perubahan urutan layer di Layer Panel harus secara instan mengubah visual z-index di kanvas. Fitur penataan meliputi: *Bring to Front*, *Bring Forward*, *Send Backward*, *Send to Back*.

#### 4.3 Color Binding & Theme System Criteria
* **AC 4.3.1**: Pilihan warna pada Properties Panel komponen tidak menyediakan color picker Hex biasa, melainkan drop-down berisi daftar token warna Material 3 dari Color Pack yang aktif terhubung pada project.
* **AC 4.3.2**: Ketika salah satu nilai warna Hex pada token Color Pack diubah oleh user, semua komponen di kanvas dari seluruh project yang menggunakan Color Pack tersebut harus langsung berganti warna secara realtime.
* **AC 4.3.3**: Toggle Light/Dark mode harus mengubah rendering visual warna komponen berdasarkan varian (Light/Dark) dari token yang terikat secara instan tanpa reload halaman browser.

#### 4.4 Export Criteria
* **AC 4.4.1**: Ekspor PNG harus menghasilkan file gambar dengan resolusi sesuai ukuran kanvas (1200px x 1200px) dan mencerminkan status kanvas terkini (termasuk mode Light/Dark yang aktif).
* **AC 4.4.2**: Ekspor `Color.kt` harus menghasilkan file teks Kotlin dengan sintaks Jetpack Compose yang valid berdasarkan nilai token dari Color Pack yang aktif terhubung.

#### 4.5 Color Pack Management Criteria
* **AC 4.5.1**: Dashboard/Editor menyediakan antarmuka manajemen untuk membuat, melihat, memperbarui (edit nama & nilai token warna), dan menghapus Color Pack global.
* **AC 4.5.2**: Pengeditan Color Pack global akan langsung merefleksikan perubahan warna pada seluruh project aktif yang menggunakan Color Pack tersebut.
* **AC 4.5.3**: Sistem harus mencegah penghapusan Color Pack yang masih digunakan oleh minimal satu project (kembalikan error dan infokan dependency).
* **AC 4.5.4**: Sistem harus mencegah penghapusan Color Pack bawaan (default template) yang disediakan oleh aplikasi sebagai palet standar Material 3.

---

### 5. MVP Scope

Aplikasi MVP harus mencakup modul-modul berikut:
1. **Dashboard Project**:
   - List, Create, Delete Project.
   - Peta inisialisasi Project dari Color Pack global.
2. **Canvas Editor**:
   - Canvas area (statis, absolute positioning).
   - Component insertion (Rectangle, Circle, Text).
   - Layer Panel (list, rename, reorder/z-index).
   - Properties Panel (koordinat, dimensi, teks, radius sudut, opacity, color token binding).
   - Pilihan Color Pack switcher (untuk mengganti Color Pack yang terikat pada project aktif).
3. **Color Pack Manager**:
   - CRUD Color Pack global & token warna Material 3 (Light & Dark variant per token).
4. **Light/Dark Toggle**:
   - Pengubah mode visual kanvas secara realtime.
5. **Export Engine**:
   - PNG exporter.
   - Kotlin file (`Color.kt`) exporter.
6. **Persistence Layer**:
   - Backend Go REST API + PostgreSQL untuk menyimpan Project State & Color Packs global.

---

### 6. Non-MVP Scope (Out of Scope)

Fitur-fitur berikut secara eksplisit **tidak** dimasukkan ke dalam rilis MVP:
* **Auto Layout / Constraint Layout / Flexbox**: Canvas hanya mendukung absolute positioning.
* **Responsive Layout**: Canvas berukuran tetap (statis).
* **Multi-Screen Design**: Satu project hanya memiliki satu kanvas/layar.
* **Collaborative Editing / Realtime Multi-User**: Tidak ada sinkronisasi edit antar pengguna.
* **Version History / Undo-Redo Stack**: Tidak ada riwayat revisi (disimpan sebagai state terbaru saja).
* **Animation & Transitions**: Mockup murni bersifat statis.
* **Component Grouping**: Tidak ada fitur grouping layer (seperti folder layer).
* **Custom Font Upload**: Hanya menggunakan font sistem bawaan.
* **Android XML / Compose Layout UI Export**: Hanya mengekspor konfigurasi warna (`Color.kt`), bukan struktur tata letak UI Compose.
