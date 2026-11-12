import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../config/prisma.js';
import { createUser, createSurvey } from './helpers.js';
import { generateCsrfToken } from '../../utils/csrf.js';

const user = await createUser({ email: 'dbg' + Date.now() + '@test.com' });
const survey = await createSurvey({ userId: user.id, status: 'PUBLISHED', publishedAt: new Date(), allowMultipleResponses: true });
const csrfToken = generateCsrfToken();
const res = await request(app)
  .post('/api/surveys/' + survey.id + '/responses')
  .set('Origin', 'http://localhost:3000')
  .set('X-CSRF-Token', csrfToken)
  .set('Cookie', 'csrf-token=' + csrfToken)
  .send({ answers: [], submitAnonymously: false });
console.log('STATUS', res.status);
console.log('BODY', JSON.stringify(res.body));
await prisma.response.deleteMany({ where: { surveyId: survey.id } });
await prisma.survey.delete({ where: { id: survey.id } });
await prisma.user.delete({ where: { id: user.id } });
process.exit(0);
