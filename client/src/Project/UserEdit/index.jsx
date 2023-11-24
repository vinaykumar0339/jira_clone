/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import toast from 'shared/utils/toast';
import useApi from 'shared/hooks/api';
import { Form, Icon } from 'shared/components';

import {
  FormHeading,
  FormElement,
  SelectItem,
  SelectItemLabel,
  Divider,
  Actions,
  ActionButton,
} from './Styles';
import useCurrentUser from 'shared/hooks/currentUser';

const propTypes = {
  fetchProject: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  modalClose: PropTypes.func.isRequired,
};

const renderOption = ({ value, removeOptionValue }) => {
  
    return (
      <SelectItem
        key={value}
        withBottomMargin={!!removeOptionValue}
        onClick={() => removeOptionValue && removeOptionValue()}
      >
        <SelectItemLabel>{value.toString()}</SelectItemLabel>
        {removeOptionValue && <Icon type="close" top={2} />}
      </SelectItem>
    );
  };

const UserEdit = ({ user, allProjects, fetchProject, onEdit, modalClose }) => {
  const [{ isCreating }, editUser] = useApi.patch(`/users/${user._id}`);
  const { currentUser } = useCurrentUser();

  return (
    <Form
      enableReinitialize
      initialValues={Form.initialValues(user, get => ({
        name: get('name'),
        email: get('email'),
        isAdmin: get('isAdmin'),
        projects: get('projects').map(proj => proj.name),
      }))}
      validations={{
        name: Form.is.required(),
        email: [Form.is.required(), Form.is.email()],
        isAdmin: [Form.is.required()],
        projects: [Form.is.required()],
      }}
      onSubmit={async (values, form) => {
        try {
            console.log(values, form)
            await editUser({
              ...values,
            });
            await fetchProject();
            toast.success(`User ${values.name} has been successfully created.`);
            onEdit();
        } catch (error) {
          Form.handleAPIError(error, form);
        }
      }}
    >
      <FormElement>
        <FormHeading>Edit User</FormHeading>
        <Divider />
        <Form.Field.Input
          name="name"
          label="Enter Name"
          placeholder="Enter Your Name"
        />
        <Form.Field.Input
          disabled
          name="email"
          label="Enter Email"
          placeholder="Enter Your Email"
        />
        {currentUser && currentUser.isAdmin && (
          <Form.Field.Select
            name="isAdmin"
            label="Is Admin"
            options={[{value: true, label: true}, {value: false, label: false}]}
            renderOption={renderOption}
            renderValue={renderOption}
          />
        )}
        <Form.Field.Select
          name="projects"
          label="Projects"
          isMulti
          options={allProjects.map(proj => ({value: proj.name, label: proj._id}))}
          renderOption={renderOption}
          renderValue={renderOption}
        />
        <Actions>
          <ActionButton type="submit" variant="primary" isWorking={isCreating}>
            Edit User
          </ActionButton>
          <ActionButton type="button" variant="empty" onClick={modalClose}>
            Cancel
          </ActionButton>
        </Actions>
      </FormElement>
    </Form>
  );
};

UserEdit.propTypes = propTypes;

export default UserEdit;
