FROM golang:latest

COPY . /home/src
WORKDIR /home/src

RUN apt-get update
RUN apt-get install unzip postgis curl -y

RUN go build
RUN go install

CMD ["usafacts"]
