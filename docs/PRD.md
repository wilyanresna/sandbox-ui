# Product Requirements Document (PRD)
## Canvas UI & Color Manager

### 1. Overview & Goals
**Canvas UI & Color Manager** adalah aplikasi web berbasis browser yang berfungsi sebagai sandbox desain untuk membuat mockup UI mobile secara cepat tanpa perlu menulis kode Android. Aplikasi ini berfokus pada kebebasan mendesain secara visual menggunakan kanvas dengan koordinat absolut dan manajemen warna berbasis Material 3 Color Tokens. 

Tujuan utama dari aplikasi ini adalah mempermudah transisi desain warna dari mockup visual ke kode Jetpack Compose.

---

### 2. User Stories

#### 2.1 Project Management
* **Sebagai** seorang Designer/Developer, **saya ingin** dapat membuat project baru dengan memberikan nama dan memilih Color Pack Template yang sesuai, **sehingga** seluruh token warna dari Color Pack tersebut disalin (snapshot) secara independen ke dalam project saya untuk memulai desain.
* **Sebagai** seorang Designer/Developer, **saya ingin** melihat daftar project yang telah saya buat di dashboard, **sehingga** saya bisa membuka kembali project tersebut atau menghapusnya jika sudah tidak diperlukan.
* **Sebagai** seorang Designer/Developer, **saya ingin** perubahan yang saya lakukan di kanvas beserta modifikasi warna token lokal project tersimpan secara otomatis atau manual dengan handal, **sehingga** saya tidak kehilangan progres.

#### 2.2 Canvas & Component Manipulation
* **Sebagai** seorang Designer/Developer, **saya ingin** menambahkan komponen bentuk (Shape) seperti Rectangle (dengan radius border yang dapat diatur) dan Circle ke dalam kanvas, **sehingga** saya dapat merepresentasikan elemen UI seperti tombol, kartu, dan avatar.
* **Sebagai** seorang Designer/Developer, **saya ingin** menambahkan komponen Text dengan pengaturan ukuran, ketebalan, jarak antar huruf (letter spacing), dan tinggi baris (line height) ke dalam kanvas, **sehingga** saya dapat membuat mockup teks/label yang realistis.
* **Sebagai** seorang Designer/Developer, **saya ingin** menggeser, memutar (rotate), mengatur opacity, dan mengubah ukuran komponen secara visual atau melalui Properties Panel, **sehingga** tata letak mockup presisi.
* **Sebagai** seorang Designer/Developer, **saya ingin** mengatur urutan tumpukan komponen (Z-Index / Layer Order) seperti membawa ke depan (*Bring to Front*), mengirim ke belakang (*Send to Back*), **sehingga** elemen overlap dapat ditampilkan dengan benar.
* **Sebagai** seorang Designer/Developer, **saya ingin** mengubah nama layer komponen, **sehingga** saya dapat mengorganisasi struktur kanvas dengan lebih rapi.

#### 2.3 Color Binding & Theme System
* **Sebagai** seorang Designer/Developer, **saya ingin** menghubungkan warna Fill Shape dan warna Text ke token warna lokal project (bukan Hex hardcode), **sehingga** ketika token warna lokal diubah, semua komponen yang terikat dalam project akan ter-update secara otomatis.
* **Sebagai** seorang Designer/Developer, **saya ingin** mengubah nilai warna dari token warna yang terikat pada project saya secara independen, **sehingga** saya dapat menyesuaikan skema warna project tersebut tanpa mengganggu Color Pack asli atau project lainnya.
* **Sebagai** seorang Designer/Developer, **saya ingin** mengaktifkan toggle Light/Dark Mode di kanvas secara realtime, **sehingga** saya bisa mengevaluasi tampilan mockup di kedua mode warna tersebut secara langsung tanpa memuat ulang halaman.

#### 2.4 Export Features
* **Sebagai** seorang Developer, **saya ingin** mengekspor visual kanvas aktif menjadi file PNG sesuai dengan dimensi mockup, **sehingga** saya dapat membagikannya kepada tim atau klien.
* **Sebagai** seorang Android Developer, **saya ingin** mengekspor konfigurasi Color Pack lokal dari project menjadi file Kotlin (`Color.kt`) yang siap pakai untuk Jetpack Compose, **sehingga** saya tidak perlu menyalin kode Hex secara manual satu per satu.

#### 2.5 Color Pack Management
* **Sebagai** seorang Designer/Developer, **saya ingin** membuat Color Pack Template baru berisi daftar token warna Material 3 global beserta nilai Hex-nya untuk varian Light dan Dark Mode, **sehingga** saya memiliki template warna baru untuk project mendatang.
* **Sebagai** seorang Designer/Developer, **saya ingin** melihat daftar seluruh Color Pack Template yang tersedia di dashboard, **sehingga** saya bisa mengelola template warna secara global.
* **Sebagai** seorang Designer/Developer, **saya ingin** mengedit nama dan nilai token warna di dalam Color Pack Template global, **sehingga** template tersebut terus ter-update sesuai kebutuhan desain global saya untuk project masa depan.
* **Sebagai** seorang Designer/Developer, **saya ingin** menghapus Color Pack Template yang tidak terpakai, **sehingga** daftar template warna tetap bersih dan rapi.
* **Sebagai** seorang Designer/Developer, **saya ingin** memilih salah satu Color Pack Template dari daftar saat membuat project baru, **sehingga** project tersebut diinisialisasi dengan palet warna awal dari template tersebut.

---

### 3. Business Rules

#### 3.1 Perbedaan Color Pack Template dan Project Color Pack
* **Color Pack Template (Template Global)**: Kumpulan palet warna Material 3 global yang dikelola di dashboard. Template ini berfungsi murni sebagai blueprint/sumber awal warna ketika membuat project baru dan tidak terikat secara langsung pada rendering canvas project yang sudah berjalan.
* **Project Color Pack (Salinan Lokal)**: Salinan independen dari token warna yang melekat langsung pada satu instance Project. Modifikasi warna di dalam kanvas editor hanya akan mengubah nilai token pada Project Color Pack ini.

#### 3.2 Mekanisme Snapshot saat Pembuatan Project
* Saat project baru dibuat, sistem mengambil seluruh definisi token warna dari Color Pack Template yang dipilih oleh user.
* Semua token warna tersebut (nama token, lightHex, dan darkHex) disalin sebagai snapshot (duplikasi data penuh) dan disimpan langsung di dalam struktur data Project baru tersebut.

#### 3.3 Efek Perubahan Warna
* **Perubahan pada Color Pack Template**: Perubahan nama atau nilai Hex pada Color Pack Template global **tidak akan mempengaruhi** project apa pun yang sudah dibuat sebelumnya. Perubahan tersebut hanya akan tercermin pada project baru yang dibuat setelah waktu modifikasi template.
* **Perubahan pada Project Color Pack**: Modifikasi nilai warna token lokal di dalam editor project hanya mempengaruhi visual komponen di dalam project aktif tersebut dan **tidak akan mengubah** Color Pack Template global asalnya maupun project lainnya.

#### 3.4 Independensi Penyimpanan
* Setiap project menyimpan skema warna lokalnya sendiri secara mandiri.
* Penghapusan suatu Color Pack Template global tidak akan memengaruhi atau merusak project yang menggunakan template tersebut saat pembuatannya, karena project tidak lagi merujuk pada template global melainkan menggunakan salinan lokalnya.

---

### 4. Acceptance Criteria

#### 4.1 Project & Persistence Criteria
* **AC 4.1.1**: Form pembuatan project harus memvalidasi nama project (tidak boleh kosong) dan mewajibkan pemilihan satu Color Pack Template dari daftar template yang tersedia.
* **AC 4.1.2**: Saat membuat project baru, sistem harus menduplikasi (snapshot) seluruh daftar token warna dari Color Pack Template terpilih ke dalam database project baru tersebut sebagai Project Color Pack lokal.
* **AC 4.1.3**: Saat memuat ulang (reload) atau membuka kembali project dari dashboard, seluruh state kanvas beserta nilai token warna lokal harus dikembalikan secara presisi ke kondisi terakhir yang disimpan di database project.
* **AC 4.1.4**: Penghapusan project harus menghapus data project beserta Project Color Pack lokalnya, namun **tidak** menghapus Color Pack Template global yang menjadi sumber awal pembuatannya.

#### 4.2 Canvas & Component Manipulation Criteria
* **AC 4.2.1**: Kanvas memiliki ukuran statis 1200px x 1200px dengan rasio mobile portrait (rendering di dalam box penampung berskala).
* **AC 4.2.2**: Komponen Rectangle harus mendukung konfigurasi radius sudut secara independen pada keempat sudutnya (Top Left, Top Right, Bottom Left, Bottom Right).
* **AC 4.2.3**: Perubahan koordinat (X, Y), ukuran (Width, Height), rotasi, dan opacity di Properties Panel harus langsung ter-update di kanvas (dua arah/two-way binding).
* **AC 4.2.4**: Perubahan urutan layer di Layer Panel harus secara instan mengubah visual z-index di kanvas. Fitur penataan meliputi: *Bring to Front*, *Bring Forward*, *Send Backward*, *Send to Back*.

#### 4.3 Color Binding & Theme System Criteria
* **AC 4.3.1**: Pilihan warna pada Properties Panel komponen tidak menyediakan color picker Hex biasa, melainkan drop-down berisi daftar token warna Material 3 dari Project Color Pack lokal milik project yang aktif.
* **AC 4.3.2**: Ketika salah satu nilai warna Hex pada token Project Color Pack lokal diubah oleh user, semua komponen di kanvas yang terikat ke token tersebut harus langsung berganti warna secara realtime.
* **AC 4.3.3**: Toggle Light/Dark mode harus mengubah rendering visual warna komponen berdasarkan varian (Light/Dark) dari token lokal yang terikat secara instan tanpa reload halaman browser.

#### 4.4 Export Criteria
* **AC 4.4.1**: Ekspor PNG harus menghasilkan file gambar dengan resolusi sesuai ukuran kanvas (1200px x 1200px) dan mencerminkan status kanvas terkini (termasuk mode Light/Dark yang aktif).
* **AC 4.4.2**: Ekspor `Color.kt` harus menghasilkan file teks Kotlin dengan sintaks Jetpack Compose yang valid berdasarkan nilai token dari Project Color Pack lokal aktif.

#### 4.5 Color Pack Management Criteria
* **AC 4.5.1**: Dashboard harus menyediakan antarmuka manajemen untuk membuat, melihat, memperbarui (edit nama & nilai token warna), dan menghapus Color Pack Template global.
* **AC 4.5.2**: Pengeditan Color Pack Template global hanya berlaku untuk inisialisasi project yang akan dibuat di masa mendatang dan tidak boleh mengubah data warna project yang sudah ada.
* **AC 4.5.3**: Sistem harus mencegah penghapusan Color Pack Template bawaan (default template) yang disediakan oleh aplikasi sebagai palet standar Material 3.

---

### 5. MVP Scope

Aplikasi MVP harus mencakup modul-modul berikut:
1. **Dashboard Project**:
   - List, Create, Delete Project.
   - Peta inisialisasi Project dari Color Pack Template.
2. **Canvas Editor**:
   - Canvas area (statis, absolute positioning).
   - Component insertion (Rectangle, Circle, Text).
   - Layer Panel (list, rename, reorder/z-index).
   - Properties Panel (koordinat, dimensi, teks, radius sudut, opacity, color token binding).
   - Local Color Pack Editor (mengedit nilai token warna khusus untuk project aktif).
3. **Color Pack Manager**:
   - CRUD Color Pack Template global & token warna Material 3 (Light & Dark variant per token).
4. **Light/Dark Toggle**:
   - Pengubah mode visual kanvas secara realtime.
5. **Export Engine**:
   - PNG exporter.
   - Kotlin file (`Color.kt`) exporter.
6. **Persistence Layer**:
   - Backend Go REST API + PostgreSQL untuk menyimpan Project State (termasuk snapshot Project Color Pack lokal) & Color Pack Templates global.

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
