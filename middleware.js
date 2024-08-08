const loggingMiddleware = (req, res, next) => {
  const currentTime = new Date().toUTCString();
  const authenticated = req.session.user ? 'Authenticated User' : 'Non-Authenticated User';
  console.log(`[${currentTime}]: ${req.method} ${req.originalUrl} (${authenticated})`);
  if (req.path === '/') {
    if (req.session.user) {
      const redirectPath = req.session.user.role === 'admin' ? '/admin' : '/schedule';
      return res.redirect(redirectPath);
    } else {
      return res.redirect('/login');
    }
  }
  next();
};

export const loginRedirectMiddleware = (req, res, next) => {
  if (req.session.user) {
    console.log('User is already logged in');
    const redirectPath = req.session.user.role === 'admin' ? '/admin' : '/schedule';
    return res.redirect(redirectPath);
  }
  next();
};

export const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

export const adminAuthMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  if (req.session.user.role !== 'admin') {
    return res.status(403).render('error', { message: 'You do not have permission to view this page.', userPage: true });
  }

  next();
};

export default loggingMiddleware;
