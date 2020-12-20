# physicsbot

### Deployment

Every merge into master will trigger a deploy using Github Actions. A deploy is done like this:

1. Build docker image:

```
docker build --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) -t physicsbot:master .
```

2. Run docker image with reaction message data mounted:

```
docker run -d -v $(pwd)/role-dist.yml:/physicsbot/role-dist.yml --name physicbot physicsbot:master
```

Make sure that role-dist.yml does exist on the host machine! If not, just use `touch role-dist.yml` before using the docker command else docker will try to mount a directory onto a file.
