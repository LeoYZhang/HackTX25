import { Request, Response } from 'express';
import { User, IUser } from '../models/User';

// Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, points, mindmap } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
      return;
    }

    // Create new user
    const newUser = new User({
      username,
      password,
      points: points || 0,
      mindmap: mindmap || {}
    });

    const savedUser = await newUser.save();
    
    // Remove password from response
    const userResponse = {
      id: savedUser._id,
      username: savedUser.username,
      points: savedUser.points,
      mindmap: savedUser.mindmap,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password field
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id, { password: 0 }); // Exclude password field
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user by username
export const getUserByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username }, { password: 0 }); // Exclude password field
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user by ID
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, password, points, mindmap } = req.body;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if username is being changed and if it already exists
    if (username && username !== existingUser.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: id } });
      if (usernameExists) {
        res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
        return;
      }
    }

    // Prepare update object
    const updateData: Partial<IUser> = {};
    if (username) updateData.username = username;
    if (password) updateData.password = password;
    if (points !== undefined) updateData.points = points;
    if (mindmap !== undefined) updateData.mindmap = mindmap;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Remove password from response
    const userResponse = {
      id: updatedUser!._id,
      username: updatedUser!.username,
      points: updatedUser!.points,
      mindmap: updatedUser!.mindmap,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete user by ID
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        id: deletedUser._id,
        username: deletedUser.username
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Login user (verify password)
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
      return;
    }

    // Find user and include password for comparison
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      points: user.points,
      mindmap: user.mindmap,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userResponse
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
