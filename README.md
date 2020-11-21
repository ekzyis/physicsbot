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

(Make sure that role-dist.yml does exist on the host machine! If not, just use `touch role-dist.yml`
before using the docker command else docker will try to mount a directory onto a file.)
