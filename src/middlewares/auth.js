import jwt from 'jsonwebtoken'

const auth = (req, res, next) => {
    // Get token from custom header used by client
    const token = req.header('x-auth-token');

    if(!token) return res.status(401).json({msg : 'No token, authorization denied'});

    try {
        // /verify token using jwt_secret to check signature and expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // attach decoded user data (id and role) to request obejct
        req.user = decoded.user;
        next();
    }
    catch(err) {
        res.status(401).json({msg : 'Token is not valid'});
    }
};