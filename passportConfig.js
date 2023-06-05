const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig.js");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (name, password, done) => {
    //console.log(name, password);
    pool.query(
      `SELECT * FROM users WHERE name = $1`,
      [name],
      (err, results) => {
        if (err) {
          throw err;
        }
        //console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0];

          if (password === user.password) {         
            if (err) {
              console.log(err);
            }
            return done(null, user);
          }else{
              //password is incorrect
              //console.log(typeof password);
              //console.log(typeof user.password);
              return done(null, false, { message: "Senha incorreta. Tente Novamente!" });
          }
        } else {
          // No user
          return done(null, false, {
            message: "Nome de usuário inexistente."
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "name", passwordField: "password" },
      authenticateUser
    )
  );
  // Stores user details inside session. serializeUser determines which data of the user
  // object should be stored in the session. The result of the serializeUser method is attached
  // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
  //   the user id as the key) req.session.passport.user = {id: 'xyz'}
  passport.serializeUser((user, done) => done(null, user.id));

  // In deserializeUser that key is matched with the in memory array / database or any data resource.
  // The fetched object is attached to the request object as req.user

  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM users WHERE id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      //onsole.log(`ID is ${results.rows[0].id}`);
      return done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;
