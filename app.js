const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const users = require("./data").userDB;
const dotenv = require("dotenv");
const fs = require("fs");
const [NodeCache, helmet, compression] = [require("node-cache"), require("helmet"), require("compression")];

//configuring express
const app = express();
const cache = new NodeCache({ stdTTL: 3600 });
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    let meta = {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
        "X-Powered-By": "https://github.com/Abbaskhurram255",
        "App-Name": "Login",
        "App-Author": "Abbaskhurram255",
        "App-Company": "Khurram's Web Servers",
        "App-Support-Mail": "abbaskhurram255@gmail.com",
        "App-Support-Phone": "+923012965459",
        "App-License": "MIT",
        "App-Version": "1.0.0",
    };
    res.set(meta);
    
    let cacheKey = req.originalUrl;
    let cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
    	// If cached, restore both headers and body from cache
    	const { headers, body } = cachedResponse;
    	res.set(headers);
    	res.set('X-Cache', 'HIT');
    	return res.send(body);
    }

    // If not cached, proceed with request and cache the response
    let originalSend = res.send;
    res.send = body => {
    	let headers = res.getHeaders(); // Capture response headers
    	// Cache both headers and body
    	cache.set(cacheKey, { headers, body });
    	originalSend.call(res, body); // Proceed with original response
    };
    next();
});
app.use(
    helmet({
        hidePoweredBy: false,
    })
);
app.use(compression());

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
