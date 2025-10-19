import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
  deleteUser,
  loginUser,
  changeUsername,
  changePassword,
  clearMindmap
} from '../controllers/userController';

const router = Router();

// User routes
router.post('/users', createUser);           // Create a new user
router.get('/users', getAllUsers);           // Get all users
router.get('/users/:id', getUserById);       // Get user by ID
router.get('/users/username/:username', getUserByUsername); // Get user by username
router.put('/users/:id', updateUser);        // Update user by ID
router.delete('/users/:id', deleteUser);     // Delete user by ID
router.post('/users/login', loginUser);      // Login user

// User management routes
router.put('/users/:id/username', changeUsername);  // Change username
router.put('/users/:id/password', changePassword);  // Change password
router.delete('/users/:id/mindmap', clearMindmap);  // Clear mindmap

export default router;
