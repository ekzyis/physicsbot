FROM python:3.8-slim-buster

# all following commands will be run in this directory
WORKDIR /physicsbot
# copy all files from physicsbot repository into the docker container
COPY . .
# install python modules
RUN pip install -r requirements.txt
# run bot with development config
CMD ["python", "/physicsbot/src/main.py", "run", "--config", "dev.config.yml"]