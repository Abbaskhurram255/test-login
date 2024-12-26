const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const users = require("./data").userDB;
const dotenv = require("dotenv");
const fs = require("fs");

const app = express();
dotenv.config();
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./client")));

// setTimeout(async() => {
//     fs.writeFile(
//         "./client/data.json",
//         JSON.stringify(users, null, 2),
//         (err) => {
//             if (err) console.log(err);
//         }
//     );
// }, 4000);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/index.html"));
});

app.post("/register", async (req, res) => {
    try {
        let foundUser = users.find(
            (data) =>
                req.body.email === data.email || req.body.email === data.username
        );
        if (!foundUser) {
            let hashPassword = await bcrypt.hash(req.body.password, 10);
            let newUser = {
                id: Date.now(),
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
                rawPassword: Buffer.from(req.body.password).toString("base64"),
            };
            users.push(newUser);
            console.log("User list", users);
            //setTimeout(() => (res.redirect("./login.html")), 3000);
            res.status(200).sendFile(path.join(__dirname, "./client", "register/registration-successful.html"));
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
        res.sendFile(path.join(__dirname, "./client", "500.html"));
    }
});

app.post("/login", async (req, res) => {
    try {
        let foundUser = users.find(
            (data) =>
                req.body.email === data.email ||
                req.body.email === data.username
        );
        if (foundUser) {
            let submittedPass = req.body.password;
            let storedPass = foundUser.password;

            const passwordMatch = await bcrypt.compare(
                submittedPass,
                storedPass
            );
            if (passwordMatch) {
                let usrname = foundUser.username;
                usrname = usrname
                    .split(/(?<=\w)\W(?=\w)/g)
                    .map((x) => x[0].toUpperCase() + x.slice(1))
                    .join(" ");
                console.log(`Logged in as ${usrname}`);
                res.status(301).redirect(
                    `https://abbaskhurram255.github.io/site-2/?login=success&username=${foundUser.username}&email=${Buffer.from(foundUser.email).toString("base64")}&pvscheck=${Buffer.from(usrname).toString("base64")}&xidcheck=${foundUser.rawPassword}`
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
        res.sendFile(path.join(__dirname, "./client", "500.html"));
    }
});

app.get("/*", (req, res) => {
    res.status(404).sendFile(path.join(__dirname, "./client/404.html"));
});





const PORT = process.env.PORT || 3002;
app.listen(PORT, function () {
    console.log(`server is listening on port ${PORT}`);
});
