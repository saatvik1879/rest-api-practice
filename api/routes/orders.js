const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/orders');


router.get('/',(req,res,next)=>{
    Order.find()
    .select('product _id quantity')
    .populate('product','name')
    .exec()
    .then(result=>{
        if(result!=null){
            const lst = {
                ordersCount:result.length,
                orders:result.map(order=>{
                    return {
                        orderID:order._id,
                        product:order.product,
                        quantity:order.quantity,
                        request:{
                            type:'GET',
                            url:'http://localhost:5001/orders/'+order._id
                        }
                    }
                })
            }
            res.status(200).json(lst);
        }else{
            res.status(404).json({
                messege:"no orders"
            });
        }
        
    })
    .catch(err =>{
        res.status(500).json({
            error:err
        })
    })
});

router.post('/:productId',(req,res,next)=>{
    const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        product: req.params.productId,
        quantity: req.body.quantity
    });
    order.save()
    .then(result =>{
        
            console.log(result);
            res.status(201).json({
                createdOrder: {
                    order_id:result._id,
                    productId:result.product,
                    quantity:result.quantity,
                    request:{
                        type:'GET',
                        url:'http://localhost:5001/orders/'+result._id
                    }
                }
            });
    }).catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

router.get('/:orderID',(req,res,next)=>{
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

router.delete('/:orderID',(req,res,next)=>{
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