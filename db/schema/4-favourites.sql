DROP TABLE IF EXISTS favourites CASCADE;

CREATE TABLE favourites (
  u_id SERIAL REFERENCES users(u_id) ON DELETE CASCADE,
  property_id SERIAL REFERENCES properties(property_id) ON DELETE CASCADE,
  PRIMARY KEY (u_id, property_id)
);

