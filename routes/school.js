var express = require('express');
var router = express.Router();
var pool = require('./pool');

/* GET home page. */

function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRadians = angle => (angle * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function isValidLatitude(lat) {
    // Regular expression to validate latitude (-90 to 90)
    const latRegex = /^(\+|-)?(?:90(?:\.0+)?|[1-8]?\d(?:\.\d+)?)$/;
    return latRegex.test(lat);
}

function isValidSchoolName(name) {
    // Regular expression to validate school name (letters only, max 100 characters)
    const nameRegex = /^[A-Za-z\s]{1,100}$/;
    return nameRegex.test(name);
}

function isValidAddress(address) {
    // Regular expression to validate address (alphanumeric, max 200 characters)
    const addressRegex = /^[A-Za-z0-9\s]{1,200}$/;
    return addressRegex.test(address);
}


function isValidLongitude(lon) {
    // Regular expression to validate longitude (-180 to 180)
    const lonRegex = /^(\+|-)?(?:180(?:\.0+)?|(?:1[0-7]\d|\d{1,2})(?:\.\d+)?)$/;
    return lonRegex.test(lon);
}





router.post('/addschool',function(req,res,next){
    console.log(req.body)

    if (!req.body.name || !req.body.address || !req.body.latitude || !req.body.longitude){
        res.status(400).json({status:false,message:'All the fields are required'})
    }

    else{
        var s = "insert into schools(name,address,latitude,longitude) values(?,?,?,?)"
        pool.query(s,[req.body.name,req.body.address,req.body.latitude,req.body.longitude],(error,result)=>{
            if(error){
                console.log(error)
                res.status(500).json({status:false,'message':'server error...'})
            }
            else{
                if(isValidSchoolName(req.body.name) && isValidAddress(req.body.address) && isValidLatitude(req.body.latitude) && isValidLongitude(req.body.longitude)){
                    res.status(200).json({status:true,'message':'school inserted successfully'})
                }
                else{
                    res.status(400).json({status:false,'message':'All fields must be validated'})
                }
                
            }
        })
    }
    
})

router.get('/listSchools',function(req,res,next){
    console.log(req.query)
    if (!req.query.latitude || !req.query.longitude){
        res.status(400).json({status:false,message:'All the fields are required'})
    }
    else{
        

        var s="select * from schools";
        pool.query(s,function(error,result){
        if(error){
            console.log(error)
            res.status(500).json({status:false,message:'server error...'})
        }
        else{
            if(isValidLatitude(req.query.latitude) && isValidLongitude(req.query.longitude)){
                
                const schoolsWithDistance = result.map(school => ({
                    ...school,
                    distance: calculateDistance(req.query.latitude, req.query.longitude, school.latitude, school.longitude)
                }));
        
                schoolsWithDistance.sort((a, b) => a.distance - b.distance);
                res.status(200).json({status:true,'data':schoolsWithDistance})

            }
            else{
                res.status(400).json({status:false,'message':'All fields must be validated'})
            }
            
        }
    })

    }

})



module.exports = router;
