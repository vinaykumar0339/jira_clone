/* eslint-disable no-restricted-globals */
/* eslint-disable no-alert */
/* eslint-disable no-underscore-dangle */
import { ActionButton } from 'Project/UserCreate/Styles';
import React from 'react'
import { Avatar, ConfirmModal, PageError, PageLoader } from 'shared/components';
import useApi from 'shared/hooks/api';
import useCurrentUser from 'shared/hooks/currentUser';
import api from 'shared/utils/api';
import toast from 'shared/utils/toast';

function Users({ fetchProject }) {
  const [{ data, error }, fetchUsers] = useApi.get('/users');
  const { currentUser } = useCurrentUser();

  const handleDeleteUser = async (user, modal) => {
    try {
      await api.delete(`/users/${user._id}`);
      await fetchUsers();
      await fetchProject();
      if (modal && modal.close) {
        modal.close();
      }
    } catch (localError) {
      toast.error(localError);
    }
  }

  const getProjectsNames = (projects) => {
    if (projects && projects.length > 0) {
      return projects.map(project => project.name).join(',');
    }
    return 'unassigned';
  }

  if (!data) return <PageLoader />;

  if (error) {
    return (
      <div>
        {error}
        <PageError />
      </div>
    )
  }

  return (
    <div>
      {data.map(user => (
        <div key={user._id} style={{display: 'flex', marginBottom: 10, justifyContent: 'space-between'}}>
          <div style={{display: 'flex'}}>
            <Avatar name={user.name} avatarUrl={user.avatarUrl} />
            <div style={{marginLeft: 10}}>
              <div>
                <b>Name: </b>
                <span>{user.name}</span>
              </div>
              <div>
                <b>Email: </b>
                <span>{user.email}</span>
              </div>
              <div>
                <b>IsAdmin: </b>
                <span>{user.isAdmin.toString()}</span>
              </div>
              <div>
                <b>Projects Assigned: </b>
                <span>{getProjectsNames(user.projects)}</span>
              </div>
            </div>
          </div>
          <div>
            <ActionButton
              variant='primary'
            >
              Edit
            </ActionButton>
            {currentUser && currentUser.isAdmin && currentUser._id !== user._id && (
                <ActionButton
                  variant='danger'
                  onClick={() => {
                    const confirmDelete = confirm(`Do You Want to Delete user: ${user.name}`);
                    if (confirmDelete) {
                      handleDeleteUser(user);
                    }
                  }}
                >
                  Delete
                </ActionButton>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Users