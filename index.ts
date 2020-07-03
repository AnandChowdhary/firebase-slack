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
const startTime = dayjs().startOf("hour");
if (dayjs().minute() > 30) {
  startTime.set("minute", 30);
}
console.log(startTime.toDate());
const collection = firestore()
  .collection("subscribers")
  .where("date", ">=", startTime.toDate());

const getData = async () => {
  const snapshot = await collection.get();
  const data: any[] = [];
  snapshot.forEach((record) => {
    data.push(record.data());
  });
  return data;
};

/** Post a message to a Slack channel */
export const postToSlack = async (data: any) => {
  const payload = {
    username: "Koj Bot",
    icon_url:
      "https://raw.githubusercontent.com/AnandChowdhary/rescuetime-slack/master/assets/bot.png",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${data.name} just signed up!`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Email* \n ${data.email}`,
          },
          {
            type: "mrkdwn",
            text: `*Phone* \n ${data.phone}`,
          },
          {
            type: "mrkdwn",
            text: `*Period* \n ${data.subscriptionPeriod} years`,
          },
          {
            type: "mrkdwn",
            text: `*Budget* \n CHF ${data.budget}`,
          },
        ],
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
    postToSlack(item);
  }
};

firebaseSlack();
