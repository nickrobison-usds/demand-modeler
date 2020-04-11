FROM golang:latest

RUN apt-get update
RUN apt-get install unzip postgis curl -y

COPY . /home/src
WORKDIR /home/src

RUN go build .

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["./demand-modeling"]
