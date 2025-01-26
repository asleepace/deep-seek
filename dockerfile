# Initalize base image
FROM ollama/ollama
EXPOSE 11434
ENV OLLAMA_HOST=0.0.0.0
VOLUME /root/.ollama
