---
title: Our work
description: What Kuutti ry does towards its mission - a free service for meeting people, research into relationships and loneliness, an open community of volunteers, and what it publishes.
nav: 2
---

Kuutti ry works towards its mission in four ways: it builds a free service for meeting people, it prepares for research into relationships and loneliness, it keeps an open community of volunteers, and it publishes what it builds and learns. The work began in September 2026, and the association was founded on 1 October 2026 to carry it.

## A free service for meeting people

The association develops Kuutti, an app for meeting people in Finland, and will run it itself: the bylaws forbid handing the service to anybody else. There is nothing to pay for in it and no advertising, and every account is one real adult, identified through a Finnish bank.

Kuutti is in development and not open to the public yet. Built so far: signing in with a bank, the profile and the check of photos, the daily round, matches, conversations, reports and blocks, and the panel in which the association's moderators work. It is tested in an environment of its own, with invented people. What remains before the first beta in the App Store and Google Play is in the project's public [milestones](https://github.com/kuutti-ry/kuutti-app/milestones).

[How the app works](/app/).

## Research into relationships and loneliness

Supporting this research is part of the association's purpose, and its [bylaws](/legal/bylaws/) let it give money to universities and public research institutes in the European Union. Kuutti is built so that a person can choose, with a separate yes, to let events about their use of the app be kept for researchers, under an identifier of their own and without anything they wrote. The service is not open yet, so no real person's data has gone to any researcher.

[What taking part means, and how people stay anonymous](/research/).

## An open community of volunteers

Kuutti is built by volunteers, mostly alumni of Aalto University and some who study there now. The work is done in public, at [github.com/kuutti-ry](https://github.com/kuutti-ry): the code, the issues, and the reasons behind each decision. By 3 November 2026, the project had merged about 300 changes and written down more than 60 decisions. It holds the [OpenSSF Best Practices](https://www.bestpractices.dev/projects/15449) passing badge, for how an open-source project is run.

Anybody can take part:

- **Propose a feature**, through [a public form](https://github.com/kuutti-ry/kuutti-app/issues/new?template=proposal.yml). It says what Kuutti never builds.
- **Run the whole service on your own computer.** [The guide for contributors](https://github.com/kuutti-ry/kuutti-app/blob/main/CONTRIBUTING.md) sets it up in about fifteen minutes, with a stand-in for the bank.
- **Help with code, design or language.** [How to help](/support-us/#with-your-time) says what is needed, and everyone taking part follows the [code of conduct](https://github.com/kuutti-ry/kuutti-app/blob/main/CODE_OF_CONDUCT.md).

## What it publishes

What the association builds for Kuutti, it shares.

- **[tunnistus-oidc](https://github.com/kuutti-ry/tunnistus-oidc)** is a free toolkit that lets other Finnish online services sign people in with strong identification, a bank or mobile ID, through Telia's identification service. It has been [on npm](https://www.npmjs.com/package/@kuutti-ry/tunnistus-oidc) since 23 October 2026, under the MIT licence, so a public body, a non-profit or a company may use it without paying and without having to publish its own code. The association wrote it for Kuutti; it is not an official Telia product.
- **The source code** of [the app and its server](https://github.com/kuutti-ry/kuutti-app) and of [this site](https://github.com/kuutti-ry/kuutti-app-site), under the GNU Affero General Public License: anybody can read how they work, and whoever changes them has to publish the changes too.
- **[The decisions](https://github.com/kuutti-ry/kuutti-app/tree/main/docs/adr)**, each with its reasons, for other services to learn from: for example [how far a person's home may be shown](https://github.com/kuutti-ry/kuutti-app/blob/main/docs/adr/061-one-home-no-ponds.md) without giving away somebody who lives in a small place.
