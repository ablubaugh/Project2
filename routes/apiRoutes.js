/* eslint-disable prettier/prettier */
const db = require("../models");
const sec = require("../auth");

module.exports = app => {

  app.post("/api/login", (req, res) => {
    db.User.findOne({ where: { email: req.body.email.trim() } }).then(user => {
      if (user) {
        user.authenticate(req.body.password.trim()).then(isCorrectPassword => {
          if (isCorrectPassword) {
            const { id, email, isStaff } = user;
            const token = sec.authorize.generateToken(email, isStaff, id);
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

  app.post("/api/events", (req, res) => {
    db.Event.findAll({}).then(results => {
      let tbodyCreator = "";
      results.forEach(rows => {
        tbodyCreator += `
        <tr>
          <td>${rows.name}</td>
          <td>${rows.startTime.toString().substring(0, 16)}</td>
          <td>${rows.endTime.toString().substring(0, 16)}</td>
          <td class="right-align">
          <a href="/shifts.html?id=${rows.id}" class="waves-effect waves-light btn">Select</a>
          </td>                 
        </tr>`;
      });
      res.json(tbodyCreator);
    });
  });

  app.get("/api/shifts/:id", (req, res) => {
    db.Shift.findAll({
      where: {
        EventId: req.params.id
      }
    }).then(ShiftResults => {
      let tbodyShifts = "";
      ShiftResults.forEach(rowsShift => {
        tbodyShifts += `
        <tr>
          <td>${rowsShift.position}</td>
          <td>${rowsShift.startTime.toString().substring(0, 25)}</td>
          <td>${rowsShift.endTime.toString().substring(0, 25)}</td>
          <td class="right-align">
          <button class="shiftSignUp waves-effect waves-light btn" onclick="signupshift('${req.params.id}','${rowsShift.id}')">Join!</button>
          </td>                 
        </tr>`;
      });
      res.json(tbodyShifts);
    });
  });

  app.post("/api/shifts/:eId", (req, res) => {
    db.Event.findAll({
      include: { model: db.Shift, include: db.User_Shift }
    }).then(results => {
      let tbodyCreator = "";
      results.forEach(rows => {
        tbodyCreator = `
      <tr>
        <td>${rows.name}</td>
        <td>${rows.ShiftId}</td>
        <td>${rows.ShiftId}</td>
        <td>
        <button class="btn waves-effect waves-light" type="submit" name="action">I'll do it!
            <i class="material-icons right">send</i>
        </button>
        </td>                 
      </tr>`;
      });
      res.json(tbodyCreator);
    });
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
