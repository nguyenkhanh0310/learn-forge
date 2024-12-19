const express = require('express');
const { getViewerToken } = require('../services/aps.js');

let router = express.Router();

// xử lý requests đến server, với đường dẫn kết thúc bằng /token
router.get('/api/auth/token', async function (req, res, next) {
  // generate public access token, gửi lại cho client bằng dạng JSON
  try {
    res.json(await getViewerToken());
  } catch (err) {
    next(err);
  }
});

module.exports = router;