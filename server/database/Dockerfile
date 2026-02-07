FROM node:18.12.1-bullseye-slim

RUN npm install -g npm@9.1.3

ADD package.json .
ADD app.js .
ADD review.js .
ADD dealership.js .
ADD inventory.js .
ADD data/dealerships.json .
ADD data/reviews.json .
ADD data/car_records.json .
COPY . .

# Clean npm cache and reinstall to fix module corruption
RUN npm cache clean --force
RUN rm -rf node_modules
RUN npm install

EXPOSE 3030

CMD [ "node", "app.js" ]
