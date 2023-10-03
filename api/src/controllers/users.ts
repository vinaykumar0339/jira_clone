/* eslint-disable no-underscore-dangle */
import { BadUserInputError, CustomError, catchErrors } from 'errors';
import { Project, User } from 'mongooseEntities';
import { signToken } from 'utils/authToken';
import bcrypt from 'bcrypt';

const hashPassword = async (password: string, saltRounds: number): Promise<string> => {
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

const checkPassword = async (password: string, hash: string): Promise<boolean> => {
  const match = await bcrypt.compare(password, hash);
  return match;
};

export const create = catchErrors(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadUserInputError({ email: 'Email not provided' });
  }
  const password = await hashPassword(req.body.password, 10);
  const body = {
    ...req.body,
    password,
  };
  const user = new User(body);
  await user.save();
  const project = await Project.findOne();
  if (project) {
    project.users.push(user._id);
    await project.save();
  }
  res.respond({ user });
});

export const login = catchErrors(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadUserInputError({ email: 'Email not provided' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadUserInputError({ email: 'email not found' });
  }
  const match = await checkPassword(req.body.password, user.password);
  if (!match) {
    throw new CustomError('incorrect credentials', 403, 403);
  }
  res.respond({ authToken: signToken({ sub: user._id }) });
});

export const getCurrentUser = catchErrors((req, res) => {
  res.respond({ currentUser: req.currentUser });
});
