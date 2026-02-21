import { Project } from "../models/project-models.js";
import { User } from "../models/user-models.js";
import { ProjectMember } from "../models/project-member-models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";

const validateProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    if (!projectId) {
      throw new ApiError(400, "Project iD is missing");
    }
    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });
    if (!projectId) {
      throw new ApiError(400, "Project iD is missing");
    }
    const givenRole = project?.role;
    req.user.role = givenRole;
    if (!roles.includes(givenRole)) {
      throw new ApiError(403, "Unauthorized permission to perform this action");
    }
    next();
  });
};

export { validateProjectPermission };
