import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Generates a random string and hash it with og password
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

// compares password given by user with stored password in DB
export const comparePassword = async (inputPassword, storedHash) => {
    return await bcrypt.compare(inputPassword, storedHash);
}


// generates a token to be sent to cient after a successful login
export const generateToken = (userId, userRole) => {
    const payload = {
        user : {
            id : userId,
            role : userRole
        }
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn : '1d'});
};

