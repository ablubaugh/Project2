const moment = require("moment");
const path = require("path");
const db = require("../models");
const sec = require("../auth");

module.exports = app => {
  // GET route for searching events
  app.get("/Search/Events", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      const searchTerm = req.query.keyword;
      db.Event.findAll({
        where: {
          $or: [
            { name: { $like: `%${searchTerm}%` } },
            { description: { $like: `%${searchTerm}%` } },
            { venue: { $like: `%${searchTerm}%` } }
          ]
        }
      }).then(seachEvents => {
        res.json(seachEvents);
      });
    } else {
      res.status(401).end();
    }
  });

  // GET route for searching shifts
  app.get("/Search/Shifts", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      const searchTerm = req.query.keyword;
      db.Shift.findAll({
        where: {
          position: {
            $like: `%${searchTerm}%`
          }
        }
      }).then(searchShifts => {
        res.json(searchShifts);
      });
    } else {
      res.status(401).end();
    }
  });

  // GET route for searching users
  app.get("/Search/Users", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      const searchTerm = req.query.keyword;
      db.User.findAll({
        attributes: [
          "firstName",
          "lastName",
          "nickName",
          "isStaff",
          "isBanned",
          "skills",
          "phone"
        ],
        where: {
          $or: [
            { firstName: { $like: `%${searchTerm}%` } },
            { lastName: { $like: `%${searchTerm}%` } },
            { nickName: { $like: `%${searchTerm}%` } },
            { email: { $like: `%${searchTerm}%` } },
            { phone: { $like: `%${searchTerm}%` } }
          ]
        }
      }).then(searchUsers => {
        res.json(searchUsers);
      });
    } else {
      res.status(401).end();
    }
  });

  // EVENTS

  // POST route for saving a new events
  app.post("/Event", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      const startTime = moment(req.body.startTime).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const endTime = moment(req.body.endTime).format("YYYY-MM-DD HH:mm:ss");
      console.log(`${startTime} ${endTime}`);
      db.Event.create({
        name: req.body.name,
        description: req.body.description,
        venue: req.body.venue,
        startTime,
        endTime
      })
        .then(addEvent => {
          res.json(addEvent);
        })
        .catch(err => {
          res.status(500).send("Error creating event in database.");
        });
    } else {
      res.status(401).end();
    }
  });

  // DELETE route for deleting events by ID
  app.delete("/Event/:id", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      db.Event.destroy({
        where: {
          id: req.params.id
        }
      }).then(deleteEvent => {
        res.json(deleteEvent);
      });
    } else {
      res.status(401).end();
    }
  });

  // PUT route for updating Events.
  app.put("/Event", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      db.Event.update(
        {
          name: req.body.name,
          description: req.body.description,
          venue: req.body.venue,
          startTime: req.body.startTime,
          endTime: req.body.endTime
        },
        {
          where: {
            id: req.body.id
          }
        }
      )
        .then(updateEvents => {
          res.json(updateEvents);
        })
        .catch(err => {
          res.status(500).send("Error creating event in database.");
        });
    } else {
      res.status(401).end();
    }
  });

  // DELETE route for deleting users by name
  app.delete("/User/:id", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      db.User.destroy({
        where: {
          id: req.body.id
        }
      }).then(deleteUser => {
        res.json(deleteUser);
      });
    } else {
      res.status(401).end();
    }
  });

  // PUT route for updating User.
  app.put("/User", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      db.User.update(
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          nickName: req.body.nickName,
          phone: req.body.phone,
          email: req.body.email,
          skills: req.body.skills
        },
        {
          where: {
            id: req.body.id
          }
        }
      )
        .then(updateUser => {
          res.json(updateUser);
        })
        .catch(err => {
          res.status(500).send("Error updating user in database.");
        });
    } else {
      res.status(401).end();
    }
  });

  // SHIFTS
  // POST route for saving a new shifts
  app.post("/Shift", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      db.Shift.create({
        id: req.body.id,
        eventID: req.body.eventID,
        position: req.body.position,
        startTime: req.body.startTime,
        endTime: req.body.endTime
      })
        .then(addShift => {
          res.json(addShift);
        })
        .catch(err => {
          res.status(500).send("Error creating shift in database.");
        });
    } else {
      res.status(401).end();
    }
  });

  // DELETE route for deleting Shift by ID
  app.delete("/Shift/:id", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      db.Shift.destroy({
        where: {
          id: req.body.id
        }
      }).then(deleteShift => {
        res.json(deleteShift);
      });
    } else {
      res.status(401).end();
    }
  });

  // PUT route for updating Shift.

  app.get("/createEvent", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      res.render("createEvent", {});
    } else {
      res.status(401).end();
    }
  });

  app.get("/admin", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
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
                startTime: moment(
                  shift.startTime,
                  "YYYY-MM-DD HH:MM:SS"
                ).format("ddd h:mm a"),
                endTime: moment(shift.endTime, "YYYY-MM-DD HH:MM:SS").format(
                  "ddd h:mm a"
                ),
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
  app.put("/Shift", (req, res) => {
    const user = sec.authorize.verifyToken(req.cookies);
    if (user && user.isStaff) {
      db.Shift.update(
        {
          eventID: req.body.eventID,
          position: req.body.position,
          startTime: req.body.startTime,
          endTime: req.body.endTime
        },
        {
          where: {
            id: req.body.id
          }
        }
      )
        .then(updateShift => {
          res.json(updateShift);
        })
        .catch(err => {
          res.status(500).send("Error updating shift in database.");
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
