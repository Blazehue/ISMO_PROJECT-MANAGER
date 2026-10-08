import { createProjectSchema, idParamSchema, projectListQuerySchema, updateProjectSchema } from '@ismo/shared';
import { Router } from 'express';
import * as projects from '../controllers/project.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

export const projectRoutes = Router()
  .use(authenticate)
  .get('/', validate({ query: projectListQuerySchema }), projects.list)
  .post('/', validate({ body: createProjectSchema }), projects.create)
  .get('/:id', validate({ params: idParamSchema }), projects.get)
  .put('/:id', validate({ params: idParamSchema, body: updateProjectSchema }), projects.update)
  .delete('/:id', validate({ params: idParamSchema }), projects.remove);
