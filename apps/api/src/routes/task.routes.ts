import { createTaskSchema, idParamSchema, taskListQuerySchema, updateTaskSchema } from '@ismo/shared';
import { Router } from 'express';
import * as tasks from '../controllers/task.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

export const taskRoutes = Router()
  .use(authenticate)
  .get('/', validate({ query: taskListQuerySchema }), tasks.list)
  .post('/', validate({ body: createTaskSchema }), tasks.create)
  .get('/:id', validate({ params: idParamSchema }), tasks.get)
  .put('/:id', validate({ params: idParamSchema, body: updateTaskSchema }), tasks.update)
  .delete('/:id', validate({ params: idParamSchema }), tasks.remove);
