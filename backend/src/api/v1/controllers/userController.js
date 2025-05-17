// src/api/v1/controllers/userController.js
import User from "../../../models/schemas/userModel.js";
import Role from "../../../models/schemas/roleModel.js";
import AppError from "../../../utils/errors/AppError.js";

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.userId || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update current user profile
export const updateProfile = async (req, res, next) => {
  try {
    // Fields that users can update
    const allowedUpdates = {
      name: req.body.name,
    };

    // Remove undefined fields
    Object.keys(allowedUpdates).forEach(
      (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    // If no valid updates, return error
    if (Object.keys(allowedUpdates).length === 0) {
      return next(new AppError("No valid fields to update", 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        id: updatedUser.userId || updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password -refreshToken");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map((user) => ({
        id: user.userId || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get single user by ID (admin only)
export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let user;

    // Check if the ID is numeric (potentially a userId) or a valid ObjectId
    if (/^\d+$/.test(userId)) {
      // It's a numeric ID, try to find by userId
      user = await User.findOne({ userId: parseInt(userId) }).select(
        "-password -refreshToken"
      );
    } else {
      // Try to find by MongoDB _id
      try {
        user = await User.findById(userId).select("-password -refreshToken");
      } catch (err) {
        // If invalid ObjectId format
        return next(new AppError("Invalid user ID format", 400));
      }
    }

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.userId || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new user (admin only)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email already in use", 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.userId || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user by ID (admin only)
// Update user by ID (admin only)
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { name, email, role } = req.body;

    // Fields that can be updated
    const allowedUpdates = {};
    if (name !== undefined) allowedUpdates.name = name;
    if (email !== undefined) allowedUpdates.email = email;
    if (role !== undefined) allowedUpdates.role = role;

    // If no valid updates, return error
    if (Object.keys(allowedUpdates).length === 0) {
      return next(new AppError("No valid fields to update", 400));
    }

    // Check if email exists (if trying to update email)
    if (email) {
      const existingUser = await User.findOne({ email });
      if (
        existingUser &&
        existingUser._id.toString() !== userId &&
        existingUser.userId != userId
      ) {
        return next(new AppError("Email already in use", 400));
      }
    }

    let updatedUser;

    // Check if the ID is numeric (potentially a userId) or a valid ObjectId
    if (/^\d+$/.test(userId)) {
      // It's a numeric ID, try to update by userId
      updatedUser = await User.findOneAndUpdate(
        { userId: parseInt(userId) },
        allowedUpdates,
        { new: true, runValidators: true }
      ).select("-password -refreshToken");
    } else {
      // Try to update by MongoDB _id
      try {
        updatedUser = await User.findByIdAndUpdate(userId, allowedUpdates, {
          new: true,
          runValidators: true,
        }).select("-password -refreshToken");
      } catch (err) {
        // If invalid ObjectId format
        return next(new AppError("Invalid user ID format", 400));
      }
    }

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        id: updatedUser.userId || updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete user by ID (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let user;

    // Check if the ID is numeric (potentially a userId) or a valid ObjectId
    if (/^\d+$/.test(userId)) {
      // It's a numeric ID, try to find by userId
      user = await User.findOne({ userId: parseInt(userId) });
    } else {
      // Try to find by MongoDB _id
      try {
        user = await User.findById(userId);
      } catch (err) {
        // If invalid ObjectId format
        return next(new AppError("Invalid user ID format", 400));
      }
    }

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return next(new AppError("Cannot delete your own account", 400));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: null,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get all roles (admin only)
export const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new role (admin only)
export const createRole = async (req, res, next) => {
  try {
    const { name, permissions, description } = req.body;

    // Check if role exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return next(new AppError("Role already exists", 400));
    }

    // Create role
    const role = await Role.create({
      name,
      permissions,
      description,
    });

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

// Update a role (admin only)
export const updateRole = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { permissions, description } = req.body;

    // Fields that can be updated
    const allowedUpdates = {};
    if (permissions !== undefined) allowedUpdates.permissions = permissions;
    if (description !== undefined) allowedUpdates.description = description;

    // If no valid updates, return error
    if (Object.keys(allowedUpdates).length === 0) {
      return next(new AppError("No valid fields to update", 400));
    }

    const updatedRole = await Role.findOneAndUpdate({ name }, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    if (!updatedRole) {
      return next(new AppError("Role not found", 404));
    }

    res.status(200).json({
      success: true,
      data: updatedRole,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a role (admin only)
export const deleteRole = async (req, res, next) => {
  try {
    const { name } = req.params;

    // Check if role exists
    const role = await Role.findOne({ name });
    if (!role) {
      return next(new AppError("Role not found", 404));
    }

    // Check if any users have this role
    const usersWithRole = await User.countDocuments({ role: name });
    if (usersWithRole > 0) {
      return next(
        new AppError(
          `Cannot delete role. ${usersWithRole} users have this role assigned.`,
          400
        )
      );
    }

    await role.deleteOne();

    res.status(200).json({
      success: true,
      data: null,
      message: "Role deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
