FROM golang:latest

RUN apt-get update
RUN apt-get install unzip postgis curl -y

WORKDIR /home/src
COPY . .

RUN go build .

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["./demand-modeling"]
