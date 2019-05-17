import Joi from 'joi';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import mock from '../data/mock';
import validate from '../helpers/validation';

dotenv.config();

const auth = {
  register(req, res) {
    const {
      firstName, lastName, email, password, address,
    } = req.body;

    const result = Joi.validate(req.body, validate.userSchema, { abortEarly: false });

    if (result.error) {
      const errors = [];
      for (let index = 0; index < result.error.details.length; index++) {
        errors.push(result.error.details[index].message.split('"').join(''));
      }
      return res.status(400).send({
        status: res.statusCode,
        error: errors,
      });
    }
    const uniqueUser = mock.users.find(user => user.email === email);
    if (uniqueUser) {
      return res.status(409).json({
        status: res.statusCode,
        error: `User with this email:${JSON.stringify(email)} is already registered`,
      });
    }
    const id = mock.users.length + 1;
    const status = 'unverified';
    const createdOn = moment().format('MMMM Do YYYY, h:mm:ss a');
    const isAdmin = 'false';
    const user = new User(
      id, firstName, lastName, email, password, address, status, isAdmin, createdOn,
    );
    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;
    const token = jwt.sign({ user: mock.users.push(user) }, `${process.env.SECRET_KEY_CODE}`);
    return res.status(201).send({
      status: res.statusCode,
      data: {
        token,
        id: user.id,
        fistName: firstName,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        status: user.status,
        isAdmin: user.isAdmin,
        CreatedOn: user.createdOn,
      },
    });
  },

  login(req, res) {
    const { email, password } = req.body;

    const { error } = Joi.validate(req.body, validate.loginSchema);

    if (error) {
      const errors = [];
      for (let index = 0; index < error.details.length; index++) {
        errors.push(error.details[index].message.split('"').join(''));
      }
      return res.status(400).send({
        status: res.statusCode,
        error: errors,
      });
    }
    for (let i = 0; i < mock.users.length; i++) {
      if (mock.users[i].email === email) {
        const { id } = mock.users[i];
        const { firstName } = mock.users[i];
        const { lastName } = mock.users[i];
        const { status } = mock.users[i];
        const { isAdmin } = mock.users[i];
        const { createdOn } = mock.users[i];
        const truePass = bcrypt.compareSync(password, mock.users[i].password);
        if (truePass) {
          const token = jwt.sign({ user: mock.users[i].password }, `${process.env.SECRET_KEY_CODE}`, { expiresIn: '1h' });
          return res.status(200).send({
            status: res.statusCode,
            data: {
              token, id, firstName, lastName, email, status, isAdmin, createdOn,
            },
          });
        }
        return res.status(400).send({
          status: res.statusCode,
          error: 'incorrect password',
        });
      }
    }
    return res.status(400).send({ status: 400, error: 'invalid email' });
  },
};

export default auth;
