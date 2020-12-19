FROM python:3.8-slim-buster

# all following commands will be run in this directory
WORKDIR /physicsbot
# copy all files from physicsbot repository into the docker container
# ( see .dockerignore for excluded files )
COPY . .
# install python modules
RUN pip install -r requirements.txt

# create the file to ensure it is NOT a directory (volume mounting create directories by default)
RUN touch role-dist.yml

# must be set during image build with --build-arg=$(git rev-parse --short HEAD)
ARG GIT_COMMIT=unset

ENTRYPOINT ["python", "/physicsbot/src/main.py"]
# default arguments: run bot in development mode
CMD ["run", "--config", "dev.config.yml"]
