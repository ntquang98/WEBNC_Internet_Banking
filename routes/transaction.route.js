const router = require('express').Router();

router.get('/histories', (req, res) => {
  let { user_id } = req.tokenPayload;

});

module.exports = router;