import express from "express"
import bodyParser from "body-parser";

const app = express()
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const users = [
    {
        id: "1",
        username: "john",
        password: "john123",
        isAdmin: true
    },
    {
        id: "2",
        username: "jane",
        password: "jane456",
        isAdmin: false
    }
]

app.post("/api/login", (req,res) =>{
    const {username, password} = req.body;
    const user = users.find((u)=>{
        return u.username === username && u.password === password;
    })
    if(user){
        res.send(user)
    }else{
        res.status(400)
    }
})

app.listen(port , ()=>{
    console.log(`Your port is running on port ${port}`)
})
