FROM python:3.8.10-slim
WORKDIR /usr/local/grading
COPY requirements.txt .
RUN ["pip", "install", "-r", "requirements.txt"]
COPY . .
ENV PYTHONPATH .
