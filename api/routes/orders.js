const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userauth = require('../middleware/user-auth');

const Order = require('../models/orders');

const orderControlls = require('../controllers/orders');

router.get('/',userauth,orderControlls.orders_get_all);

router.post('/:productId',userauth,orderControlls.create_order);

router.get('/:orderID',userauth,(req,res,next)=>{
    Order.findOne({_id:req.params.orderID})
    .populate('product')
    .exec()
    .then(result=>{
        if(result){
            console.log(result);
            res.status(200).json({
                order:{
                    orderId:req.params.orderID,
                    productId:result.product,
                    quantity:result.quantity,
                    request:{
                        type:'GET',
                        info:'for more details about the product',
                        url:'http://localhost:5001/products/'+result.product
                    }
                }
            });
        }else{
            res.status(404).json({
                messege:"no such order found"
            })
        }
    }).catch(err =>{
        res.status(500).json({
            error:err
        });
    });
});

router.delete('/:orderID',userauth,(req,res,next)=>{
    Order.findOneAndDelete({_id:req.params.orderID}).exec()
    .then(result=>{
        console.log(result);
        if(result){
            res.status(200).json({
                messege:"order of Id:"+result._id+" has been deleted successfully!!!"
            });
        }else{
            res.status(404).json({
                messege:"order not found"
            })
        }
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
});

module.exports = router;