const express = require("express");
const http = require("http");
const bcrypt = require("bcrypt");
const path = require("path");
const users = require("./data").userDB;
const dotenv = require("dotenv");

const app = express();
const server = http.createServer(app);
dotenv.config();
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./client")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/index.html"));
});

app.post("/register", async (req, res) => {
    console.log(users);
    console.log(req.body);
    try {
        let foundUser = users.find((data) => req.body.email === data.email);
        if (!foundUser) {
            let hashPassword = await bcrypt.hash(req.body.password, 10);

            let us
            let newUser = {
                id: Date.now(),
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
            };
            users.push(newUser);
            console.log("User list", users);
            //setTimeout(() => (res.redirect("./login.html")), 3000);
            res.send(
                "<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login'>login</a></div><br><br>"
            );
        } else {
            res.send(
                "<div align ='center'><h2>Email already registered. Please login with the same data!</h2></div><br><br><div align='center'><a href='./login'>Login</a></div>"
            );
        }
    } catch {
        res.send("Internal server error");
    }
});

app.post("/login", async (req, res) => {
    try {
        let foundUser = users.find((data) => req.body.email === data.email);
        if (foundUser) {
            let submittedPass = req.body.password;
            let storedPass = foundUser.password;

            const passwordMatch = await bcrypt.compare(
                submittedPass,
                storedPass
            );
            if (passwordMatch) {
                let usrname = foundUser.username;
                usrname = usrname.split("").map((x) => x[0].toUpperCase() + x.slice(1).join(""));
                res.send(
                    `<div align ='center'><h2>login successful</h2></div><br><br><br><div align ='center'><h3>Hello ${usrname}</h3></div><br><br><div align='center'><a href='./login/index.html'>logout</a></div>`
                );
            } else {
                // res.send(
                //     "<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='./login/'>login again</a></div>"
                // );
                res.status(403).sendFile(
                    path.join(__dirname, "./client", "403.html")
                );
            }
        } else {
            let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
            await bcrypt.compare(req.body.password, fakePass);

            res.status(403).sendFile(
                path.join(__dirname, "./client", "403.html")
            );
        }
    } catch {
        res.send("Internal server error");
    }
});
const PORT = 3002;

server.listen(PORT, function () {
    console.log(`server is listening on port: ${PORT}`);
});
