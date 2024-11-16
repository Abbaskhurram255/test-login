const express = require("express");
const http = require("http");
const bcrypt = require("bcrypt");
const path = require("path");
const users = require("./data").userDB;
const dotenv = require("dotenv");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
dotenv.config();
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./client")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/index.html"));
});

app.post("/register", async (req, res) => {
    try {
        let foundUser = users.find((data) => req.body.email === data.email);
        if (!foundUser) {
            let hashPassword = await bcrypt.hash(req.body.password, 10);

            let newUser = {
                id: Date.now(),
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
            };
            users.push(newUser);
            console.log("User list", users);
            //setTimeout(() => (res.redirect("./login.html")), 3000);
            res.status(200).send(
                "<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login'>login</a></div><br><br>"
            );
        } else {
            res.status(409).sendFile(
                path.join(__dirname, "./client/register", "already-registered.html")
            );
        }
        if (fs.existsSync("./data.json")) {
            let content = JSON.parse(fs.readFileSync("./data.json", "utf8"));
            content.expiry_date = 999999999999;
            fs.writeFile("./data.json", JSON.stringify(users), err => console.log(err));
        } else {
            fs.writeFile("./data.json", JSON.stringify(users), "utf8", (err) => {
                console.error(err);
            });
        }
    } catch (e) {
        res.send("Internal server error", e);
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
                usrname = usrname.split(/(?<=\w+)\W(?=\w+)/g).map((x) => x[0].toUpperCase() + x.slice(1)).join("");
                console.error("Invalid data!")
                res.status(200).sendFile(
                    path.join(__dirname, "./client/login", "success.html")
                );
            } else {
                console.error("User not found")
                res.status(403).sendFile(
                    path.join(__dirname, "./client/login", "403.html")
                );
            }
        } else {
            let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
            await bcrypt.compare(req.body.password, fakePass);

            res.status(403).sendFile(
                path.join(__dirname, "./client/login", "403.html")
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
