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
          Dead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "01",
          State: "Alabama",
          Confirmed: 20,
          Dead: 2,
          Reported: new Date("2020-03-18T13:48:00Z")
        },
        {
          ID: "01",
          State: "Alabama",
          Confirmed: 40,
          Dead: 4,
          Reported: new Date("2020-03-19T12:59:00Z")
        }
      ],
      "02": [
        {
          ID: "02",
          State: "Arkansas",
          Confirmed: 3,
          Dead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "02",
          State: "Arkansas",
          Confirmed: 5,
          Dead: 2,
          Reported: new Date("2020-03-18T13:48:00Z")
        },
        {
          ID: "02",
          State: "Arkansas",
          Confirmed: 10,
          Dead: 4,
          Reported: new Date("2020-03-19T12:59:00Z")
        }
      ],
      "03": [
        {
          ID: "03",
          State: "California",
          Confirmed: 15,
          Dead: 3,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03",
          State: "California",
          Confirmed: 40,
          Dead: 10,
          Reported: new Date("2020-03-18T13:48:00Z")
        },
        {
          ID: "03",
          State: "California",
          Confirmed: 80,
          Dead: 15,
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
          Dead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "01001",
          County: "Jefferson",
          State: "Alabama",
          Confirmed: 2,
          Dead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "01001",
          County: "Jefferson",
          State: "Alabama",
          Confirmed: 3,
          Dead: 2,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "01002": [
        {
          ID: "01002",
          County: "Calhoun",
          State: "Alabama",
          Confirmed: 2,
          Dead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "01002",
          County: "Calhoun",
          State: "Alabama",
          Confirmed: 4,
          Dead: 2,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "01002",
          County: "Calhoun",
          State: "Alabama",
          Confirmed: 6,
          Dead: 4,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "01003": [
        {
          ID: "01003",
          County: "Chilton",
          State: "Alabama",
          Confirmed: 3,
          Dead: 2,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "01003",
          County: "Chilton",
          State: "Alabama",
          Confirmed: 6,
          Dead: 4,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "01003",
          County: "Chilton",
          State: "Alabama",
          Confirmed: 9,
          Dead: 4,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "02001": [
        {
          ID: "02001",
          County: "Ashley",
          State: "Arkansas",
          Confirmed: 7,
          Dead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "02001",
          County: "Ashley",
          State: "Arkansas",
          Confirmed: 12,
          Dead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "02001",
          County: "Ashley",
          State: "Arkansas",
          Confirmed: 19,
          Dead: 4,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "02002": [
        {
          ID: "02002",
          County: "Boone",
          State: "Arkansas",
          Confirmed: 3,
          Dead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "02002",
          County: "Boone",
          State: "Arkansas",
          Confirmed: 5,
          Dead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "02002",
          County: "Boone",
          State: "Arkansas",
          Confirmed: 10,
          Dead: 2,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "02003": [
        {
          ID: "02003",
          County: "Benton",
          State: "Arkansas",
          Confirmed: 5,
          Dead: 3,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "02003",
          County: "Benton",
          State: "Arkansas",
          Confirmed: 6,
          Dead: 4,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "02003",
          County: "Benton",
          State: "Arkansas",
          Confirmed: 8,
          Dead: 5,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "03001": [
        {
          ID: "03001",
          County: "Orange",
          State: "California",
          Confirmed: 50,
          Dead: 10,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03001",
          County: "Orange",
          State: "California",
          Confirmed: 100,
          Dead: 11,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03001",
          County: "Orange",
          State: "California",
          Confirmed: 200,
          Dead: 12,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "03002": [
        {
          ID: "03002",
          County: "Alpine",
          State: "California",
          Confirmed: 20,
          Dead: 4,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03002",
          County: "Alpine",
          State: "California",
          Confirmed: 30,
          Dead: 6,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03002",
          County: "Alpine",
          State: "California",
          Confirmed: 41,
          Dead: 9,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "03003": [
        {
          ID: "03003",
          County: "Butte",
          State: "California",
          Confirmed: 17,
          Dead: 2,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03003",
          County: "Butte",
          State: "California",
          Confirmed: 22,
          Dead: 6,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03003",
          County: "Butte",
          State: "California",
          Confirmed: 27,
          Dead: 8,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "03004": [
        {
          ID: "03004",
          County: "Amadore",
          State: "California",
          Confirmed: 4,
          Dead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03004",
          County: "Amadore",
          State: "California",
          Confirmed: 5,
          Dead: 2,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03004",
          County: "Amadore",
          State: "California",
          Confirmed: 6,
          Dead: 2,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "03005": [
        {
          ID: "03005",
          County: "Fresno",
          State: "California",
          Confirmed: 5,
          Dead: 2,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03005",
          County: "Fresno",
          State: "California",
          Confirmed: 7,
          Dead: 2,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03005",
          County: "Fresno",
          State: "California",
          Confirmed: 7,
          Dead: 2,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "03006": [
        {
          ID: "03006",
          County: "Kern",
          State: "California",
          Confirmed: 12,
          Dead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03006",
          County: "Kern",
          State: "California",
          Confirmed: 13,
          Dead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03006",
          County: "Kern",
          State: "California",
          Confirmed: 18,
          Dead: 3,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "03007": [
        {
          ID: "03007",
          County: "Lake",
          State: "California",
          Confirmed: 22,
          Dead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03007",
          County: "Lake",
          State: "California",
          Confirmed: 22,
          Dead: 3,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03007",
          County: "Lake",
          State: "California",
          Confirmed: 23,
          Dead: 3,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "03008": [
        {
          ID: "03008",
          County: "Mariposa",
          State: "California",
          Confirmed: 3,
          Dead: 0,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03008",
          County: "Mariposa",
          State: "California",
          Confirmed: 4,
          Dead: 1,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03008",
          County: "Mariposa",
          State: "California",
          Confirmed: 5,
          Dead: 1,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "03009": [
        {
          ID: "03009",
          County: "Marin",
          State: "California",
          Confirmed: 33,
          Dead: 2,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03009",
          County: "Marin",
          State: "California",
          Confirmed: 35,
          Dead: 5,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03009",
          County: "Marin",
          State: "California",
          Confirmed: 40,
          Dead: 6,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "03010": [
        {
          ID: "03010",
          County: "Merced",
          State: "California",
          Confirmed: 11,
          Dead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03010",
          County: "Merced",
          State: "California",
          Confirmed: 14,
          Dead: 2,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03010",
          County: "Merced",
          State: "California",
          Confirmed: 16,
          Dead: 2,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ],
      "03011": [
        {
          ID: "03011",
          County: "Monterey",
          State: "California",
          Confirmed: 14,
          Dead: 1,
          Reported: new Date("2020-03-17T19:43:00Z")
        },
        {
          ID: "03011",
          County: "Monterey",
          State: "California",
          Confirmed: 17,
          Dead: 3,
          Reported: new Date("2020-03-18T19:43:00Z")
        },
        {
          ID: "03011",
          County: "Monterey",
          State: "California",
          Confirmed: 20,
          Dead: 3,
          Reported: new Date("2020-03-19T19:43:00Z")
        }
      ]
    }
  },
  mapView: { width: 0, height: 0, latitude: 0, longitude: 0, zoom: 0 }
});
