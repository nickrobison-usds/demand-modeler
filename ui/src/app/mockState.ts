import { AppState } from "./AppStore";

type MockStateID = "01" | "02" | "03";
type MockCountyID =
  | "01001"
  | "01002"
  | "01003"
  | "02001"
  | "02002"
  | "02003"
  | "03001"
  | "03002"
  | "03003"
  | "03004"
  | "03005"
  | "03006"
  | "03007"
  | "03008"
  | "03009"
  | "03010"
  | "03011";

type MockStateInputs = {
  date: string;
  state?: MockStateID;
  county?: MockCountyID;
};

export const createMockState = ({
  date,
  state,
  county
}: MockStateInputs): AppState => ({
  selection: { date, state, county },
  covidTimeSeries: {
    states: {
      "01": [
        {
          ID: "01",
          State: "Alabama",
          Confirmed: 10,
          NewConfirmed: 2,
          Dead: 1,
          NewDead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "01",
          State: "Alabama",
          Confirmed: 20,
          NewConfirmed: 10,
          Dead: 2,
          NewDead: 1,
          Reported: new Date("2020-03-18T13:48:00Z")
        },
        {
          ID: "01",
          State: "Alabama",
          Confirmed: 40,
          NewConfirmed: 20,
          Dead: 4,
          NewDead: 2,
          Reported: new Date("2020-03-19T12:59:00Z")
        }
      ],
      "02": [
        {
          ID: "02",
          State: "Arkansas",
          Confirmed: 3,
          NewConfirmed: 2,
          Dead: 0,
          NewDead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "02",
          State: "Arkansas",
          Confirmed: 5,
          NewConfirmed: 3,
          Dead: 2,
          NewDead: 2,
          Reported: new Date("2020-03-18T13:48:00Z")
        },
        {
          ID: "02",
          State: "Arkansas",
          Confirmed: 10,
          NewConfirmed: 5,
          Dead: 4,
          NewDead: 2,
          Reported: new Date("2020-03-19T12:59:00Z")
        }
      ],
      "03": [
        {
          ID: "03",
          State: "California",
          Confirmed: 15,
          NewConfirmed: 5,
          Dead: 3,
          NewDead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03",
          State: "California",
          Confirmed: 40,
          NewConfirmed: 25,
          Dead: 10,
          NewDead: 7,
          Reported: new Date("2020-03-18T13:48:00Z")
        },
        {
          ID: "03",
          State: "California",
          Confirmed: 80,
          NewConfirmed: 40,
          Dead: 15,
          NewDead: 5,
          Reported: new Date("2020-03-19T12:59:00Z")
        }
      ]
    },
    counties: {
      "01001": [
        {
          ID: "01001",
          County: "Jefferson",
          State: "Alabama",
          Confirmed: 1,
          NewConfirmed: 1,
          Dead: 0,
          NewDead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "01001",
          County: "Jefferson",
          State: "Alabama",
          Confirmed: 2,
          NewConfirmed: 1,
          Dead: 1,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "01001",
          County: "Jefferson",
          State: "Alabama",
          Confirmed: 3,
          NewConfirmed: 1,
          Dead: 2,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "01002": [
        {
          ID: "01002",
          County: "Calhoun",
          State: "Alabama",
          Confirmed: 2,
          NewConfirmed: 2,
          Dead: 1,
          NewDead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "01002",
          County: "Calhoun",
          State: "Alabama",
          Confirmed: 4,
          NewConfirmed: 2,
          Dead: 2,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "01002",
          County: "Calhoun",
          State: "Alabama",
          Confirmed: 6,
          NewConfirmed: 2,
          Dead: 4,
          NewDead: 2,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "01003": [
        {
          ID: "01003",
          County: "Chilton",
          State: "Alabama",
          Confirmed: 3,
          NewConfirmed: 2,
          Dead: 2,
          NewDead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "01003",
          County: "Chilton",
          State: "Alabama",
          Confirmed: 6,
          NewConfirmed: 3,
          Dead: 4,
          NewDead: 2,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "01003",
          County: "Chilton",
          State: "Alabama",
          Confirmed: 9,
          NewConfirmed: 3,
          Dead: 4,
          NewDead: 0,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "02001": [
        {
          ID: "02001",
          County: "Ashley",
          State: "Arkansas",
          Confirmed: 7,
          NewConfirmed: 4,
          Dead: 0,
          NewDead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "02001",
          County: "Ashley",
          State: "Arkansas",
          Confirmed: 12,
          NewConfirmed: 5,
          Dead: 1,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "02001",
          County: "Ashley",
          State: "Arkansas",
          Confirmed: 19,
          NewConfirmed: 7,
          Dead: 4,
          NewDead: 3,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "02002": [
        {
          ID: "02002",
          County: "Boone",
          State: "Arkansas",
          Confirmed: 3,
          NewConfirmed: 1,
          Dead: 1,
          NewDead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "02002",
          County: "Boone",
          State: "Arkansas",
          Confirmed: 5,
          NewConfirmed: 2,
          Dead: 1,
          NewDead: 0,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "02002",
          County: "Boone",
          State: "Arkansas",
          Confirmed: 10,
          NewConfirmed: 5,
          Dead: 2,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "02003": [
        {
          ID: "02003",
          County: "Benton",
          State: "Arkansas",
          Confirmed: 5,
          NewConfirmed: 2,
          Dead: 3,
          NewDead: 2,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "02003",
          County: "Benton",
          State: "Arkansas",
          Confirmed: 6,
          NewConfirmed: 1,
          Dead: 4,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "02003",
          County: "Benton",
          State: "Arkansas",
          Confirmed: 8,
          NewConfirmed: 2,
          Dead: 5,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "03001": [
        {
          ID: "03001",
          County: "Orange",
          State: "California",
          Confirmed: 50,
          NewConfirmed: 10,
          Dead: 10,
          NewDead: 5,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03001",
          County: "Orange",
          State: "California",
          Confirmed: 100,
          NewConfirmed: 50,
          Dead: 11,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03001",
          County: "Orange",
          State: "California",
          Confirmed: 200,
          NewConfirmed: 100,
          Dead: 12,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "03002": [
        {
          ID: "03002",
          County: "Alpine",
          State: "California",
          Confirmed: 20,
          NewConfirmed: 5,
          Dead: 4,
          NewDead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03002",
          County: "Alpine",
          State: "California",
          Confirmed: 30,
          NewConfirmed: 10,
          Dead: 6,
          NewDead: 2,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03002",
          County: "Alpine",
          State: "California",
          Confirmed: 41,
          NewConfirmed: 11,
          Dead: 9,
          NewDead: 3,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "03003": [
        {
          ID: "03003",
          County: "Butte",
          State: "California",
          Confirmed: 17,
          NewConfirmed: 2,
          Dead: 2,
          NewDead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03003",
          County: "Butte",
          State: "California",
          Confirmed: 22,
          NewConfirmed: 5,
          Dead: 6,
          NewDead: 4,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03003",
          County: "Butte",
          State: "California",
          Confirmed: 27,
          NewConfirmed: 5,
          Dead: 8,
          NewDead: 2,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "03004": [
        {
          ID: "03004",
          County: "Amadore",
          State: "California",
          Confirmed: 4,
          NewConfirmed: 2,
          Dead: 1,
          NewDead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03004",
          County: "Amadore",
          State: "California",
          Confirmed: 5,
          NewConfirmed: 1,
          Dead: 2,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03004",
          County: "Amadore",
          State: "California",
          Confirmed: 6,
          NewConfirmed: 1,
          Dead: 2,
          NewDead: 0,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "03005": [
        {
          ID: "03005",
          County: "Fresno",
          State: "California",
          Confirmed: 5,
          NewConfirmed: 1,
          Dead: 2,
          NewDead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03005",
          County: "Fresno",
          State: "California",
          Confirmed: 7,
          NewConfirmed: 2,
          Dead: 2,
          NewDead: 0,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03005",
          County: "Fresno",
          State: "California",
          Confirmed: 7,
          NewConfirmed: 2,
          Dead: 2,
          NewDead: 0,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "03006": [
        {
          ID: "03006",
          County: "Kern",
          State: "California",
          Confirmed: 12,
          NewConfirmed: 1,
          Dead: 1,
          NewDead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03006",
          County: "Kern",
          State: "California",
          Confirmed: 13,
          NewConfirmed: 1,
          Dead: 1,
          NewDead: 0,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03006",
          County: "Kern",
          State: "California",
          Confirmed: 18,
          NewConfirmed: 5,
          Dead: 3,
          NewDead: 2,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "03007": [
        {
          ID: "03007",
          County: "Lake",
          State: "California",
          Confirmed: 22,
          NewConfirmed: 2,
          Dead: 0,
          NewDead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03007",
          County: "Lake",
          State: "California",
          Confirmed: 22,
          NewConfirmed: 0,
          Dead: 3,
          NewDead: 3,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03007",
          County: "Lake",
          State: "California",
          Confirmed: 23,
          NewConfirmed: 1,
          Dead: 3,
          NewDead: 0,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "03008": [
        {
          ID: "03008",
          County: "Mariposa",
          State: "California",
          Confirmed: 3,
          NewConfirmed: 3,
          Dead: 0,
          NewDead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03008",
          County: "Mariposa",
          State: "California",
          Confirmed: 4,
          NewConfirmed: 1,
          Dead: 1,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03008",
          County: "Mariposa",
          State: "California",
          Confirmed: 5,
          NewConfirmed: 1,
          Dead: 1,
          NewDead: 0,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "03009": [
        {
          ID: "03009",
          County: "Marin",
          State: "California",
          Confirmed: 33,
          NewConfirmed: 12,
          Dead: 2,
          NewDead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03009",
          County: "Marin",
          State: "California",
          Confirmed: 35,
          NewConfirmed: 2,
          Dead: 5,
          NewDead: 3,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03009",
          County: "Marin",
          State: "California",
          Confirmed: 40,
          NewConfirmed: 5,
          Dead: 6,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "03010": [
        {
          ID: "03010",
          County: "Merced",
          State: "California",
          Confirmed: 11,
          NewConfirmed: 4,
          Dead: 1,
          NewDead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03010",
          County: "Merced",
          State: "California",
          Confirmed: 14,
          NewConfirmed: 3,
          Dead: 2,
          NewDead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03010",
          County: "Merced",
          State: "California",
          Confirmed: 16,
          NewConfirmed: 2,
          Dead: 2,
          NewDead: 0,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ],
      "03011": [
        {
          ID: "Monterey",
          County: "Butte",
          State: "California",
          Confirmed: 14,
          NewConfirmed: 1,
          Dead: 1,
          NewDead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "Monterey",
          County: "Butte",
          State: "California",
          Confirmed: 17,
          NewConfirmed: 3,
          Dead: 3,
          NewDead: 2,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "Monterey",
          County: "Butte",
          State: "California",
          Confirmed: 20,
          NewConfirmed: 3,
          Dead: 3,
          NewDead: 0,
          Reported: new Date("2020-03-18T19:43:00Z")
        }
      ]
    }
  },
  mapView: { width: 0, height: 0, latitude: 0, longitude: 0, zoom: 0 }
});
