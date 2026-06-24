# Task Breakdown & Priority Guide (TASKS.md)
## Canvas UI & Color Manager

Dokumen ini memetakan seluruh pekerjaan implementasi untuk proyek **Canvas UI & Color Manager** ke dalam tugas-tugas terperinci. Tugas diurutkan secara hierarkis berdasarkan dependensi logis dan prioritas dari fondasi hingga fitur ekspor. Dokumen ini disesuaikan dengan **Shared Color Pack Strategy** di mana warna dikelola secara terpusat dan dinamis.

---

### **Milestone 1: Database & Backend Foundation (Prioritas 1 - Kritis) [COMPLETED]**
Membangun fondasi data dan REST API agar frontend dapat langsung berinteraksi dengan sistem penyimpanan state.

- [x] **Task 1.1: Database Setup & Migration**
  - Mengonfigurasi instance database PostgreSQL.
  - Menulis script inisiasi tabel (`projects`, `color_packs`, `color_tokens`) dengan GORM AutoMigrate di Go.
  - Mengatur foreign key `color_pack_id` pada tabel `projects` dengan constraint `ON DELETE RESTRICT`.
  - Mempersiapkan seeding awal untuk satu default Color Pack (Material 3 Default Palette).
- [x] **Task 1.2: Struct & Domain Model Go**
  - Membuat file domain model untuk `Project`, `ColorPack`, dan `ColorToken` lengkap dengan tag GORM dan JSON.
- [x] **Task 1.3: Repository Layer Implementation**
  - Implementasi CRUD untuk Color Pack di repository layer (`colorpack/repository`).
  - Implementasi CRUD untuk Project di repository layer (`project/repository`).
- [x] **Task 1.4: Usecase Layer Implementation**
  - Implementasi business logic (misal: validasi ketersediaan Color Pack sebelum project dibuat, serta validasi untuk menolak penghapusan Color Pack yang masih dirujuk oleh project aktif).
- [x] **Task 1.5: REST API Handlers & Routing**
  - Setup routing engine HTTP (Gin Gonic).
  - Implementasi handler endpoint GET/POST/PUT/DELETE untuk `/api/color-packs`.
  - Implementasi handler endpoint GET/POST/PUT/DELETE untuk `/api/projects`.
  - Menulis Middleware CORS untuk integrasi frontend.

---

### **Milestone 2: Frontend Setup & State Management (Prioritas 2 - Kritis) [COMPLETED]**
Menyusun kerangka aplikasi frontend dan mendefinisikan single source of truth untuk data project dan kanvas.

- [x] **Task 2.1: Vite & React Setup**
  - Inisialisasi proyek Frontend menggunakan Vite + React + TypeScript.
  - Konfigurasi router menggunakan React Router (atau setup UI conditional rendering jika single-page dashboard-editor).
  - Integrasi library utama: `zustand` dan `react-konva`.
- [x] **Task 2.2: CSS Global & Design System**
  - Membuat `index.css` yang mendefinisikan layout dasar, reset CSS, dan skema warna gelap default untuk antarmuka editor (IDE-style).
- [x] **Task 2.3: Type Safety Definitions**
  - Membuat file deklarasi type TypeScript (`types.ts`) berisi interface `CanvasComponent`, `ShapeComponent`, `TextComponent`, `ColorToken`, dan `ColorPack`.
- [x] **Task 2.4: Zustand Store - Project Store**
  - Implementasi `useProjectStore` untuk menampung data project aktif, list projects, dan list color packs dari API.
- [x] **Task 2.5: Zustand Store - Canvas Store**
  - Implementasi `useCanvasStore` dengan actions dasar: `addComponent`, `updateComponent`, `deleteComponent`, `loadCanvasState`, `setColorPackId` (untuk mengganti asosiasi Color Pack), `setThemeMode`, dan penanda `isDirty`.

---

### **Milestone 3: Project Dashboard UI (Prioritas 3 - Tinggi) [COMPLETED]**
Membuat entry point bagi user untuk mengelola berkas project mereka.

- [x] **Task 3.1: Dashboard Layout & Styling**
  - Mendesain UI grid dashboard dengan gaya modern.
- [x] **Task 3.2: Project List Fetching**
  - Integrasi `useProjectStore` untuk menampilkan kartu project (nama, info tanggal update, nama Color Pack yang dirujuk).
- [x] **Task 3.3: Create Project Modal**
  - Membuat form pop-up untuk membuat project baru (input nama project dan dropdown pilihan Color Pack global yang bersumber dari API).
- [x] **Task 3.4: Delete Project Action**
  - Menambahkan tombol hapus project dengan dialog konfirmasi sebelum API dipanggil.

---

### **Milestone 4: Canvas Area & Layer System (Prioritas 4 - Tinggi) [COMPLETED]**
Mengembangkan visualisasi kanvas utama dan sistem tumpukan komponen (layering).

- [x] **Task 4.1: Konva Stage Integration**
  - Membuat komponen `CanvasArea` berukuran tetap (1200px x 1200px) di dalam wadah responsif berskala (CSS scale).
- [x] **Task 4.2: Component Rendering Loop**
  - Membuat renderer dinamis yang membaca array `components` dari Zustand dan merender shape (`react-konva.Rect`, `react-konva.Circle`) atau teks (`react-konva.Text`) sesuai dengan tipenya.
- [x] **Task 4.3: Drag and Drop & Drag-End Handler**
  - Mengaktifkan properti `draggable` pada elemen Konva dan menulis handler untuk meng-update properti X & Y di Zustand Store ketika selesai digeser.
- [x] **Task 4.4: Selection Transformer**
  - Mengintegrasikan `react-konva.Transformer` agar ketika suatu komponen diklik, muncul bounding box untuk memutar (rotate) dan mengubah ukuran (resize).
- [x] **Task 4.5: Layer Panel & Renaming**
  - Membuat sidebar kiri yang menampilkan list komponen.
  - Implementasi drag-reorder atau tombol urutan (*Bring to Front*, *Bring Forward*, *Send Backward*, *Send to Back*) yang memanipulasi z-index/urutan array komponen.
  - Menambahkan opsi edit nama layer secara inline.

---

### **Milestone 5: Properties Panel & Color Binding (Prioritas 5 - Sedang) [COMPLETED]**
Menghubungkan visual komponen dengan properti terperinci dan token warna Material 3.

- [x] **Task 5.1: Properties Inputs Form**
  - Membuat sidebar kanan untuk input detail komponen yang sedang aktif (X, Y, Width, Height, Rotation, Opacity).
  - Khusus Rectangle: Menambahkan input untuk empat penjuru Border Radius.
  - Khusus Text: Menambahkan textarea konten teks, input Font Size, Font Weight, Font Style, Letter Spacing, dan Line Height.
- [x] **Task 5.2: Color Token Selector**
  - Membuat input drop-down untuk properti Fill Color (Shape) dan Text Color (Text).
  - Dropdown harus diisi dengan daftar nama token warna yang tersedia dalam Color Pack yang terikat pada project tersebut (e.g., `primary`, `onPrimary`, `background`).
- [x] **Task 5.3: Realtime Color Rendering**
  - Menyesuaikan kode render kanvas agar warna fill/teks dibaca secara dinamis dari `useCanvasStore.themeMode` (mengambil `lightHex` jika mode terang, atau `darkHex` jika mode gelap) berdasarkan token yang terikat dari Color Pack global aktif.

---

### **Milestone 6: Color Pack Switcher & Editor (Prioritas 6 - Sedang) [COMPLETED]**
Menyediakan antarmuka bagi pengguna untuk mengganti Color Pack pada project, serta mengelola Color Pack global secara langsung.

- [x] **Task 6.1: Color Pack Selector Switcher di Editor**
  - Menambahkan dropdown di editor (Navbar/Properties Panel) yang memungkinkan user mengganti Color Pack aktif yang terikat pada project. Perubahan ini langsung memperbarui visual kanvas menggunakan token dari Color Pack baru.
- [x] **Task 6.2: Color Pack Management Modal / Route**
  - Membuat antarmuka/modal khusus di dashboard untuk mengelola daftar Color Pack global (CRUD).
- [x] **Task 6.3: Token Color Picker Form**
  - Membuat form baris untuk setiap token Material 3 standar yang menampilkan input warna Hex berdampingan antara Light Mode (lightHex) dan Dark Mode (darkHex) lengkap dengan pemilih warna visual (HTML Color Picker).
- [x] **Task 6.4: Color Token Realtime Updates**
  - Menghubungkan perubahan nilai warna token di form manajemen warna agar secara instan memicu pembaruan warna komponen di kanvas pada seluruh project yang menggunakan referensi Color Pack tersebut.

---

### **Milestone 7: Save & Export Engines (Prioritas 7 - Sedang) [COMPLETED]**
Mengimplementasikan penyimpanan otomatis dan fitur ekspor ke format eksternal.

- [x] **Task 7.1a: Manual Save Mechanism**
  - Mengimplementasikan sinkronisasi state kanvas dan `color_pack_id` terikat ke API backend (PUT `/api/projects/:id`) secara manual via tombol "Save".
- [x] **Task 7.1b: Auto Save Mechanism**
  - Mengimplementasikan sinkronisasi state ke API secara otomatis menggunakan mekanisme auto-debounce (misal, setiap 5 detik setelah ada perubahan terdeteksi).
- [x] **Task 7.2: Export PNG Modul**
  - Menulis utilitas di frontend untuk:
    1. Menghilangkan penanda seleksi (Transformer).
    2. Memanggil `stage.toDataURL()`.
    3. Mengunduh data URL tersebut sebagai file `.png`.
    4. Mengembalikan state penanda seleksi.
- [x] **Task 7.3: Export Color.kt Modul**
  - Menulis utilitas generator string Kotlin yang memetakan token warna dari Color Pack aktif yang terhubung ke project menjadi format ARGB literal Jetpack Compose (`val md_theme_light_primary = Color(0xFF...)`).
  - Mengemas teks menjadi Blob dan memicu download browser untuk berkas `Color.kt`.

---

### **Milestone 8: Testing & Refinement (Prioritas 8 - Rendah)**
Menguji integritas data dan memastikan performa aplikasi kanvas berjalan dengan lancar.

- [ ] **Task 8.1: End-to-End Persistence Validation**
  - Memastikan skenario: Buat project -> Hubungkan ke Color Pack A -> Ubah warna di Color Pack A -> Buka project -> Visual warna ter-update otomatis.
  - Memastikan skenario switch Color Pack: Ganti relasi project ke Color Pack B -> Visual warna langsung berubah -> Simpan -> Muat ulang -> State relasi terpelihara di Color Pack B.
  - Memastikan validasi database: Menolak penghapusan Color Pack yang masih digunakan oleh project aktif.
- [x] **Task 8.2: Performance Tuning**
  - Mengoptimalkan event handler dragging agar tidak memicu render berlebihan di React (update state lokal Konva terlebih dahulu, baru update Zustand di akhir drag / `onDragEnd`).