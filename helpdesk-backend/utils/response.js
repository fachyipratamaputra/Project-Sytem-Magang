function ok(res, data, message = 'Berhasil') {
  return res.status(200).json({ success: true, message, data });
}
function created(res, data, message = 'Berhasil dibuat') {
  return res.status(201).json({ success: true, message, data });
}
function fail(res, message = 'Terjadi kesalahan', code = 400) {
  return res.status(code).json({ success: false, message });
}
module.exports = { ok, created, fail };
