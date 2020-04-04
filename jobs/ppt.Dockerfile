FROM python:3

RUN pip install requests

COPY . /home/src
WORKDIR /home/src

CMD [ "python", "./daikon_export.py" ]