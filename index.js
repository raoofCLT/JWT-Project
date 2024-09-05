import express from "express"
import bodyParser from "body-parser";
import jwt from "jsonwebtoken"

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

let refreshTokens = []

app.post("/api/refresh",(req,res)=>{
    const refreshToken = req.body.token

    if(!refreshToken) return res.status(401).send("You are not authenticated")
    if(!refreshTokens.includes(refreshToken)){
        return res.status(403).send("Refresh token is not valid")
    }
    jwt.verify(refreshToken,"myRefreshSecretKey",(err, user)=>{
        err && console.log(err)
        refreshTokens = refreshTokens.filter((token)=> token !== refreshToken)
        const newAccessToken = generateAccessToken(user)
        const newRefreshToken = generateRefreshToken(user)

        refreshTokens.push(newRefreshToken)
        res.status(200).send({accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })
    })
})

const generateAccessToken = (user)=>{
    return  jwt.sign(
        {id: user.id, isAdmin: user.isAdmin},
        "mySecretKey",
        {expiresIn:"30s"}
    )
}
const generateRefreshToken = (user)=>{
    return jwt.sign(
        {id: user.id, isAdmin: user.isAdmin},
        "myRefreshSecretKey",
    )
}

app.post("/api/login", (req,res) =>{
    const {username, password} = req.body;
    const user = users.find((u)=>{
        return u.username === username && u.password === password;
    })
    if(user){
        //Generate an access token
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)
        refreshTokens.push(refreshToken)
        res.send({
            username: user.username,
            isAdmin: user.isAdmin,
            accessToken,
            refreshToken
        })
    }else{
        res.status(400).send("Username or password is incorrect")
    }
})



const verify = (req,res,next) =>{
    const authHeader= req.headers.authorization
    if(authHeader){
        const token = authHeader.split(" ")[1]
        jwt.verify(token,"mySecretKey",(err,user)=>{
            if(err){
                return res.status(403).send("Token is not valid")
            }
            
            req.user = user;
            next()
        })
    }else{
        res.status(401).json("You are not authenticated")
    }
}


app.delete("/api/users/:userId", verify,(req,res)=>{
    if(req.user.id === req.params.userId || req.user.isAdmin){
        res.status(200).send("User has been deleted")
    }else{
        res.status(403).send("You are not allowed to delete")
    }
})

app.post("/api/logout",verify,(req,res)=> {
    const refreshToken = req.body.token
    refreshTokens = refreshTokens.filter((token )=> token !== refreshToken)
    res.status(200).send("You logged out succesfully")
})

app.listen(port , ()=>{
    console.log(`Your port is running on port ${port}`)
})
