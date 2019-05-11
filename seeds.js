const db = require("./models");
const sec = require("./auth");

const seeds = () => {
  const users = [
    {
      firstName: "Destiny",
      lastName: "Fay",
      email: "Deontae_Oberbrunner21@example.com",
      skills: "bartending",
      phone: "4391616843",
      password: "j7bgCMnAaqQB6TQ",
      nickName: "",
    },
    {
      firstName: "Vanessa",
      lastName: "O'Hara",
      email: "Gladyce59@example.com",
      skills: "event promotion",
      phone: "4413138826",
      password: "ww3O4M17aPm7yM5",
      nickName: ""
    },
    {
      firstName: "Carli",
      lastName: "Johnson",
      email: "Coy_Tillman84@example.com",
      skills: "performer coordination",
      phone: "8737360860",
      password: "4BnVs0SO3Tm8ozS",
      nickName: ""
    },
    {
      firstName: "Pierre",
      lastName: "Robel",
      email: "Werner40@example.com",
      skills: "architect and build supervision",
      phone: "8882099606",
      password: "eR0F1SiYmerieZy",
      nickName: ""
    },
    {
      firstName: "Kate",
      lastName: "Daugherty",
      email: "Dexter.Nikolaus@example.com",
      skills: "permit handling",
      phone: "7281665723",
      password: "iG0Kswq8Ogrp_4c",
      nickName: ""
    },
    {
      firstName: "Admin",
      lastName: "istrator",
      email: "admin@example.com",
      skills: "Extension",
      phone: "7281665723",
      password: "MBVCSpa55",
      nickName: "",
      isStaff: true
    }
  ];

  const Events = [
    {
      name: "Turbulence",
      description: "djs on a wing, silent disco, art installations",
      venue: "Hillsboro",
      startTime: "2019-06-03 07:00:00",
      endTime: "2019-06-04 07:00:00"
    },
    {
      name: "World's Larget Blanket Fort",
      description: "explore the worlds larget blanket fort, games, comedy, music, art",
      venue: "Oregon Convention Center",
      startTime: "2019-10-10 07:00:00",
      endTime: "2019-10-12 07:00:00"
    },
    {
      name: "Turbulence Live",
      description: "live bands on a wing, brew fest, plane tours",
      venue: "Hillsboro",
      startTime: "2019-08-25 18:00:00",
      endTime: "2019-08-26 07:00:00"
    },
  ];

  const Shifts = [
    {
      position: "Build",
      startTime: "2019-05-03 00:00:00",
      endTime: "2019-05-03 03:00:00"
    },
    {
      position: "Shuttle Handler",
      startTime: "2019-05-03 00:00:00",
      endTime: "2019-05-03 03:00:00"
    },
    {
      position: "Front Desk",
      startTime: "2019-05-03 00:00:00",
      endTime: "2019-05-03 03:00:00"
    },
    {
      position: "Tear Down",
      startTime: "2019-05-03 00:00:00",
      endTime: "2019-05-03 03:00:00"
    },
    {
      position: "Medical",
      startTime: "2019-05-03 00:00:00",
      endTime: "2019-05-03 03:00:00"
    }
  ];
  /* eslint no-param-reassign: ["error", { "props": false }] */
  users.forEach(item => {
    sec.hashPassword(item.password, (err, hash) => {
      item.password = hash;
      db.User.create(item);
    });
  });
  db.Event.bulkCreate(Events).then(events => {
    events.forEach(event => {
      Shifts.forEach(shift => {
        shift.EventId = event.id;
        db.Shift.create(shift).then(result => {
          const UserShifts = [{ ShiftId: result.id }];
          db.User_Shift.bulkCreate(UserShifts);
        });
      });
    });
  });
};

module.exports = seeds;
