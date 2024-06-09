const Order = require('../models/orders');
const mongoose = require('mongoose');

exports.orders_get_all = (req,res,next)=>{
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
}

exports.create_order = (req,res,next)=>{
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
}

