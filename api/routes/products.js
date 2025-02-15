const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userauth = require('../middleware/user-auth');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString() +file.originalname)
    }
});

const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}

const upload = multer({
    storage: storage,
    limits:{
        fileSize:1024*1024*5
    },
    fileFilter:fileFilter
});

const Product = require('../models/products');

router.get('/',(req,res,next) => {
    Product.find()
    .select('_id name price productImage')
    .exec()
    .then(doc=>{
        const response = {
            count:doc.length,
            products:doc.map(dc=>{
                return {
                    name:dc.name,
                    price:dc.price,
                    productImage:'http://localhost:5001/'+dc.productImage,
                    id:dc._id,
                    request:{
                        type:'GET',
                        url:'http://localhost:5001/products/'+dc._id
                    }
                }
            })
        };
        if(doc){
            res.status(200).json(response);
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
router.post('/',userauth ,upload.single('productImage') ,(req,res,next) => {
    console.log(req.file);
    const product = new Product({
        _id:new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage:req.file.path
    });
    product.save()
    .then(result=>{
        console.log(result);
        res.status(200).json({
            messege : 'handling POST requests',
            createdProduct: {
                name:result.name,
                price:result.price,
                _id:result._id,
                image:result.productImage,
                request:{
                    type:'GET',
                    url:"http://localhost:5001/products/"+result._id
                }
            }
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
    .select('name price _id productImage')
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

router.delete('/:productId',userauth,(req,res,next)=>{
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

router.patch("/:productId",userauth,(req,res,next)=>{
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