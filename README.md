# slack-hackernews-top5
Posts the top 5 posts of the last 24 hours to a Slack URL.

## How to use
You will want to replace the `SLACK_INCOMING_WEBHOOK_URL` in `run.js` with the incoming webhook URL that you retrieved from Slack.

Additionally, you will need something to run the `run.myHandler` function however often you want to post news to the channel.

This can be done with a cron job, but I designed this to work easily with AWS lambda - just upload this repository, set `run.myHandler` as the handler function, and set a time trigger to post however often.

