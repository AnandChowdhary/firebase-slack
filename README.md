# 🔥🔔 Firebase Slack

Automagically post new records from a Firebase database on Slack in near real-time, powered by GitHub Actions. The workflow runs every 5 minutes, finds new records, and sends a message to your preferred Slack channel.

## ⭐ Getting started

1. Fork this repository
1. Create a Slack webhook (see [Incoming webhooks for Slack](https://slack.com/intl/en-in/help/articles/115005265063-Incoming-webhooks-for-Slack))
1. Add required repository secrets or keys in the configuration file
1. Optionally, update the bot name and image

## ⚙️ Configuration

Just adding the environment variables in sufficient to get started, but you additionally configure the name and the avatar of the bot too.

### Environment variables

For GitHub Actions workflows, environment variables are stored as repository secrets (See [Creating and storing encrypted secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets)). Locally, they are loaded from a `.env` file.

- `FIREBASE_SERVICE_ACCOUNT_KEY` is the Firebase Service Account Key in JSON format
- `FIREBASE_DATABASE_URL` is the Firebase Cloud Firestore database URL, e.g., https://example.firebaseio.com
- `SLACK_WEBHOOK_KEY` is the "key" part of a Slack webhook URL, e.g., the "KEY" in https://hooks.slack.com/services/KEY

### Config File

The [`firebase-slack.yml`](./firebase-slack.yml) file is used to add key-value pairs for all settings. In most cases, you want to use environment variables for your Firebase API key and Slack webhook, but you can also add it in the YAML file instead.

| Key | Description |
| --- | ----------- |
| `botName` | Name of the bot |
| `botImage` | Profile picture of the bot |
| `firebaseServiceAccountKey` | JSON string with the key |
| `firebaseDatabaseUrl` | Firebase database URL |
| `slackWebhookKey` | Slack webhook key |

## 📄 License

- Code: [MIT](./LICENSE) © [Koj](https://joinkoj.com)
- "Firebase" is a trademark of Google LLC
- "Slack" is a trademark of Slack Technologies, Inc.
