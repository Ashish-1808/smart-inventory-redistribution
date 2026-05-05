const bcrypt = require("bcryptjs");

const db = require("../../config/database");
const jwt = require("jsonwebtoken");

const login = async ({ email, password }) => {
  const query = `
    select id,email,password
    from users
    WHERE email= $1
    `;

  const { rows } = await db.query(query, [email]);
  if (rows.length == 0) {
    return null;
  }

  const user = rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }
  //Generate jwt -- after authentication
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
  return {
    token,
    user: { id: user.id, email: user.email },
  };
};

const signup = async ({ firstName, lastName, email, mobileNo, password }) => {
  //1.hash the password
  const hashPassword = await bcrypt.hash(password, 10);
  // console.log(hashPassword);

  //2.Insert the user in the database
  const query = `INSERT INTO users(first_name,last_name,email,mobile_no,password) 
                VALUES ($1,$2,$3,$4,$5)
                RETURNING id,first_name,last_name,email,mobile_no`;

  const values = [firstName, lastName, email, mobileNo, hashPassword];

  const { rows } = await db.query(query, values);
  return rows[0];
};
module.exports = {
  login,
  signup,
};
