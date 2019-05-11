/* eslint-disable prettier/prettier */
const db = require("../models");
const sec = require("../auth");
// SMS config
const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const client = require("twilio")(accountSid, authToken);
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const nodemailer = require('nodemailer');
const nodemailerNTLMAuth = require('nodemailer-ntlm-auth');

// End SMS config
module.exports = app => {

  app.post("/api/login", (req, res) => {
    db.User.findOne({ where: { email: req.body.email.trim() } }).then(user => {
      if (user) {
        user.authenticate(req.body.password.trim()).then(isCorrectPassword => {
          if (isCorrectPassword) {
            const { id, email, isStaff } = user;
            const token = sec.authorize.generateToken(id, email, isStaff);
            res
              .cookie("authToken", token, {
                maxAge: 3600000,
                httpOnly: true,
                sameSite: true
              })
              .send("Success");
          } else {
            res.status(401).send("Invalid User Name or Password");
          }
        });
      } else {
        res.status(401).send("Invalid User Name or Password");
      }
    });
  });

  app.post("/api/register", (req, res) => {
    if (sec.isValidPassword(req.body.userPassword)) {
      sec.hashPassword(req.body.userPassword.trim(), (err, hash) => {
        if (err) {
          res.status(500).end();
        }
        const newUserRequest = {
          firstName: req.body.userFirstName.trim(),
          lastName: req.body.userLastName.trim(),
          nickName: req.body.userNickName.trim(),
          phone: req.body.userPhone.replace(/[^0-9]/, "").trim(),
          email: req.body.userEmail.trim(),
          skills: req.body.userSkills.trim(),
          password: hash
        };
        db.User.create(newUserRequest)
          .then(user => {
            const token = sec.authorize.generateToken(
              user.id,
              user.email,
              user.isStaff
            );
            res
              .cookie("authToken", token, {
                maxAge: 3600000,
                httpOnly: true,
                sameSite: true
              })
              .cookie("userName", user.nickName || user.firstName, {
                maxAge: 3600000
              })
              .send("Success");
            // Send SMS
            client.messages
              .create({
                body: "Thanks for the registration. We will Contact you soon. Murderboat.",
                from: "9712564994",
                to: newUserRequest.phone
              })
              .then(message => console.log(message.sid));
          })
          .catch(error => {
            console.log(`error from line 66 apiRoutes: ${error}`);
            res.status(400).end();
          });
      });
    } else {
      res.status(400).end();
    }
  });
  //send feedback SMS
  app.post("/sms", (req, res) => {
    /*const twiml = new MessagingResponse();
    console.log(req);
    let userPhone =req.body.from.toString().trim();
    let userText =req.body.text.toString().trim();
    //userPhone = "+19713363132";
    if(userPhone.length>9){
      let cutRange = parseInt(userPhone.length - 9)-1;
      userPhone = userPhone.slice(cutRange, 15);
    }
    if(userText === "Y" || userText === "y")
    {
      // update database
      const updateParams = {verifiedNumber: 1};
      db.User.update(updateParams, { where: { phone: userPhone } }).then(
        results => {
          res.json(results);
        }
      );
      twiml.message("Your number verified!");
      res.writeHead(200, {"Content-Type": "text/xml"});
      res.end(twiml.toString());
    }*/
  });
  app.put("/api/shift/:id", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user) {
      userEmail = user.email;
      db.User_Shift.update({
        UserId: user.id
      },
      {
        where: {
          id: req.params.id
        }
      }).then(response => {
        /*var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "murderboatpro@gmail.com",
            pass: "Az123123**"
          }
        });*/
        let transporter = nodemailer.createTransport({
          host: "server52.mylittledatacenter.com",
          port: 465,
          secure: false,
          auth: {
            type: "custom",
            method: "NTLM", // forces Nodemailer to use your custom handler
            user: "murderboat@acnu.us",
            pass: "AzAz123123**"
          },
          tls: {rejectUnauthorized: false},
          debug:true,
          customAuth: {
            NTLM: nodemailerNTLMAuth
          }
        });
        var mailOptions = {
          from: "murderboat@acnu.us",
          to: userEmail,
          subject: "Welcome to Murderboat!",
          text: "Thanks for Sign up in our event! We will contact you soon."
        };
        console.log("Sending confirmation email ...");
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        res.json(response);
      });
    } else {
      res.status(401).end();
    }
  });
  app.put("/api/admin/:checktype", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      const updateParams = {};
      updateParams[req.params.checktype] = true;
      db.User_Shift.update(updateParams, { where: { id: req.body.id } }).then(
        results => {
          res.json(results);
        }
      );
      
    } else {
      res.status(401).end();
    }
  });
};
