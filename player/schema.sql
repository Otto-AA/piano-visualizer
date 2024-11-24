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
  created_by INT NOT NULL REFERENCES users (id),
  background_color TEXT NOT NULL, /* format: #1234fd */
  tick_gradient TEXT NOT NULL, /* format: #1234fd,#4321df,#ffffff */
  tick_width INT NOT NULL CHECK(tick_width > 0),
  piano_border_white BOOLEAN NOT NULL,
  piano_border_black BOOLEAN NOT NULL,
  piano_border_color TEXT NOT NULL,
  key_pressed_color TEXT NOT NULL,
  font_color TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS images (
  design_id INTEGER NOT NULL,
  image_file_name TEXT NOT NULL,
  image_creator TEXT NOT NULL,
  image_link TEXT NOT NULL,
  FOREIGN KEY (design_id) REFERENCES designs (id),
  UNIQUE (image_file_name)
);

CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  type TEXT CHECK (type in ('composition', 'improvisation', 'cover')) NOT NULL,
  design_id INTEGER REFERENCES designs (id) NOT NULL,
  created_by INTEGER REFERENCES users (id) NOT NULL,
  /* TODO: Composer (extra table?)*/
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  song_creation DATE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE (created_by, file_name)
);

CREATE TRIGGER IF NOT EXISTS songs_updated_at AFTER UPDATE ON songs
BEGIN
  UPDATE songs SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS designs_updated_at AFTER UPDATE ON designs
BEGIN
  UPDATE designs SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS song_files (
  song_id INTEGER NOT NULL,
  type TEXT CHECK (type in ('mp3', 'mid', 'pdf')) NOT NULL,
  PRIMARY KEY (song_id, type),
  FOREIGN KEY (song_id) REFERENCES songs (id)
    ON DELETE CASCADE 
);
