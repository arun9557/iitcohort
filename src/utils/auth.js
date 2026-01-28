
export const isOwner = (user) => {
    // If we have a user object with email
    if (user && user.email) {
        const email = user.email.toLowerCase();
        return email.startsWith('arun') || email.startsWith('admin');
    }

    // If we have a username string
    if (typeof user === 'string') {
        const username = user.toLowerCase();
        return username.startsWith('arun') || username.startsWith('admin');
    }

    return false;
};

export const getUserRole = (user) => {
    return isOwner(user) ? 'admin' : 'member';
};
