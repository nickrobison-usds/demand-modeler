FROM golang:latest

COPY . /home/src
WORKDIR /home/src

RUN go build .

ENTRYPOINT ./demand-modeling
