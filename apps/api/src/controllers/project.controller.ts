import type { CreateProjectInput, IdParam, ProjectListQuery, UpdateProjectInput } from '@ismo/shared';
import type { RequestHandler } from 'express';
import { currentUserId } from '../middleware/authenticate';
import * as projectService from '../services/project.service';

export const list: RequestHandler = async (req, res) => {
  res.json(await projectService.listProjects(currentUserId(req), req.validated.query as ProjectListQuery));
};

export const get: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as IdParam;
  res.json({ data: await projectService.getProject(currentUserId(req), id) });
};

export const create: RequestHandler = async (req, res) => {
  const project = await projectService.createProject(currentUserId(req), req.validated.body as CreateProjectInput);
  res.status(201).json({ data: project });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as IdParam;
  const project = await projectService.updateProject(currentUserId(req), id, req.validated.body as UpdateProjectInput);
  res.json({ data: project });
};

export const remove: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as IdParam;
  await projectService.deleteProject(currentUserId(req), id);
  res.status(204).end();
};
