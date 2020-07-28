//database connection
const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'midterm'
});

// Remove properties and users

// const properties = require('./json/properties.json');
// const users = require('./json/users.json');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool.query(`
  SELECT * FROM users
  WHERE email = $1;
  `, [email])
  .then(res => res.rows[0]);
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(`
  SELECT * FROM users
  WHERE u_id = $1
  `, [id])
  .then(res => res.rows[0]);
}
exports.getUserWithId = getUserWithId;


/**
 *
 * Getting favourites for a user
 *
 */
const getFavouritesFor = function(id) {
  return pool.query(`
  SELECT p.property_id,owner_id,title,description,photo_url_1,photo_url_2,photo_url_3,photo_url_4,price,parking_spaces,number_of_bathrooms,number_of_bedrooms,street,city,province,post_code,sold,photo_url_5
  FROM properties as p
  JOIN favourites as f ON f.property_id = p.property_id
  WHERE f.u_id = $1
  `, [id])
  .then(res => res.rows[0]);
}
exports.getFavouritesFor = getFavouritesFor;



/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool.query(`
  INSERT INTO users (
    name, email, password
  ) VALUES ($1, $2, $3)
  RETURNING *
  `, [user.name, user.email, user.password])
  .then(res => res.rows[0]);
}
exports.addUser = addUser;



/**
 *
 * Add a property as a favourite for a specific user
 *
 */
const addtoFavourites =  function(u_id, property_id) {
  return pool.query(`
  INSERT INTO favourites (
    u_id, property_id
  ) VALUES ($1, $2)
  RETURNING *
  `, [u_id, property_id])
  .then(res => res.rows[0]);
}
exports.addtoFavourites = addtoFavourites;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
   // 1
   const queryParams = [];
   // 2
   let queryString = `
   SELECT properties.*, avg(property_reviews.rating) as average_rating
   FROM properties
   LEFT JOIN property_reviews ON properties.id = property_id
   WHERE 1 = 1
   `;

   // 3
   if (options.city) {
     queryParams.push(`%${options.city}%`);
     queryString += ` AND city LIKE $${queryParams.length} `;
   }

   if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += ` AND owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`);
    queryString += ` AND cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}`);
    queryString += ` AND cost_per_night <= $${queryParams.length} `;
  }

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += ` AND rating >= $${queryParams.length} `;
  }


   // 4
   queryParams.push(limit);
   queryString += `
   GROUP BY properties.id
   ORDER BY cost_per_night
   LIMIT $${queryParams.length};
   `;

   // 5
   console.log(queryString, queryParams);

   // 6
   return pool.query(queryString, queryParams)
   .then(res => res.rows)
   .catch(res => console.log(res));
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  return pool.query(`
  INSERT INTO properties (
  owner_id,
  title,
  description,
  thumbnail_photo_url,
  cover_photo_url,
  cost_per_night,
  parking_spaces,
  number_of_bathrooms,
  number_of_bedrooms,
  country,
  street,
  province,
  post_code,
  active
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
  RETURNING *
  `, [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms, property.country, property.street, property.city, property.province, property.post_code, true])
  .then(res => res.rows[0])
  .catch(res => (console.log(res)));
}
exports.addProperty = addProperty;


//Messages/////

const getMessages = function(userId) {
  return pool.query(`
  SELECT * FROM messages
  WHERE receiver_id = $1;
  `, [userId])
  .then(res => res.rows[0]);
}
exports.getMessages = getMessages;
