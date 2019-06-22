# Instructions
## Create .env
create a .env file in the root folder that contains
```PORT=3000``` and ```DATABASE_URL=insert your postgres url```
## Create a Database
create a postgres database.
## Create a datatable
```CREATE TABLE users(ID SERIAL PRIMARY KEY, userid VARCHAR(255) NOT NULL, email VARCHAR(100) NOT NULL, firstname VARCHAR(100) NOT NULL, lastname VARCHAR(100) NOT NULL, age integer NOT NULL);```
# Start
type ```npm run start_local``` in the terminal/console.
