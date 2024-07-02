# Dockerfile
# STEP 1: Install and configure Yarn
FROM node:20.10.0 AS build

WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", ".yarnrc.yml", "yarn.lock", "./"]
RUN yarn

# Step 2: Build app
COPY . .
RUN yarn build

FROM joseluisq/static-web-server:latest as prod
COPY --from=build /usr/src/app/dist /public
COPY ./static-web-server.toml /config.toml
ENV SERVER_CONFIG_FILE=/config.toml
EXPOSE 80