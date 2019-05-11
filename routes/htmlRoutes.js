const path = require("path");
const moment = require("moment");
const db = require("../models");
const sec = require("../auth");

module.exports = app => {
  // Load index page
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../", "public/index.html"));
  });

  app.get("/events", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    db.Event.findAll({})
      .then(results => {
        const events = results.map(event => ({
          name: event.name,
          id: event.id,
          startTime: moment(event.startTime, "YYYY-MM-DD HH:MM:SS").format(
            "MMM Do h:mm a"
          ),
          endTime: moment(event.endTime, "YYYY-MM-DD HH:MM:SS").format(
            "MMM Do h:mm a"
          )
        }));
        res.render("events", { events, user });
      })
      .catch(err => {
        res.status(500).end();
      });
  });

  app.get("/shifts", (req, res) => {
    db.Shift.findAll({
      include: {
        model: db.User_Shift,
        where: { UserId: null }
      },
      where: {
        EventId: parseInt(req.query.id, 10)
      }
    })
      .then(shiftResults => {
        const hbShifts = [];
        shiftResults.forEach(shift => {
          shift.User_Shifts.forEach(userShift => {
            const newShift = {
              position: shift.position,
              startTime: moment(shift.startTime, "YYYY-MM-DD HH:MM:SS").format(
                "ddd h:mm a"
              ),
              endTime: moment(shift.endTime, "YYYY-MM-DD HH:MM:SS").format(
                "ddd h:mm a"
              ),
              shiftId: userShift.id
            };
            hbShifts.push(newShift);
          });
        });
        res.render("shifts", { shifts: hbShifts });
      })
      .catch(err => {
        res.status(500).end();
      });
  });

  // Render 404 page for any unmatched routes
  /*
  app.get("*", (req, res) => {
    res.render("404");
  });
  */
};
