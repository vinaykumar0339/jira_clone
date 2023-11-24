/* eslint-disable no-underscore-dangle */
import React, { useEffect, useRef, useState } from 'react';
import { Route, Redirect, useRouteMatch, useHistory } from 'react-router-dom';

import useApi from 'shared/hooks/api';
import { updateArrayItemById } from 'shared/utils/javascript';
import { createQueryParamModalHelpers } from 'shared/utils/queryParamModal';
import { PageLoader, PageError, Modal } from 'shared/components';
import useCurrentUser from 'shared/hooks/currentUser';
import UserCreate from 'Project/UserCreate';
import Users from 'Project/Users';
import Pages from 'Project/Pages';
import ProjectCreate from 'Project/CreateProject';
import IssueSearch from 'Project/IssueSearch';

import NavbarLeft from './NavbarLeft';
import Sidebar from './Sidebar';
import Board from './Board';
import ProjectSettings from './ProjectSettings';
import { ProjectPage } from './Styles';


const Project = () => {
  const match = useRouteMatch();
  const history = useHistory();
  const { currentUser } = useCurrentUser();
  const [currentProject, setCurrentProject] = useState();
  const boardRef = useRef();

  const issueSearchModalHelpers = createQueryParamModalHelpers('issue-search');
  const userCreateModalHelpers = createQueryParamModalHelpers('user-create');
  const projectCreateModalHelpers = createQueryParamModalHelpers('project-create');

  const [{ data, error, setLocalData }, fetchProject] = useApi.get('/project/all');

  useEffect(() => {
    const projects = data && data.projects;
    if (currentProject) {
      const findCurrentProject = projects && projects.find(project => currentProject._id === project._id)
      if (findCurrentProject) {
        setCurrentProject(findCurrentProject);
      }
      return;
    }
    const firstProject = projects && projects[0];
    if (firstProject) {
      setCurrentProject(firstProject);
    }
  }, [currentProject, data])

  if (!data) return <PageLoader />;
  if (error) return <PageError />;

  const { projects } = data;

  const updateLocalProjectIssues = (issueId, updatedFields) => {
    setLocalData(currentData => ({
      projects: [
        ...currentData.projects.map((project) => ({
          ...project,
          issues: updateArrayItemById(project.issues, issueId, updatedFields)
        }))
      ]
    }))
  };

  return (
    <ProjectPage>
      <NavbarLeft
        project={currentProject}
        issueSearchModalOpen={issueSearchModalHelpers.open}
        userCreateModalOpen={userCreateModalHelpers.open}
        projectCreateModalOpen={projectCreateModalHelpers.open}
      />

      {issueSearchModalHelpers.isOpen() && (
        <Modal
          isOpen
          testid="modal:issue-search"
          variant="aside"
          width={600}
          onClose={issueSearchModalHelpers.close}
          renderContent={() => <IssueSearch project={currentProject} />}
        />
      )}

      {userCreateModalHelpers.isOpen() && (
          <Modal
            isOpen
            testid="modal:user-create"
            width={800}
            withCloseIcon={false}
            onClose={userCreateModalHelpers.close}
            renderContent={modal => (
              <UserCreate
                projects={projects}
                project={currentProject}
                fetchProject={(...args) => {
                  if (boardRef.current.fetchCurrentProject) {
                    boardRef.current.fetchCurrentProject();
                  }
                  fetchProject(...args)
                }}
                onCreate={() => history.push(`${match.url}/board`)}
                modalClose={modal.close}
              />
            )}
        />
      )}

      {projectCreateModalHelpers.isOpen() && (
          <Modal
            isOpen
            testid="modal:project-create"
            width={800}
            withCloseIcon={false}
            onClose={projectCreateModalHelpers.close}
            renderContent={() => (
              <ProjectCreate
                onCreate={() => fetchProject()}
                modalClose={projectCreateModalHelpers.close}
              />
            )}
        />
      )}

      <Sidebar currentProject={currentProject} projects={projects} setCurrentProject={setCurrentProject} />

      {currentProject && (
        <Route
          path={`${match.path}/board`}
          render={() => (
            <Board
              ref={boardRef}
              currentProject={currentProject}
              fetchProject={fetchProject}
              updateLocalProjectIssues={updateLocalProjectIssues}
            />
          )}
        />
      )}

      {currentProject && (
        <Route
          path={`${match.path}/settings`}
          render={() => <ProjectSettings project={currentProject} fetchProject={fetchProject} />}
        />
      )}

      {currentUser && currentUser.isAdmin && (
        <Route
          path={`${match.path}/users`}
          render={() => <Users projects={projects} fetchProject={fetchProject} />}
        />
      )}

      <Route
        path={`${match.path}/pages`}
        render={() => <Pages />}
      />

      {match.isExact && <Redirect to={`${match.url}/board`} />}
    </ProjectPage>
  );
};

export default Project;
