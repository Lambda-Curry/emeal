import { Request, Response, Router } from 'express';
import * as yup from 'yup';
import { Project } from '../models/Project';
import { authenticateUser } from '../middleware/jwt';
import asyncHandler from 'express-async-handler';
import multer, { memoryStorage } from 'multer';
import * as uuid from 'uuid';
import * as s3 from '../services/s3';
import { Coupon } from '../models/Coupon';
import { PageView } from '../models/PageView';

const upload = multer({ storage: memoryStorage() });

export const router = Router()
  .post('/:id/markPageView/:sessionId', asyncHandler(markProjectPageView))
  .get('/:id', asyncHandler(getProjectById))
  // authenticatedRoutes
  .get('', authenticateUser, asyncHandler(getProjects))
  .get('/:id/emails/csv', authenticateUser, asyncHandler(downloadEmailCsv))
  .post(
    '/:id/image',
    authenticateUser,
    upload.single('image'),
    asyncHandler(updateProjectImage)
  )
  .patch('', authenticateUser, asyncHandler(updateProject));

const projectSchema = yup.object().shape({
  id: yup.string().required(),
  name: yup.string().required(),
  website: yup.string().required(),
  coupon: yup.object({
    title: yup.string(),
    expirationDays: yup.number(),
    description: yup.string(),
  }),
});

async function getProjects(req: Request, res: Response) {
  const projects = await Project.find({ ownerId: req.user.id });
  return res.json({
    projects: projects.map((p) => p.toDto()),
  });
}

async function getProjectById(req: Request, res: Response) {
  const id = req.params.id;

  const project = await Project.findById(id);
  if (!project)
    return res
      .status(404)
      .json({ errors: [`Could not find project with id: ${id}`] });

  return res.json({
    project: project.toDto(),
  });
}

async function markProjectPageView(req: Request, res: Response) {
  const id = req.params.id;
  const sessionId = req.params.sessionId;

  const project = await Project.findById(id);
  if (!project)
    return res
      .status(404)
      .json({ errors: [`Could not find project with id: ${id}`] });

  if (!sessionId) {
    return res.status(400).json({ errors: ['missing sessionId'] });
  }
  let pageView = await PageView.findOne({
    sessionId,
    projectId: project.id,
  });
  if (!pageView)
    pageView = await new PageView({
      sessionId,
      projectId: project.id,
    }).save();
  return res.json({ message: 'OK' });
}

export async function downloadEmailCsv(req: Request, res: Response) {
  const projectId = req.params.id;
  const project = await Project.findOne({
    _id: projectId,
    ownerId: req.user.id,
  });
  if (!project)
    return res
      .status(400)
      .json({ errors: [`Could not find project with id ${projectId}`] });

  const emails = await Coupon.find({ projectId: projectId }).distinct('email');
  res.setHeader('Content-type', 'application/csv');
  res.setHeader('Content-disposition', 'attachment; filename=emeal-emails.csv');
  res.write('Email\n');
  emails.forEach((e) => res.write(`${e}\n`));
  res.end();
}

async function updateProject(req: Request, res: Response) {
  const body = await projectSchema.validate(req.body, { stripUnknown: true });
  const project = await Project.findOne({ _id: body.id, ownerId: req.user.id });
  if (!project)
    return res
      .status(404)
      .json({ errors: [`Could not find project with id: ${body.id}`] });

  const imageUrl = project.coupon?.image;
  Object.assign(project, body);
  project.coupon.image = imageUrl;
  await project.save();
  return res.status(200).json({ project: project.toDto() });
}

async function updateProjectImage(req: Request, res: Response) {
  const file = req.file;
  const projectId = req.params.id;
  const project = await Project.findOne({
    _id: projectId,
    ownerId: req.user.id,
  });
  if (!project)
    return res
      .status(400)
      .json({ errors: ['Could not find project with provided id'] });
  if (!file)
    return res.status(400).json({
      errors: ['No file uploaded in multipart/form for field "image"'],
    });

  const fileExtensions: { [x: string]: string } = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
  };
  const extension = fileExtensions[file.mimetype];
  if (!extension)
    return res
      .status(400)
      .json({ errors: ['You can only upload jpg and png images'] });

  const key = `public/${uuid.v4()}.${fileExtensions[file.mimetype]}`;
  await s3.uploadFile(file.buffer, file.mimetype, key);
  const url = `https://emeal-public.s3.amazonaws.com/${key}`;
  project.coupon = { ...project.coupon, image: url };
  await project.save();
  return res.json({ project: project.toDto() });
}
