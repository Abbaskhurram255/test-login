const express = require("express");
const http = require("http");
const bcrypt = require("bcrypt");
const path = require("path");
const users = require("./data").userDB;
const dotenv = require("dotenv");
const fs = require("fs");
const promises = fs.promises;

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
            fs.readFile("./data.json")
                .then((body) => JSON.parse(body))
                .then((json) => {
                    // manipulate your data here
                    json.value = value;
                    return json;
                })
                .then((json) => JSON.stringify(json))
                .then((body) => fs.writeFile("./data.json", body))
                .catch((error) => {
                    fs.writeFile(
                        "./data.json",
                        JSON.stringify(content),
                        (err) => console.log(err)
                    );
                    console.warn(error);
                });
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
            res.send(
                "<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login'>login</a></div><br><br>"
            );
        } else {
            res.sendFile(
                path.join(
                    __dirname,
                    "./client/register",
                    "already-registered.html"
                )
            );
        }
    } catch (e) {
        console.log(e);
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
                //usrname = usrname.split(/(?<=\w+)\W(?=\w+)/g).map((x) => x[0].toUpperCase() + x.slice(1)).join("");
                res.sendFile(
                    path.join(__dirname, "./client/login", "success.html")
                );
            } else {
                console.error("Unauthorized user");
                res.sendFile(
                    path.join(__dirname, "./client/login", "403.html")
                );
            }
        } else {
            let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
            await bcrypt.compare(req.body.password, fakePass);

            res.sendFile(path.join(__dirname, "./client/login", "403.html"));
        }
    } catch {
        res.send("Internal server error");
    }
});
const PORT = 3002;

server.listen(PORT, function () {
    console.log(`server is listening on port: ${PORT}`);
});
