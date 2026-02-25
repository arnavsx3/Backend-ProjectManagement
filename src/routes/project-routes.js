import { Router } from "express";
import { verifyJWT } from "../middlewares/auth-middleware.js";
import { validateProjectPermission } from "../middlewares/permission-middleware.js";
import {
  getProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
  getProjectMembers,
  updateMemberRoles,
  deleteMember,
} from "../controllers/project-controllers.js";
import {
  createProjectValidator,
  addMemberToProjectValidator,
} from "../validators/project-validators.js";
import { validate } from "../middlewares/validator-middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { authRouter } from "./auth-routes.js";

const projectRouter = Router();
projectRouter.use(verifyJWT);

projectRouter
  .route("/")
  .get(getProject)
  .post(createProjectValidator(), validate, createProject);

projectRouter
  .route("/:projectId") // This projectId should be same as req.params holding variable
  .get(validateProjectPermission(AvailableUserRole), getProjectById)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createProjectValidator(),
    validate,
    updateProject,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject);

projectRouter
  .route("/:projectId/members/") // : => params
  .get(getProjectMembers)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addMemberToProjectValidator(),
    validate,
    addMemberToProject,
  );

projectRouter
  .route("/:projectId/members/:userId")
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRoles)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN], deleteMember));
export { projectRouter };
