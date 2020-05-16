import React, { useState } from "react";
import firebase from "../../firebase";
import md5 from "md5";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon,
} from "semantic-ui-react";
import { Link } from "react-router-dom";

const Register = () => {
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [stateErrors, setStateErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersRef] = useState(firebase.database().ref("users"));
  const { username, email, password, passwordConfirmation } = formState;
  const isFormValid = () => {
    let errors = [];
    let error;
    if (isFormEmpty(formState)) {
      error = { message: "Fill in all fields" };
      setStateErrors(errors.concat(error));
      return false;
    } else if (!isPasswordValid(formState)) {
      error = { message: "Password is not valid" };
      setStateErrors(errors.concat(error));
      return false;
    } else {
      return true;
    }
  };
  const isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };
  const isPasswordValid = ({ password, passwordConfirmation }) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    } else {
      return true;
    }
  };
  const displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);
  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      setStateErrors([]);
      setLoading(true);
      firebase
        .auth()
        .createUserWithEmailAndPassword(formState.email, formState.password)
        .then((createdUser) => {
          console.log(createdUser);
          createdUser.user
            .updateProfile({
              displayName: formState.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`,
            })
            .then(() => {
              saveUser(createdUser).then(() => {
                console.log("user saved");
              });
              setLoading(false);
            })
            .catch((err) => {
              console.error(err);
              setStateErrors(stateErrors.concat(err));
              setLoading(false);
            });
        })
        .catch((err) => {
          console.error(err);
          setStateErrors(stateErrors.concat(err));
          setLoading(false);
        });
    }
  };
  const saveUser = (createdUser) => {
    return usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL,
    });
  };
  const handleErrors = (error, inputName) => {
    return stateErrors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };
  return (
    <Grid className="app" textAlign="center" verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h1" icon color="orange" textAlign="center">
          <Icon name="puzzle piece" color="orange" />
          Register for ChatRage
        </Header>
        <Form onSubmit={handleSubmit} size="large">
          <Segment stacked>
            <Form.Input
              fluid
              name="username"
              icon="user"
              iconPosition="left"
              placeholder="Username"
              onChange={handleChange}
              type="text"
              value={username}
            />
            <Form.Input
              fluid
              name="email"
              icon="mail"
              iconPosition="left"
              placeholder="Email"
              onChange={handleChange}
              type="email"
              value={email}
              className={handleErrors(stateErrors, "email")}
            />
            <Form.Input
              fluid
              name="password"
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              onChange={handleChange}
              type="password"
              value={password}
              className={handleErrors(stateErrors, "password")}
            />
            <Form.Input
              fluid
              name="passwordConfirmation"
              icon="repeat"
              iconPosition="left"
              placeholder="Password Confirmation"
              onChange={handleChange}
              type="password"
              value={passwordConfirmation}
              className={handleErrors(stateErrors, "password")}
            />
            <Button
              disabled={loading}
              className={loading ? "loading" : ""}
              color="orange"
              fluid
              size="large"
            >
              Submit
            </Button>
          </Segment>
        </Form>
        {stateErrors.length > 0 && (
          <Message error>
            <h3>Error</h3>
            {displayErrors(stateErrors)}
          </Message>
        )}
        <Message>
          Already a user? <Link to="/login">Login</Link>
        </Message>
      </Grid.Column>
    </Grid>
  );
};

export default Register;
