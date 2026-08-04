// Bentuk untuk "Aset Saya" (GET /inventory/my) - dipakai halaman Users
export interface Asset {
  kodeAsset: string;
  namaBarang: string;
  merk: string;
  kategori: string;
}