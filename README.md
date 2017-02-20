## Inspiration

Sweet Tweetment lets you check up on your friends who need it the most. We were inspired to do this to solve two major problems: 

1) In the digital age, we're following so many people on social media sites such as Twitter that we're unable to manually keep up with everyone we care about

2) Mental health issues are on the rise (especially on college campuses and among youth), and bullying has become very prevalent on social media

We wanted to solve these problems by automating the process of checking up on your friends. 

## What it does

Sweet Tweetment finds all of the people you follow, and searches for whether you should reach out to them because they've been suffering in some way or are at risk in the future. Our application uses sentiment analysis to read in your friends' tweets, classify them, and suggest a means to reach out to those in need. We use machine learning make our recommendations predictive and reactive, so you can find friends at risk based on current trends, or friends who have already experienced some traumatic events. Our app can also identify whether your friends are being bullied, and can direct you to tools to help them to #HackHarrassment. You can even create an account, and tweet your friends to check up on them right form the website!

## How we built it

The frontend is built with AngularJS, HTML, and CSS. The user can log in to their twitter account through our site which uses the Twitter API and OAuth to return a list of all the people they are following. They can select all friends who they would like to check up on (for harassment and well-being).  

The backend is built in Node Express, and uses the Twitter API to get lists of followers and recent tweets. This data is source dto IBM Watson's (Bluemix) emotional analysis platform (Alchemy API) to determine how sad or aggressive the messages were. Based on the emotional analysis, each tweet is scored and this information is fed through a machine learning linear regression framework to predict how sad their subsequent posts will be (i.e. the future emotional state of the user), and gather how sad posts have been on average previously.

A similar process is used to determine online harassment. The tweets that are sent to their friends are emotionally analyzed for the anger sentiment and if an overwhelming amount of their tweets are classified as being “angry or aggressive” (based on the emotional analysis results), the friend is classified as being a target of online bullying.

The app is hosted using Linode.

## Challenges we ran into
You can run the same code and have it stop working.

## Accomplishments that we're proud of
-Empowering people to help their friends in need
-Helping create new avenues to find and stop bullying

## What we learned
You can run the same code and have it stop working!

## What's next for tweethacks
We're hoping to have users log into the website once, and send them emails whenever any of their friends appears to be struggling in any way to make Sweet Tweetment even more user friendly!
