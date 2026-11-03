---
title: App
description: What Kuutti is and is not - free, without ads, every account a real person, and built in the open.
nav: 3
---

Kuutti is a free app for meeting people and forming relationships, made in Finland 🇫🇮 for Finland 🇫🇮. It is made by an association, not a company, and it is built so that it works best when you stop needing it.

Kuutti is in development, in public: the source code and the work in progress are at [github.com/kuutti-ry/kuutti-app](https://github.com/kuutti-ry/kuutti-app). It comes to the App Store and Google Play first as a beta.

## How it works

1. **Sign in with your bank.** Kuutti is for adults, and every account is one real person. Your bank confirms who you are and nothing else: Kuutti sees nothing of your account or your money.
2. **Say who you are and whom you seek.** Your gender as you see it, whom you are looking for and at what ages, where you live, what you want to tell about yourself, and your photos.
3. **One round a day.** Each day Kuutti shows you people one at a time, the nearest first, and you decide about each of them with a button, never with a swipe. Distance is said in bands, never in kilometres.
4. **A match opens a conversation.** When you both like each other, you can write to each other. Nobody gets your contact details before a match, and your photos stay inside Kuutti.
5. **Leave when you have found somebody.** You can tell Kuutti that you found somebody, take a break, or delete your account. Nothing holds you back.

## What it is

**Free.** There is no subscription, nothing to buy inside the app, and no paid way to be seen more than somebody else.

**Without ads.** Kuutti shows no advertising and carries no advertiser's code. The association's bylaws forbid selling ad space.

**One real person behind every account.** You sign in with a Finnish bank's identification, the same strong identification you use for public services. One person has one account, and it is for adults. A ban holds, because it is the person who is banned and not an email address.

**Not a feed.** There is nothing to scroll without end. Kuutti gives no scores to people, keeps no streaks and sends no notifications whose purpose is to bring you back.

**Open source.** Everything Kuutti runs on is published under the GNU Affero General Public License. Anybody can read how it works, and whoever changes it has to publish the changes too.

**Yours to leave.** You can download everything Kuutti holds about you, and you can delete your account in the app. [How deletion works](/delete-account/).

## Keeping people safe

Everybody you meet on Kuutti is an adult whom a bank has identified. On top of that:

- **Photos are checked.** An automatic check rejects a photo it is sure of and tells you why; what it is unsure of goes to a person.
- **You can block and report**, from a card or a conversation. A block holds both ways, and it stays even if either of you deletes an account and comes back. A report is a block and also goes to the association's moderators. The other person learns of neither.
- **Moderators answer for what they do.** What they did and saw is logged, and the log is kept for five years.
- **Where you live stays coarse.** Somebody in a small place is shown under a larger area, so that a card does not give them away.

## What it keeps about you, in short

Kuutti never stores your personal identity code, your name, your legal sex or your date of birth. It keeps the year and month of your birth, a code computed from your identity code that cannot be turned back into it, a record of your identification (which bank, and when), what you tell about yourself, and your photos, from which the location and the camera's data are removed before they are saved.

The whole of it is in the [privacy policy](/legal/privacy/).

## Research

Loneliness and relationships are studied too little with data that people gave knowingly. If you say yes, and only then, events about how you use Kuutti are kept under a separate identifier for researchers. They never contain what you wrote to anybody, and you can withdraw at any time. [How research works in Kuutti](/research/).

## How it is built

Kuutti is built by volunteers, in the open, in one public repository.

- The app runs on iPhone and Android and is written in TypeScript with React Native and Expo.
- The server is written in TypeScript as well, and keeps its data in PostgreSQL.
- The servers, the database and the photos are in the European Union, in Frankfurt.
- Identification goes through the Finnish Trust Network, by way of Telia's identification service.
- The app speaks Finnish, Swedish and English, follows the text size and contrast you have chosen on your phone, and every decision in it is a button, not a swipe.

The source, the decisions and the open questions are at [github.com/kuutti-ry/kuutti-app](https://github.com/kuutti-ry/kuutti-app).
