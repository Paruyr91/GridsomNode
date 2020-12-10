const express = require('express');
const app= express();
const cookie = require( 'cookie-parser' );
const bodyParser=require('body-parser');
const fs = require('fs')
const server=require('http').Server(app);
const axios= require('axios');
const cors= require('cors');
require('dotenv').config();
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const jwt = require('jsonwebtoken');
const dns = require('dns')


const url = 'http://localhost:2368/ghost/api/v3/admin'

// let kk=process.env.ADMIN_API_KEY

//  console.log(kk,'lllllllll') 
let key = "5fd063a3f7b1a7000118c184:1a4c1dde174848cff0947feb2a665ef44de91d8fbd5c51992c6da6e467e598dd"   
const [id, secret] = key.split(':');

//  var val=[]
// fs.createReadStream('adminKeys.csv')
//   .pipe(csv())
//   .on('data', (row) => {
       
//      val.push(row)
//     console.log(val,"in")
//   })
//   .on('end', () => {
//     console.log('CSV file successfully processed');
//   });
 
//   console.log(val,'out') 
  
  

 

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:false
}))

app.use(bodyParser.json())
app.use(express.json())


  
app.get(/.*/,(req,res)=>{
res.sendFile(__dirname+'/public/index.html')
} )


app.use( cookie() );
app.post('/session', async function(req, res) {
   let value=req.body
   let token = jwt.sign({}, Buffer.from(secret, 'hex'), {
      keyid: id,
      algorithm: 'HS256',
      expiresIn: '1H',
      audience: `/v3/admin/`
   });
let  adminApiKeyAbsent=true

const headers = { Authorization: `Ghost ${token}` };

     await axios.get(`${url}/users/`,  { headers })
        .then(response => {  adminApiKeyAbsent=false } )
        .catch(error =>{
            if(!error.response){
                res.status(500).send({success:false,error:"server not found"})
            }
        });

        if(adminApiKeyAbsent){
            token = jwt.sign({}, Buffer.from('SecretApiKeyToken', 'hex'), {
                keyid: id,
                algorithm: 'HS256',
                expiresIn: '30m',
                audience: `/v3/admin/`
             });
        }


    const options = { headers: {   'Content-Type': 'application/json', }  };

         await axios.post(`${url}/session`,value,options)
          .then((response) => {
              console.log(response.data)
           res.status(200).send({success:true,adminApiKeyAbsent:adminApiKeyAbsent,token:token})
          })
          .catch(error =>{
              console.log(error.response,'bbbbbbbbbbbbbbbbbbbb')
             if(!error.response){
                 res.status(500).send({success:false,error:"server not found"})
             }else res.status(error.response.status).send({success:false,error:error.response.statusText})
              
          } )
  }); 






  app.post('/checktoken', async(req,res)=>{

    if(!req.headers.authorization){
        res.status(404).send({success:false,error:"Autorization fild"})
    }

       let tokenv =''+req.headers.authorization
    try{

        if(tokenv.split(' ')[0]==='ApiKeyToken'){
            tokenv =tokenv.split(' ')[1]
            let decoded = await jwt.verify(tokenv, Buffer.from('SecretApiKeyToken', 'hex')) 

            console.log(decoded)

        }else{
            tokenv =tokenv.split(' ')[1]
            let decoded = await jwt.verify(tokenv, Buffer.from(secret, 'hex')) 
            
        }

        res.status(200).send({success:true})
    }catch(err){
    res.status(401).send({success:false,error:err}) 
      }

  })

  dns.resolve("testdomain.com", 'ANY', (err, records) => {
    if (err) {
      console.log("Error: ", err);
    } else {
      console.log(records);
    }
  });
  


server.listen(80,'http://gridsome.hotcocoa.design/')
  