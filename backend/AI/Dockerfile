FROM python:3.6


RUN mkdir /AI
RUN mkdir /AI/data
RUN mkdir /AI/models
RUN mkdir /AI/tmp

RUN useradd -ms /bin/bash mini

# install libraries
COPY requirements.txt /AI
COPY script.py /AI
WORKDIR /AI

RUN chown -R mini:mini /AI

RUN pip3 install -r requirements.txt

USER mini

CMD ["/bin/bash"]

