const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (request, h, pool) => {
  const { username, email, password } = request.payload;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [resultData] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    return h.response({ message: 'User registered successfully'}).code(201);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Registration failed' }).code(500);
  }
};

const loginUser = async (request, h, pool) => {
  const { email, password } = request.payload;
  try {
    const [resultData] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (resultData.length === 0) {
      return h.response({ error: 'No user found' }).code(401);
    }

    const user = resultData[0];

    if (!user.password) {
        return h.response({ error: 'No password found for this user' }).code(401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return h.response({ error: 'Invalid password' }).code(401);
    }

    const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
    return h.response({ message: 'Login successful', token, user }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Login failed' }).code(500);
  }
};

module.exports = { registerUser, loginUser };
