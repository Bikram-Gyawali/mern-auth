const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/api/users");
const app = express();

//bodyparser attaching or making link with the forrm fields from front end
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

//db config
const db = require("./config/key").mongoURI;
// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log("error in mongo", err));

//passport middleware
app.use(passport.initialize());

//config passport
require("./config/passport")(passport);

//routes
app.use("/api/users", users);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("server running on http://localhost:3000");
});
