# Helpdesk Ticketing System - Backend (Node.js + Express + MySQL)
PT Bakrie Pipe Industries

## Cara Menjalankan

1. Import database:
   ```
   mysql -u root -p < db/schema.sql
   ```
2. Install dependency:
   ```
   npm install
   ```
3. Copy `.env.example` jadi `.env`, sesuaikan kredensial MySQL & JWT_SECRET.
4. Jalankan:
   ```
   npm start        # atau: npm run dev (pakai nodemon)
   ```
5. API berjalan di `http://localhost:5000`

## PENTING soal password user
Password contoh di `db/schema.sql` adalah hash dummy dan TIDAK BISA dipakai login.
Generate hash asli dulu, contoh via node:
```js
const bcrypt = require('bcryptjs');
bcrypt.hash('password123', 10).then(console.log);
```
Lalu UPDATE kolom `password` di tabel `user` dengan hash tersebut,
atau buat endpoint register terpisah kalau perlu.

## Struktur Fitur -> Endpoint

| # | Fitur | Base Endpoint |
|---|-------|---------------|
| 1 | Login | POST /api/auth/login |
| 2 | Dashboard | GET /api/dashboard/admin \| /teknisi \| /users |
| 3 | List Ticket / New Ticket / My Ticket | /api/tickets |
| 4 | Approval Ticket | /api/approval |
| 5 | Assignment Ticket + Proses Tiket (Teknisi) | /api/assignment |
| 6 | Karyawan | /api/karyawan |
| 7 | User | /api/users |
| 8 | Jabatan | /api/master/jabatan |
| 9 | Departemen | /api/master/departemen |
| 10 | Bagian Departemen | /api/master/bagian-departemen |
| 11 | Kategori | /api/master/kategori |
| 12 | Sub Kategori | /api/master/sub-kategori |
| 13 | Teknisi | /api/teknisi |
| 14 | Inventory | /api/inventory |
| 15 | Laporan Feedback | /api/feedback |

## Alur status tiket (kunci perbaikan bug sebelumnya)
`list_ticket.status` sekarang di-update OTOMATIS oleh backend setiap kali:
- Admin **Approve/Reject** tiket -> approvalController mengubah `list_ticket.status`
  jadi `On Process` atau `Reject` dalam satu transaksi dengan `approval_ticket`.
- Admin **assign teknisi** -> `list_ticket.status` tetap `On Process`,
  `teknisi.jumlah_tiket_ditangani` naik otomatis.
- Teknisi menandai **Selesai** -> `list_ticket.status` jadi `Solved`.

Jadi status yang tampil di tabel List Ticket, Approval Ticket, dan Assignment Ticket
akan selalu konsisten dengan data aslinya -- tidak akan lagi ada kasus seperti
di screenshot sebelumnya (approve di DB tapi web masih tampil "Menunggu Approval").
