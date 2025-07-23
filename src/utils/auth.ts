import { User } from 'firebase/auth';

export const ownerUsernames = [
  'arunshekhram',
  'ashishkrs1977',
  'shubham229177',
  'demo',
  'avisiktapalofficial2006',
];

export const isOwner = (user: User | string | null): boolean => {
  if (!user) return false;
  
  let username = '';
  
  if (typeof user === 'string') {
    // Handle case where user is a string (could be email or username)
    username = user.includes('@') ? user.split('@')[0] : user;
  } else if (user && typeof user === 'object' && 'email' in user) {
    // Handle Firebase User object
    username = user.email ? user.email.split('@')[0] : '';
  }
  
  console.log(`Checking if user is owner - input: ${user}, extracted username: ${username}, isOwner: ${ownerUsernames.includes(username)}`);
  return ownerUsernames.includes(username);
};
