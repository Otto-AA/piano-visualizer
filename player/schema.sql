CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER UNIQUE NOT NULL,
  FOREIGN KEY (id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS designs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  type TEXT CHECK (type in ('composition', 'improvisation', 'cover')) NOT NULL,
  design INTEGER REFERENCES designs (id) NOT NULL,
  created_by INTEGER REFERENCES users (id) NOT NULL,
  /* TODO: Composer (extra table?)*/
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  song_creation DATE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE (created_by, file_name)
);

CREATE TABLE IF NOT EXISTS song_files (
  song_id INTEGER NOT NULL,
  type TEXT CHECK (type in ('mp3', 'mid', 'pdf')) NOT NULL,
  PRIMARY KEY (song_id, type),
  FOREIGN KEY (song_id) REFERENCES songs (id)
    ON DELETE CASCADE 
);
