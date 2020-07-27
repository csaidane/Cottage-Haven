DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS favourites CASCADE;


CREATE TABLE users (
  user_id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE admins (
  admin_id SERIAL PRIMARY KEY NOT NULL REFERENCES users(user_id),
);


CREATE TABLE properties (
  property_id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES admins(admin_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  photo_url_1 VARCHAR(255) NOT NULL,
  photo_url_2 VARCHAR(255),
  photo_url_3 VARCHAR(255),
  photo_url_4 VARCHAR(255),
  photo_url_5 VARCHAR(255),
  price INTEGER  NOT NULL,
  parking_spaces INTEGER  NOT NULL DEFAULT 0,
  number_of_bathrooms INTEGER  NOT NULL DEFAULT 0,
  number_of_bedrooms INTEGER  NOT NULL DEFAULT 0,
  --Other kinds of values we may consider: Garden: boolean
  --appartment unit number ? Floor ?
  --retain any information about the neighborhood ?
  --Noise level, Public transport, AC, Balcony, pools, Storage?
  country VARCHAR(255) NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  post_code VARCHAR(255) NOT NULL,
  sold BOOLEAN NOT NULL DEFAULT FALSE
);


CREATE TABLE messages (
  id SERIAL PRIMARY KEY NOT NULL,
  sender_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT,
  sent_date TIMESTAMP,
);

CREATE TABLE favourites (
  PRIMARY KEY (user_id, property_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

