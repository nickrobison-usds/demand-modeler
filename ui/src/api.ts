import { Case } from "./app/AppStore";
import URI from "urijs";
import Axios from "axios";

export async function fetchCaseCounts(): Promise<Case[]> {
  const url = URI(`${process.env.REACT_APP_API_URI}/api/cases`);
  const resp = await Axios.get<Case[]>(url.readable());
  return resp.data;
}
