import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  // Ye line teri .env file se secret key uthayegi
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token 30 din tak valid rahega
  });
};

export default generateToken;