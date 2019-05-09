const path = require("path");
const db = require("../models");
const sec = require("../auth");

module.exports = app => {
  // Load index page
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../", "public/index.html"));
  });

  app.get("/admin", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      // db.Event.findAll({
      //   include: {
      //     model: db.Shift,
      //     include: {
      //       model: db.User_Shift,
      //       include: {
      //         model: db.User,
      //         attributes: ["id", "firstName", "lastName", "nickName"]
      //       }
      //     }
      //   }
      // }).then(results => {
      //   res.render("admin", { events: results });
      // });
      db.Event.findAll({
        include: {
          model: db.Shift,
          order: [["startTime", "DESC"]],
          include: {
            model: db.User_Shift,
            include: {
              model: db.User,
              attributes: ["id", "firstName", "lastName", "nickName"]
            }
          }
        }
      }).then(results => {
        const hbArray = results.map(event => {
          const shifts = [];
          event.Shifts.forEach(shift => {
            shift.User_Shifts.forEach(userShift => {
              const newShift = {
                position: shift.position,
                startTime: shift.startTime,
                endTime: shift.endTime,
                shiftId: userShift.id,
                checkedIn: userShift.checkedIn,
                checkedOut: userShift.checkedOut,
                userId: userShift.UserId
              };
              if (newShift.userId) {
                newShift.firstName = userShift.User.firstName;
                newShift.lastName = userShift.User.lastName;
                newShift.nickName = userShift.User.nickName;
              }
              shifts.push(newShift);
            });
          });
          return {
            eventId: event.id,
            eventName: event.name,
            eventStart: event.startTime,
            eventEnd: event.endTime,
            eventShifts: shifts
          };
        });
        res.render("admin", { events: hbArray });
      });
    } else {
      res.sendFile(path.join(__dirname, "../", "public/index.html"));
    }
  });

  // Render 404 page for any unmatched routes
  /*
  app.get("*", (req, res) => {
    res.render("404");
  });
  */
};
