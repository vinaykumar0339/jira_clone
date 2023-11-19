/* eslint-disable no-underscore-dangle */
import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Route, useRouteMatch, useHistory } from 'react-router-dom';

import useMergeState from 'shared/hooks/mergeState';
import { Avatar, Breadcrumbs, Modal, PageError, PageLoader } from 'shared/components';
import useApi from 'shared/hooks/api';
import { createQueryParamModalHelpers } from 'shared/utils/queryParamModal';
import { updateArrayItemById } from 'shared/utils/javascript';
import { Item } from 'Project/NavbarLeft/Styles';
import { ActionButton, Actions } from 'Project/IssueCreate/Styles';
import useCurrentUser from 'shared/hooks/currentUser';


import IssueCreate from '../IssueCreate';
import Header from './Header';
import Filters from './Filters';
import Lists from './Lists';
import IssueDetails from './IssueDetails';

const propTypes = {
  currentProject: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
  updateLocalProjectIssues: PropTypes.func.isRequired,
  issueCreateModalOpen: PropTypes.func.isRequired,
};

const defaultFilters = {
  searchTerm: '',
  userIds: [],
  myOnly: false,
  recent: false,
};

const ProjectBoard = ({ currentProject, fetchProject, issueCreateModalOpen }) => {
  const match = useRouteMatch();
  const history = useHistory();
  const { currentUser } = useCurrentUser();
  const [filters, mergeFilters] = useMergeState(defaultFilters);
  const issueCreateModalHelpers = createQueryParamModalHelpers('issue-create');

  const [{ data: projectData, error, setLocalData }, fetchCurrentProject] = useApi.get(`/project/${currentProject._id}`, {projectId: currentProject._id});

  useEffect(() => {
    fetchCurrentProject();
  }, [fetchCurrentProject, currentProject._id])

  const updateLocalProjectIssues = (issueId, updatedFields) => {
    setLocalData(currentData => ({
      project: {
        ...currentData.project,
        issues: updateArrayItemById(currentData.project.issues, issueId, updatedFields)
      }
    }))
  }

  if (!projectData) return <PageLoader />;

  if (error) {
    return (
      <div>
        {error}
        <PageError />
      </div>
    )
  }

  const { project } = projectData;

  return (
    <Fragment>
      {/* // user avatar with breadcrumbs */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Breadcrumbs items={['Projects', project.name, 'Kanban Board New Board']} />
          <ActionButton type="button" variant="primary" onClick={issueCreateModalHelpers.open} >
            Create Issue
          </ActionButton>
        </div>
        <div>
          {currentUser && <Avatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} />}
        </div>
      </div>
      <Header />
      <Filters
        projectUsers={project.users}
        defaultFilters={defaultFilters}
        filters={filters}
        mergeFilters={mergeFilters}
      />
      <Lists
        project={project}
        filters={filters}
        updateLocalProjectIssues={updateLocalProjectIssues}
      />
      <Route
        path={`${match.path}/issues/:issueId`}
        render={routeProps => (
          <Modal
            isOpen
            testid="modal:issue-details"
            width={1040}
            withCloseIcon={false}
            onClose={() => history.push(match.url)}
            renderContent={modal => (
              <IssueDetails
                issueId={routeProps.match.params.issueId}
                projectUsers={project.users}
                fetchProject={fetchProject}
                updateLocalProjectIssues={updateLocalProjectIssues}
                modalClose={modal.close}
              />
            )}
          />
        )}
      />
      {currentProject && (
        issueCreateModalHelpers.isOpen() && (
          <Modal
            isOpen
            testid="modal:issue-create"
            width={800}
            withCloseIcon={false}
            onClose={issueCreateModalHelpers.close}
            renderContent={modal => (
              <IssueCreate
                project={currentProject}
                fetchProject={fetchCurrentProject}
                onCreate={() => history.push(`${match.url}/board`)}
                modalClose={modal.close}
              />
            )}
          />
        )
      )}
    </Fragment>
  );
};

ProjectBoard.propTypes = propTypes;

export default ProjectBoard;
