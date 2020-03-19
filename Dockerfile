FROM golang:latest

COPY . /home/src
WORKDIR /home/src

ARG REACT_APP_API_URI="https://fearless-dreamer.nickrobison.com"

RUN apt-get update
RUN apt-get install unzip postgis curl -y
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN apt-get install nodejs
RUN npm install -g yarn

RUN cd ui/ && yarn install && yarn run build

RUN go build .

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["./demand-modeling"]
