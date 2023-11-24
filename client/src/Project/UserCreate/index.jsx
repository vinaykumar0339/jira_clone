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

const propTypes = {
  projects: PropTypes.array.isRequired,
  project: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
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

const UserCreate = ({ projects, project, fetchProject, onCreate, modalClose }) => {
  const [{ isCreating }, createUser] = useApi.post(`/user/create`);


  return (
    <Form
      enableReinitialize
      initialValues={{
        name: '',
        email: '',
        isAdmin: false,
        projects: '',
        password: '',
        confirmPassword: '',
      }}
      validations={{
        name: Form.is.required(),
        email: [Form.is.required(), Form.is.email()],
        projects: [Form.is.required()],
        password: Form.is.required(),
        confirmPassword: [Form.is.required(), Form.is.match((value, fieldvalues) => {
            return value === fieldvalues.password
        }, "Confirm Password Should Match With Password")],
      }}
      onSubmit={async (values, form) => {
        try {
            console.log(values, form)
            await createUser({
              ...values,
            });
            await fetchProject();
            toast.success(`User ${values.name} has been successfully created.`);
            onCreate();
        } catch (error) {
          Form.handleAPIError(error, form);
        }
      }}
    >
      <FormElement>
        <FormHeading>Create User</FormHeading>
        <Divider />
        <Form.Field.Input
          name="name"
          label="Enter Name"
          placeholder="Enter Your Name"
        />
        <Form.Field.Input
          name="email"
          label="Enter Email"
          placeholder="Enter Your Email"
        />
        <Form.Field.Select
          name="isAdmin"
          label="Is Admin"
          options={[{value: true, label: true}, {value: false, label: false}]}
          renderOption={renderOption}
          renderValue={renderOption}
        />
        <Form.Field.Select
          name="projects"
          label="Projects"
          isMulti
          options={projects.map(proj => ({value: proj.name, label: proj._id}))}
          renderOption={renderOption}
          renderValue={renderOption}
        />
        <Form.Field.Input
          name="password"
          label="Enter Password"
          placeholder="Enter Your Password"
          type="password"
        />
        <Form.Field.Input
          name="confirmPassword"
          label="Enter Confirm Password"
          placeholder="Enter Your Confirm Password"
          type="password"
        />
        <Actions>
          <ActionButton type="submit" variant="primary" isWorking={isCreating}>
            Create User
          </ActionButton>
          <ActionButton type="button" variant="empty" onClick={modalClose}>
            Cancel
          </ActionButton>
        </Actions>
      </FormElement>
    </Form>
  );
};

UserCreate.propTypes = propTypes;

export default UserCreate;
