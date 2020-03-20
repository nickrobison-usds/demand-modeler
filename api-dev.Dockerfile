FROM golang:latest

COPY . /home/src
WORKDIR /home/src

RUN apt-get update
RUN apt-get install unzip postgis curl -y

RUN go build .

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["./demand-modeling"]
