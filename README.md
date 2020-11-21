# physicsbot

###  Deployment

1. Build docker image:

```
docker build -t physicsbot .
```

2. Run docker image with reaction message data mounted:

```
docker run \
  --detach \
  -v $(pwd)/role-dist.yml:/physicsbot/role-dist.yml \
  --name physicbot \
  physicsbot
```

If you need to run a different config:

```
docker run \
  --detach \
  -v ~/logs:/physicsbot/logs \
  --name physicsbot-hd \
  physicsbot run --config hd.config.yml
```
