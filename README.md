# @intelrug/wbt-discord-bot
> BDO World Bosses Timer Discord Bot

## Requirements

* Node 10

## Deploying

Clone the repo and install the dependencies.

```bash
git clone --single-branch -b dist https://github.com/intelrug/wbt-discord-bot.git
cd wbt-discord-bot
```

```bash
yarn --frozen-lockfile --prod
```

Update configs.

```bash
cp .env.example .env
nano .env
```

Use process manager to start the application.

```bash
pm2 start yarn --name WBT -- start:prod
pm2 save
```
