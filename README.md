# Installing

Run `pip install -r requirements.txt`.

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