import React, { useState } from "react";
import firebase from "../../firebase";
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

const Login = () => {
  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });
  const [stateErrors, setStateErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { email, password } = formState;
  const displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);
  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid(formState)) {
      setStateErrors([]);
      setLoading(true);
      firebase
        .auth()
        .signInWithEmailAndPassword(formState.email, formState.password)
        .then((signedInUser) => {
          console.log(signedInUser);
        })
        .catch((err) => {
          console.error(err);
          setStateErrors(stateErrors.concat(err));
          setLoading(false);
        });
    }
  };
  const isFormValid = ({ email, password }) => email && password;
  const handleErrors = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };
  return (
    <Grid className="app" textAlign="center" verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h1" icon color="violet" textAlign="center">
          <Icon name="code branch" color="violet" />
          Login to ChatRage
        </Header>
        <Form onSubmit={handleSubmit} size="large">
          <Segment stacked>
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
            <Button
              disabled={loading}
              className={loading ? "loading" : ""}
              color="violet"
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
          Dont have an account? <Link to="/register">Register</Link>
        </Message>
      </Grid.Column>
    </Grid>
  );
};

export default Login;
