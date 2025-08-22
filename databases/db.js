const mysql= require("mysql2")

const connection=mysql.createConnection({
  host: "localhost",
  user: "root", // apna mysql username
  password: "root", // apna mysql password
  database: "blogdb",
});

connection.connect((err)=>{
    if(err){
        console.error("Unable to connect",err)
        return;
    }
    console.log(" Database Connected Sucessfully")
})

module.exports = connection;