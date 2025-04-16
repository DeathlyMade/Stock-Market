FROM python:3.10-slim-bullseye

# Install dependencies and clean up APT caches
RUN apt-get update && \
    apt-get install -y --no-install-recommends --no-install-suggests \
        build-essential \
        pkg-config \
        netcat \
        default-libmysqlclient-dev \
        nodejs \
        npm && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --no-cache-dir --upgrade pip

# Set the working directory to /app
WORKDIR /app

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install -r requirements.txt

# Copy package.json (and package-lock.json if available) and install node modules
COPY package.json /app/
RUN npm install

# Copy the entire project code into the container
COPY . /app/

# Change working directory to the StockMarket folder
WORKDIR /app/StockMarket

# Run Django migrations
RUN python manage.py makemigrations && python manage.py migrate

# Expose the port the app runs on
EXPOSE 8000

# Run the Django development server binding to all interfaces
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
