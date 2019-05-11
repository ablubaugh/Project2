/* eslint-disable prettier/prettier */
const db = require("../models");
const sec = require("../auth");
// SMS config
const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const client = require("twilio")(accountSid, authToken);
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
                body: "Thanks for the registration. Please reply y to verify your number. Murderboat.",
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
        res.json(response);
      });
    } else {
      res.status(401).end();
    }
  });
<<<<<<< HEAD

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
=======
};
>>>>>>> 3f0cfd5249d79d1aa51f63b1b4432088b4818025
