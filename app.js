const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

dotenv.config();

app.use(cors());
app.use(bodyParser.json({limit: "100mb", parameterLimit: 100000000}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true, parameterLimit: 100000000}));

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose.set("strictQuery", false);
mongoose.connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(con => {
    console.log(con.connection.host);
    console.log("Db Connection Success");
}).catch(error => {
    console.log("ERROR");
    console.log(error);
})
const port = process.env.PORT || 8080;



//Set Security HTTP header
app.use(helmet());

//Data Sanitilization against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());


app.listen(port, ()=>{
    console.log("App is running on port"+port);
});

// app.all('*', (req, res, next) => {
//      next(new AppError(`Cannot find this ${req.originalUrl} on this server`));
// });



app.get("/", (req, res)=>{
    // console.log(req.headers);
    res.send("Hello");
});

require("./routes/userRoute")(app);
require("./routes/provinceRoute")(app);
require("./routes/tourRoute")(app);