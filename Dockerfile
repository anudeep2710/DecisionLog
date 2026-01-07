# Use official Python runtime
FROM python:3.9-slim

# Set working directory in the container
WORKDIR /app

# Copy the backend directory contents into /app/backend
COPY backend/ ./backend/

# Install system dependencies (needed for psycopg2)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Change working directory to where main.py is
WORKDIR /app/backend

# Make port 8000 available
EXPOSE 8000

# Define environment variable (Railway overrides PORT, but good default)
ENV PORT=8000

# Run uvicorn server
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
