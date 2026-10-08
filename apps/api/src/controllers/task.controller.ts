import type { CreateTaskInput, IdParam, TaskListQuery, UpdateTaskInput } from '@ismo/shared';
import type { RequestHandler } from 'express';
import { currentUserId } from '../middleware/authenticate';
import * as taskService from '../services/task.service';

export const list: RequestHandler = async (req, res) => {
  res.json(await taskService.listTasks(currentUserId(req), req.validated.query as TaskListQuery));
};

export const get: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as IdParam;
  res.json({ data: await taskService.getTask(currentUserId(req), id) });
};

export const create: RequestHandler = async (req, res) => {
  const task = await taskService.createTask(currentUserId(req), req.validated.body as CreateTaskInput);
  res.status(201).json({ data: task });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as IdParam;
  const task = await taskService.updateTask(currentUserId(req), id, req.validated.body as UpdateTaskInput);
  res.json({ data: task });
};

export const remove: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as IdParam;
  await taskService.deleteTask(currentUserId(req), id);
  res.status(204).end();
};
