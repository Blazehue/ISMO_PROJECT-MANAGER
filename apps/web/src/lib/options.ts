import {
  PROJECT_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  projectStatusTone,
  taskPriorityTone,
  taskStatusTone,
} from '@ismo/shared';

export const projectStatusOptions = PROJECT_STATUSES.map((value) => ({ value, label: projectStatusTone[value].label }));
export const taskStatusOptions = TASK_STATUSES.map((value) => ({ value, label: taskStatusTone[value].label }));
export const taskPriorityOptions = TASK_PRIORITIES.map((value) => ({ value, label: taskPriorityTone[value].label }));
