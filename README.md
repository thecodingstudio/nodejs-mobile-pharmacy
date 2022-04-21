# Mobile Pharmacy App Backend
 
API end-points for `Mobile Pharmacy` App.
- [AWS](http://ec2-35-174-166-20.compute-1.amazonaws.com)
- [Herou](https://mobile-pharmacy.herokuapp.com/)

## Installation

Mobile Pharmacy App requires [Node.js](https://nodejs.org/) v17+ to run.

Config `.env` and `firebase-config.json` setup.

```sh
type nul > .env
```
- Download `firebase-config.json` from your firebase account and put it root directory in project.
- Witre production environments in `.env`.

Production environments...

```sh
ACCESS_TOKEN_SECRET = "<YOUR_SECRE_KEYT>"
REFRESH_TOKEN_SECRET = "<YOUR_SECRE_KEYT>"
ACCESS_TOKEN_LIFE = "<ENTER_EXPIRY_TIME>"
REFRESH_TOKEN_LIFE = "<ENTER_EXPIRY_TIME>"
DATABASE_NAME = "<MYSQL_DATABASE_NAME>"
DATABASE_PASSWORD = "<MYSQL_DATABASE_PASSWORD>"
USER_NAME = "<MYSQL_DATABASE_USER_NAME>"
HOST_NAME = "<MYSQL_DATABASE_HOST_NAME>"
STRIPE_SK = "<YOUR_STRIPE_SECRET_KEY>"
FIREBASE_DATABASE_URL = "<YOUR_FIREBASE_DATABASE_URL>"
```

Install the dependencies and devDependencies and start the server.
```sh
cd Mobile-Pharmacy
npm install
npm start
```

##  Deployment : Heroku

- Pre-requirement:
    - MySQL database must be deployed.
    - Git repository must be already exist.
- Install the Heroku CLI.
- Download and install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).
- If you haven't already, log in to your Heroku account and follow the prompts to create a new SSH public key.
     ```sh
    $ heroku login
    ```
- Clone the repository.
- Use Git to clone e-commerce-tcs's source code to your local machine.
    ```sh
    $ heroku git:clone -a e-commerce-tcs 
    $ cd e-commerce-tcs
    ```
- Deploy your changes
- Make some changes to the code you just cloned and deploy them to Heroku using Git.
    ```sh
    $ git add .
    $ git commit -am "make it better"
    $ git push heroku master
    ```
