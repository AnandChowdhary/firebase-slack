import { config } from "dotenv";
import {
  initializeApp,
  credential,
  ServiceAccount,
  firestore,
} from "firebase-admin";
import dayjs from "dayjs";
import axios from "axios";
config();

const FIREBASE_SERVICE_ACCOUNT_KEY: ServiceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ?? ""
);
const SLACK_WEBHOOK_KEY = process.env.SLACK_WEBHOOK_KEY;
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

initializeApp({
  credential: credential.cert(FIREBASE_SERVICE_ACCOUNT_KEY),
  databaseURL: FIREBASE_DATABASE_URL,
});

let startTime = dayjs().subtract(15, "minute");

const subscribersCollection = firestore()
  .collection("subscribers-v2")
  .where("date", ">=", startTime.toDate());

const realEstateCollection = firestore()
  .collection("real-estate-managers")
  .where("date", ">=", startTime.toDate());

const getData = async () => {
  const subscribersCollectionSnapshot = await subscribersCollection.get();
  const realEstateCollectionSnapshot = await realEstateCollection.get();
  const data: any[] = [];
  subscribersCollectionSnapshot.forEach((record) => {
    data.push(record.data());
  });
  realEstateCollectionSnapshot.forEach((record) => {
    data.push({ ...record.data(), realEstate: true });
  });
  return data;
};

/** Post a message to a Slack channel */
export const postToSlack = async (data: any) => {
  if (data.dev) return;
  const payload = {
    username: "Koj Bot",
    icon_url:
      "https://raw.githubusercontent.com/AnandChowdhary/rescuetime-slack/master/assets/bot.png",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: data.realEstate
            ? `Real estate manager lead from *${data.name || "a user"}*`
            : `*${data.name || "A user"}* just signed up!`,
        },
      },
      {
        type: "section",
        fields: Object.keys(data).map((key) => ({
          type: "mrkdwn",
          text: `*${key}* \n ${
            Array.isArray(data[key])
              ? data[key].join(", ")
              : data[key]._seconds
              ? new Date(data[key]._seconds * 1000).toLocaleString("en-CH", {
                  timeZone: "Europe/Zurich",
                })
              : typeof data[key] === "object"
              ? JSON.stringify(data[key])
              : data[key]
          }`,
        })),
      },
    ],
  };
  await axios.post(
    `https://hooks.slack.com/services/${SLACK_WEBHOOK_KEY}`,
    payload
  );
};

const firebaseSlack = async () => {
  const data = await getData();
  for await (const item of data) {
    if (item.email) postToSlack(item);
  }
};

firebaseSlack();
