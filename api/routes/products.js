const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/products');

router.get('/',(req,res,next) => {
    Product.find()
    .exec()
    .then(doc=>{
        console.log(doc)
        if(doc){
            res.status(200).json(doc);
        }else{
            res.status(404).json({message: "no entries found"});
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({error:err});
    })
});

//new comment
router.post('/',(req,res,next) => {
    const product = new Product({
        _id:new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save()
    .then(result=>{
        console.log(result);
        res.status(200).json({
            messege : 'handling POST requests',
            createdProduct: product
        })
    })
    .catch(error =>{
        console.log(error)
        res.status(500).json({
            error: error
        })
    });
    
});

router.get('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.findById(id)
    .exec()
    .then(doc =>{
        console.log("From database",doc);
        if(doc){
            res.status(200).json(doc);
        }else{
            res.status(404).json({
                error: "Not found"
            });
        }
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error:error
        })
    });

});

router.delete('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.deleteOne({ _id: id }).exec()
    .then(response =>{
            const count = response.deletedCount;
            if(count){
                res.status(200).json({messege: response});
            }else{
                res.status(404).json({messege: "Not found an object with that Id"});
            }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({error:err});
    });
});

router.patch("/:productId",(req,res,next)=>{
    const id = req.params.productId;
    const updates = {};
    for(const ops of req.body){
        updates[ops.propName] = ops.value;
    }
    Product.updateOne({_id:id},{$set:updates})
    .exec()
    .then(result =>{
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            message: err
        });
    });
});

module.exports = router;