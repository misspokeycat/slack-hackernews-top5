var request = require('request-promise');
var Promise = require('bluebird');

//Replace this with your Webhook URL:
var SLACK_INCOMING_WEBHOOK_URL = 'https://hooks.slack.com/services/replace/me';

//Gets top 3 posts from Hackernews and sends them to a Slack channel.
exports.myHandler = function(event, context, callback) {
    return request('https://hacker-news.firebaseio.com/v0/beststories.json')
    .then(function(hnjson){
        var best = JSON.parse(hnjson);
        var topStories = [];
        //Resolves once recursive condition met.
        var resolver = Promise.defer();
        var x = 0;
        //Psuedo while loop that finishes execution when we have 5 stories.
        var loop = function(){
        //Continuously chain promises until contition met.
        if (topStories.length < 5) {
            return request('https://hacker-news.firebaseio.com/v0/item/' + best[x] + '.json')
            .then(function(storyDataJson){
                var storyData = JSON.parse(storyDataJson);
                //We only want the top 5 stories of the day.
                //Since this will give us top stories over the course of a few days,
                //ensure the timestamp is <24 hours from now.
                var storyDate = new Date((storyData.time + 30*60*60)*1000);
                var now = new Date();
                if (storyDate > now){
                    topStories.push(storyData);
                }
                x++;
            })
            .then(loop)
            .catch(resolver.reject);
            } else {
                return resolver.resolve(topStories);
            }
        };
        process.nextTick(loop);
        return resolver.promise;
    }).then(function(stories){
        //Now that stories has the top 5 stories of the day, post to Slack.
        var messageText = "Here are the top 5 stories of the day from HN:";
        for (var story in stories){
            // Create a URL to link to if it's an ask HN post
            if (!stories[story].url){
                stories[story].url = "https://news.ycombinator.com/item?id=" + stories[story].id;
            }
            //1. Link to some article (x points) 
            var count = Number(story) + 1;
            messageText = messageText + "\n" + count +
            ". <" + stories[story].url + "|" + stories[story].title + "> " +
            "(" + stories[story].score + " points)" ;
        }
        console.log(messageText);
        request(
        {
            url: SLACK_INCOMING_WEBHOOK_URL,
            method: "POST",
            body: {
               text: messageText
            },
            json: true
        });
    })
    .catch(function(err){
        console.log("Error getting today's stories from HN: " + err);
    });
};
