var express = require('express');
var router = express.Router();
var pool = require('./pool');
var upload = require('./multer')

router.post('/add_new_product',upload.single('image'),function(req,res){
    console.log(req.body);
    var s="insert into product (companyid, categoryid, productname, description, status, trending, deals, pricetype, image, createdat, updateat, createdby) values(?,?,?,?,?,?,?,?,?,?,?,?)"
    pool.query(s,[req.body.companyid, req.body.categoryid, req.body.productname,req.body.description,req.body.status,req.body.trending,req.body.deals,req.body.pricetype, req.file.originalname, req.body.createdat, req.body.updateat, req.body.createdby],function(error,result){
        if(error){
            console.log(error)
            res.status(500).json({status:false,message:'server error...'})
        }
        else{
            console.log(req.body);
            res.status(200).json({status:true,message:'Company Registered Successfullt'})
        }
    })

})

router.get('/fetch_category_names',function(req,res,next){
    var s="select categoryid,category from category";
    pool.query(s,function(error,result){
        if(error){
            console.log(error)
            res.status(500).json({status:false,message:'server error...'})
        }
        else{
            console.log(result)
            res.status(200).json({status:true,data:result})
        }
    })

})


module.exports = router;