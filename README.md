# Pharmacy-App-Backend
 
API end-points for `Pharmacy_app`.

## Installation

Pharmacy App requires [Node.js](https://nodejs.org/) v17+ to run.

Install the dependencies and devDependencies and start the server.

```sh
cd Mobile-Pharmacy
npm install
npm start
```

For setup `nodemon.json`

```sh
type nul > nodemon.json
```

For production environments...

```sh
"ACCESS_TOKEN_SECRET" = <YOUR_SECRE_KEYT>
"REFRESH_TOKEN_SECRET" = <YOUR_SECRE_KEYT>
"ACCESS_TOKEN_LIFE" = <ENTER_EXPIRY_TIME>
"REFRESH_TOKEN_LIFE" = <ENTER_EXPIRY_TIME>
"DATABASE_NAME" = <DATABASE_NAME>
"DATABASE_PASSWORD" = <DATABASE_PASSWORD>
"USER_NAME" = <DATABASE_USER_NAME>
"HOST_NAME" = <DATABASE_HOST_NAME>
"STRIPE_SK" = <YOUR_STRIPE_SECRET_KEY>
"FIREBASE_DATABASE_URL" = <YOUR_FIREBASE_DATABASE_URL>
```
