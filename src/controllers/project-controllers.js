import { User } from "../models/user-models.js";
import { Project } from "../models/project-models.js";
import { ProjectMember } from "../models/project-member-models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";
import { response } from "express";

const getProject = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "projectmembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectmembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "projects",
    },
    {
      $project: {
        project: {
          _id: "$projects._id",
          name: "$projects.name",
          description: "$projects.description",
          members: "$projects.members",
          createdAt: "$projects.createdAt",
          createdBy: "$projects.createdBy",
        },
        role: 1,
        _id: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});
const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched Successfully"));
});
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });
  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project created successfully"));
});
const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;
  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    { new: true },
  );
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});
const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findByIdAndDelete(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project deleted successfully"));
});
const addMemberToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const { projectId } = req.params;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  await ProjectMember.findByIdAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role: role,
    },
    {
      new: true,
      upsert: true,
    },
    re,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project Member added successfully"));
});
const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const projectMembers = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: {
          $arrayElemAt: ["$user", 0],
        },
      },
    },
    {
      $project: {
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMembers,
        "Project Members fetched successfully",
      ),
    );
});
const updateMemberRoles = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;
  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, "User role does not exist");
  }
  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });
  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }
  projectMember = await ProjectMember.findByIdAndUpdate(
    projectMember._id,
    {
      role: newRole,
    },
    { new: true },
  );
  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, projectMember, "Project Member role updated"));
});
const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });
  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }
  projectMember = ProjectMember.findByIdAndDelete(projectMember._id);
  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }
  return res.status(200).json(200, {}, "Project member deleted Successfully");
});

export {
  getProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
  getProjectMembers,
  updateMemberRoles,
  deleteMember,
};
