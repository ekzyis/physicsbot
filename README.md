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
