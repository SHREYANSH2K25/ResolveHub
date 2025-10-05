// ROLE BASED ACCESS CONTROL - permission checking

const authorize = (roles = []) => {
    if(typeof roles === 'string') {
        roles = [roles];
    }

    return (req , res, next) => {
        // check if the authenticated user's role (attached by auth MW) is not included in the array of allowed roles for this routes
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({msg : 'Access forbidden'});
            
        }
        next();
    }
}

export default authorize;
