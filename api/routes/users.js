const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.get('/',(req,res,next)=>{
    User.find()
    .select('_id email')
    .exec()
    .then(result=>{
        const response = {
            count: result.length,
            users:result.map(usr =>{
                return {
                    _id:usr._id,
                    email:usr.email
                }
            })
        };
        if(result){
            res.status(200).json(response);
        }else{
            res.status(404).json({
                messege:"no user found"
            });
        }
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

router.post('/signup',(req,res,next)=>{
    User.findOne({email:req.body.email}).exec()
    .then(user =>{
        console.log(user);
        if(user){
            res.status(422).json({
                messege:"user already exists"
            })
        }else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    return res.status(500).json({
                        error:err
                    });
                }else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email:req.body.email,
                        password:hash
                    });
                    user.save()
                    .then(result=>{
                        console.log(result);
                        res.status(201).json({
                            messege:"user created"
                        });
                    })
                    .catch(err=>{
                        console.log(err);
                        res.status(500).json({
                            error:err
                        });
                    });
                }
            });
        }
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    }); 
});

router.post('/login',(req,res,next)=>{
    User.findOne({email:req.body.email}).exec().
    then(result =>{
        if(result){
            bcrypt.compare(req.body.password, result.password,(err, rslt2)=>{
                if(err){
                    return res.status(401).json({
                        messege:"auth failed"
                    });
                }
                if(rslt2){
                    const token = jwt.sign({
                        email: result.email,
                        userId:result._id
                    },process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    });
                    return res.status(200).json({
                        messsege:"auth successfull",
                        token:token
                    });
                }
                res.status(401).json({
                    messege:"auth failed"
                });
            });
        }else{
            return res.status(401).json({
                messege:"auth failed"
            });
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

router.delete('/:userId',(req,res,next)=>{
    User.deleteOne({_id:req.params.userId}).exec()
    .then(result=>{
        console.log(result);
        res.status(200).json({
            messege:"user deleted successfully"
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
})
module.exports = router;