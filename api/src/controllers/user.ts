/* eslint-disable @typescript-eslint/camelcase */

import { User, UserDocument } from '../models/User';
import { Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import * as yup from 'yup'; // for everything
import { Project } from '../models/Project';
import { jwtMiddleware } from '../middleware/jwt';

export default jwtMiddleware(Router())
  .get('', asyncHandler(getUser))
  .patch('', asyncHandler(updateUser))
  .put('/password', asyncHandler(updatePassword));

const updatePasswordSchema = yup.object().shape({
  password: yup
    .string()
    .min(8)
    .required()
});

const updateUserSchema = yup.object().shape({
  email: yup.string(),
  name: yup.string()
});

async function getUser(req: Request, res: Response) {
  const projects = await Project.find({ ownerId: req.user.id });
  return res.json({
    user: req.user.toDto(),
    projects: projects.map(p => p.toDto())
  });
}

async function updateUser(req: Request, res: Response) {
  const body = await updateUserSchema.validate(req.body, {
    stripUnknown: true
  });
  const user = req.user as UserDocument;
  Object.assign(user, body);
  await user.save();
  res.json({ user });
}

async function updatePassword(req: Request, res: Response) {
  const body = await updatePasswordSchema.validate(req.body);
  const user = req.user as UserDocument;
  user.password = body.password;
  await user.save();
  res.status(200).json({ message: 'OK' });
}
