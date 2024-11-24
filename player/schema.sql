CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin (
  id INTEGER UNIQUE NOT NULL,
  FOREIGN KEY (id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS design (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS song (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  type TEXT CHECK (type in ('composition', 'improvisation', 'cover')) NOT NULL,
  design INTEGER REFERENCES design (id) NOT NULL,
  created_by INTEGER REFERENCES user (id) NOT NULL,
  /* TODO: Composer (extra table?)*/
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  song_creation DATE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE (created_by, file_name)
);

CREATE TABLE IF NOT EXISTS song_file (
  song_id INTEGER REFERENCES songs (id) NOT NULL,
  type TEXT CHECK (type in ('mp3', 'mid', 'pdf')) NOT NULL,
  PRIMARY KEY (song_id, type)
);
