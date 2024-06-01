const express = require('express');
const router = express.Router();

router.get('/',(req,res,next)=>{
    res.status(200).json({
        message:'fetched orders'
    });
});

router.post('/',(req,res,next)=>{
    const order = {
        productId: req.body.productId,
        quantity: req.body.quantity
    };
    res.status(201).json({
        message:'new order created',
        order: order
    });
})

router.get('/:orderID',(req,res,next)=>{
    res.status(200).json({
        message:'your order has been fetched',
        orderID:req.params.orderID
    });
})

module.exports = router;