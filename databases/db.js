const mysql= require("mysql2")

const connection=mysql.createConnection({
  host: process.env.DB-HOST,
  user: process.env.DB-USER,
  password: process.env.DB-PASSWORD,
  database: process.env.DB-NAME,
});

connection.connect((err)=>{
    if(err){
        console.error("Unable to connect",err)
        return;
    }
    console.log(" Database Connected Sucessfully")
})

module.exports = connection;