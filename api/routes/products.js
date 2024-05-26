const express = require('express');
const router = express.Router();

router.get('/',(req,res,next) => {
    res.status(200).json({
        messege : 'handling GEt requests'
    })
});

//new comment
router.post('/',(req,res,next) => {
    res.status(200).json({
        messege : 'handling POST requests'
    })
});



module.exports = router;