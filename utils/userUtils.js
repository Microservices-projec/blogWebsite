const db = require('../databases/db');

const User = {
  findOrCreate: (profile, callback) => {
    const { id, displayName, emails, photos } = profile;
    const email = emails[0].value;
    const avatar = photos[0].value;
    
    // Check if user exists
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
      if (err) return callback(err);
      
      if (results.length > 0) {
        return callback(null, results[0]);
      } else {
        // Create new user
        db.query(
          'INSERT INTO users (id, displayName, email, avatar) VALUES (?, ?, ?, ?)',
          [id, displayName, email, avatar],
          (err, result) => {
            if (err) return callback(err);
            callback(null, { id, displayName, email, avatar });
          }
        );
      }
    });
  }
};

module.exports = User;