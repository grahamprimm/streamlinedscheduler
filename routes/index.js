import authRoutes from './auth_routes.js';
import { authMiddleware, adminAuthMiddleware, loginRedirectMiddleware } from '../middleware.js';

const constructorMethod = (app) => {
  app.use('/register', loginRedirectMiddleware);
  app.use('/login', loginRedirectMiddleware);
  app.use('/schedule', authMiddleware);
  app.use('/admin', adminAuthMiddleware);
  app.use('/logout', authMiddleware);

  app.use('/', authRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

export default constructorMethod;
