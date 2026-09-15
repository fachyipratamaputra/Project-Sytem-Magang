const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const m = require('../controllers/masterController');

// GET boleh diakses semua role yang sudah login (Admin & Users),
// karena Users juga butuh baca Kategori/Sub Kategori/Departemen dsb
// untuk keperluan bikin tiket baru. Hanya create/update/delete yang
// tetap dibatasi khusus Admin.
function crudRoutes(path, controller) {
  router.get(path, verifyToken, controller.getAll);
  router.post(path, verifyToken, checkRole('Admin'), controller.create);
  router.put(`${path}/:id`, verifyToken, checkRole('Admin'), controller.update);
  router.delete(`${path}/:id`, verifyToken, checkRole('Admin'), controller.remove);
}

// Fitur 8: Jabatan
crudRoutes('/jabatan', m.jabatan);
// Fitur 9: Departemen
crudRoutes('/departemen', m.departemen);
// Fitur 10: Bagian Departemen
crudRoutes('/bagian-departemen', m.bagianDepartemen);
// Fitur 11: Kategori
crudRoutes('/kategori', m.kategori);
// Fitur 12: Sub Kategori
crudRoutes('/sub-kategori', m.subKategori);
router.get('/sub-kategori/by-kategori/:id_kategori', verifyToken, m.subKategori.getByKategori);

module.exports = router;