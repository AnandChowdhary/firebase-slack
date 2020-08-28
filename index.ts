import { config } from "dotenv";
import {
  initializeApp,
  credential,
  ServiceAccount,
  firestore,
} from "firebase-admin";
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

const subscribers = firestore().collection("subscribers-v2");
const realEstate = firestore().collection("real-estate-managers");

/** Post a message to a Slack channel */
export const postToSlack = async (data: any, id: string) => {
  if (data.dev) return;
  console.log("Triggering webhook");
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
            ? `Real estate manager lead from *${data.name || "a user"}* (${
                data.email
              })`
            : `*${data.name || "A user"}* (${
                data.email
              }) just signed up for a *${
                data.numberOfRooms
              }-room* apartment in *${data.locationName}* for a period of *${
                data.period * 12
              } months* with a budget of *${data.budget} CHF/month*.`,
        },
      },
      data.realEstate
        ? undefined
        : {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Full lead details: https://koj.co/en-ch/admin/customers/${id}`,
            },
          },
    ],
  };
  try {
    await axios.post(
      `https://hooks.slack.com/services/${SLACK_WEBHOOK_KEY}`,
      payload
    );
  } catch (error) {
    console.log(JSON.stringify(payload, null, 2));
  }
};

const sent: string[] = [];
const firebaseSlack = async () => {
  for await (const item of [subscribers, realEstate]) {
    const docs = await item.get();
    docs.forEach((doc) => sent.push(doc.id));
  }
  [subscribers, realEstate].forEach((item) => {
    item.onSnapshot((snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (doc.id && !sent.includes(doc.id) && data.email && !data.dev) {
          sent.push(doc.id);
          console.log("Sending", doc.id);
          postToSlack(data, doc.id);
        }
      });
    });
  });
};

firebaseSlack();
