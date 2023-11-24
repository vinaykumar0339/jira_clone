import * as authentication from 'controllers/authentication';
import * as comments from 'controllers/comments';
import * as issues from 'controllers/issues';
import * as projects from 'controllers/projects';
import * as test from 'controllers/test';
import * as users from 'controllers/users';

export const attachPublicRoutes = (app: any): void => {
  if (process.env.NODE_ENV === 'test') {
    app.delete('/test/reset-database', test.resetDatabase);
    app.post('/test/create-account', test.createAccount);
  }
  app.post('/user/create', users.create);
  app.post('/user/login', users.login);
  app.post('/authentication/guest', authentication.createGuestAccount);
};

export const attachPrivateRoutes = (app: any): void => {
  app.post('/comments', comments.create);
  app.put('/comments/:commentId', comments.update);
  app.delete('/comments/:commentId', comments.remove);

  app.get('/issues', issues.getProjectIssues);
  app.get('/issues/:issueId', issues.getIssueWithUsersAndComments);
  app.post('/issues', issues.create);
  app.put('/issues/:issueId', issues.update);
  app.delete('/issues/:issueId', issues.remove);

  app.get('/project/all', projects.getAllProjects);
  app.get('/project/:projectId', projects.getProjectWithUsersAndIssues);
  app.post('/project', projects.create);
  app.put('/project/:projectId', projects.update);

  app.get('/currentUser', users.getCurrentUser);
  app.get('/users', users.getAllUsers);
  app.delete('/users/:userId', users.deleteUser);
  app.patch('/users/:userId', users.editUser);
};
