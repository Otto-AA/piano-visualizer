# Installing

Run `pip install -r requirements.txt`.

# Running

1) Set the environment

```bash
export FLASK_ENV=development
export FLASK_APP=player
```

2) initialize database

```bash
flask init-db
```

3) create user

```bash
flask create-user namy passy
```

4) run server

```bash
flask run
```

# API routes

- POST      /users/newpassword
- POST      /users/login
- POST      /users/logout

- GET       /songs/{user_name}
- POST      /songs/{user_name}
- PUT       /songs/{user_name}/{song_id}
- GET       /songs/{user_name}/{song_id}
- DELETE    /songs/{user_name}/{song_id}

- PUT       /files/{user_name}/{song_id}.{ext}
- DELETE    /files/{user_name}/{song_id}.{ext}

# TODO
- link everything together properly
- song preview (-> iframe messaging with player)
- design preview (-> iframe messaging with player)
- mp3-midi offset -> save in db or fix in file

