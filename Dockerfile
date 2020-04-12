FROM golang:latest

RUN apt-get update
RUN apt-get install unzip postgis curl -y

# TODO copy everything but data here
COPY . /home/src
WORKDIR /home/src

RUN go build .

# TODO copy data in here

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["./demand-modeling"]
