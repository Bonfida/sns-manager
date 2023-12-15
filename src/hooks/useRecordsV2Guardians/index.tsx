import axios from "axios";
import { Record } from "@bonfida/spl-name-service";

export const sendRoaRequest = async (domain: string, record: Record) => {
  try {
    await axios.post("https://roa-guardian.bonfida.workers.dev/roa", {
      domain,
      record,
    });
  } catch {}
};
