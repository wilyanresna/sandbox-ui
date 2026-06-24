# Canvas UI & Color Manager

## Overview

Canvas UI & Color Manager adalah aplikasi web berbasis browser yang berfungsi sebagai sandbox desain untuk membuat mockup UI mobile secara cepat tanpa perlu menulis kode Android.

Fokus utama aplikasi adalah:

* Kebebasan menyusun komponen secara visual menggunakan kanvas.
* Manajemen warna berbasis Material 3 Color Tokens.
* Penyimpanan state proyek agar dapat dilanjutkan kapan saja.
* Ekspor hasil desain menjadi PNG.
* Ekspor konfigurasi warna menjadi file Kotlin (`Color.kt`) yang siap digunakan pada Jetpack Compose.

Aplikasi ini bukan editor Android XML, bukan editor Compose, dan bukan layout builder yang mengikuti aturan Android. Semua komponen ditempatkan secara bebas menggunakan koordinat absolut.

---

# Goals

## Primary Goals

1. Membuat mockup UI mobile dengan cepat.
2. Mengelola Color Pack Material 3.
3. Melihat perubahan Light Mode dan Dark Mode secara realtime.
4. Menyimpan seluruh state desain ke database.
5. Mengekspor hasil desain dan konfigurasi warna.

## Non Goals (MVP)

Fitur berikut tidak termasuk dalam MVP:

* Auto Layout
* Constraint Layout
* Responsive Layout
* Multi Screen Design
* Collaborative Editing
* Version History
* Animation
* Component Grouping
* Custom Font Upload
* Android XML Export
* Jetpack Compose UI Export

---

# Core Concepts

## Project

Project adalah unit kerja utama.

Setiap project memiliki:

* ID
* Nama Project
* Created At
* Updated At
* Color Pack yang digunakan
* State Kanvas

State kanvas harus tersimpan penuh sehingga project dapat dibuka kembali tanpa kehilangan posisi dan konfigurasi komponen.

---

## Color Pack

Color Pack adalah kumpulan token warna Material 3.

Setiap token memiliki:

* Light Variant
* Dark Variant

Contoh:

Primary
OnPrimary
PrimaryContainer
OnPrimaryContainer

Secondary
OnSecondary

Tertiary
OnTertiary

Background
OnBackground

Surface
OnSurface

SurfaceVariant
OnSurfaceVariant

Error
OnError

dst mengikuti standar Material 3.

Color Pack dapat digunakan oleh banyak project.

---

## Canvas

Canvas adalah area desain utama.

Spesifikasi awal:

* Rasio mobile portrait
* Default width: 1200px
* Default height: 1200px

Canvas bersifat statis dan tidak responsive.

Semua komponen menggunakan absolute positioning.

Contoh:

x = 120
y = 300

Tidak ada sistem:

* Row
* Column
* Constraint
* Flex Layout

---

# Features

## Project Dashboard

Dashboard menampilkan:

* Create Project
* Open Project
* Delete Project

Saat membuat project baru:

1. User memasukkan nama project.
2. User memilih Color Pack.
3. Project dibuat dan masuk ke editor.

---

## Canvas Editor

Editor terdiri dari:

### Canvas Area

Menampilkan desain aktif.

### Layer Panel

Menampilkan seluruh komponen pada kanvas.

Fungsi:

* Select Layer
* Rename Layer
* Bring To Front
* Send To Back

### Properties Panel

Menampilkan properti komponen yang sedang dipilih.

---

## Primitive Components

### Shape

Jenis:

* Rectangle
* Circle

Property:

* Position X
* Position Y
* Width
* Height
* Rotation
* Opacity
* Fill Color Token

Untuk Rectangle:

* Top Left Radius
* Top Right Radius
* Bottom Left Radius
* Bottom Right Radius

---

### Text

Property:

* Position X
* Position Y
* Text Content
* Font Size
* Font Weight
* Font Style
* Text Color Token
* Letter Spacing
* Line Height
* Opacity

---

# Layering System

Semua komponen memiliki:

* Layer ID
* Z Index

Komponen dapat saling overlap.

User dapat mengubah urutan layer menggunakan:

* Bring To Front
* Bring Forward
* Send Backward
* Send To Back

Render harus mengikuti urutan Z Index.

---

# Color Binding System

Komponen tidak boleh menggunakan Hex Color langsung.

Setiap warna harus terhubung ke Material 3 Token.

Contoh:

Shape A
Fill Color → Primary

Text B
Text Color → OnPrimary

Saat token berubah:

Semua komponen yang menggunakan token tersebut harus ikut berubah otomatis.

---

# Light/Dark Mode Toggle

Editor memiliki toggle:

* Light Mode
* Dark Mode

Saat mode berubah:

1. Sistem mengambil variant warna yang sesuai dari Color Pack.
2. Semua komponen di-refresh.
3. Warna seluruh kanvas berubah secara realtime.

Tidak perlu reload halaman.

---

# Export Features

## Export PNG

Menghasilkan gambar dari tampilan kanvas saat ini.

Persyaratan:

* Mengikuti ukuran kanvas.
* Mengikuti layer order.
* Mengikuti mode aktif.
* Hasil sesuai preview.

---

## Export Color.kt

Menghasilkan file Kotlin untuk Jetpack Compose.

Contoh output:

```kotlin
val md_theme_light_primary = Color(0xFF6750A4)
val md_theme_light_onPrimary = Color(0xFFFFFFFF)

val md_theme_dark_primary = Color(0xFFD0BCFF)
val md_theme_dark_onPrimary = Color(0xFF381E72)
```

Format harus kompatibel dengan Material 3 Compose Theme.

---

# Persistence Requirements

Semua perubahan berikut harus tersimpan:

* Project Metadata
* Selected Color Pack
* Canvas State
* Layer Order
* Shape Properties
* Text Properties

Saat project dibuka kembali:

State harus identik dengan kondisi terakhir sebelum disimpan.

---

# Suggested Tech Stack

Frontend

* React
* TypeScript
* Vite

Canvas

* Konva.js atau Fabric.js

State Management

* Zustand

Backend

* Go

Database

* PostgreSQL

ORM

* GORM

API

* REST API

---

# Development Principles

* KISS (Keep It Simple)
* MVP First
* Clean Architecture
* Strong Type Safety
* Reusable Components
* Separation Between UI State and Persistence State

---

# Success Criteria

MVP dianggap selesai apabila:

1. User dapat membuat project.
2. User dapat membuka project yang tersimpan.
3. User dapat menambahkan Shape.
4. User dapat menambahkan Text.
5. User dapat mengatur posisi komponen.
6. User dapat mengatur Z Index.
7. User dapat membuat dan memilih Color Pack.
8. User dapat toggle Light/Dark Mode.
9. User dapat export PNG.
10. User dapat export Color.kt.
11. Seluruh state tersimpan dan dapat dipulihkan dengan akurat.
