# INSATGRAM

## Dependencies
- Postgres database
## Development
Make sure you have postgres running and created a db called `lsatfiles`, see the `.env`file

```
go build
./lsatfiles
```


## API

| Endpoint | Request fields | JSON Response Fields | Description |
|----------|----------------|-------|-------------|
| GET `https://insatgram.getalby.com/index`  | |(array) "CreatedAt","Currency","LNAddress","Name","NrOfDownloads","Price","SatsEarned","TimeAgo","URL"| Get all uploaded files |
| GET `https://insatgram.getalby.com/assets/{filename}`|  | file content | Retrieve a file. Blurred without LSAT header, real file with LSAT |
| POST form `https://insatgram.getalby.com/upload` | file, ln_address, price | msg, url|Upload a file|


## Frontend

The frontend is a React.js APP living in the `frontend` folder.

To run a frontend build run `yarn build` in the `frontend` folder.
For ease of deployment the JS build files are in the repo.
