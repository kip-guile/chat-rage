import React from "react";
import firebase from "../../firebase";
import { Grid, Header, Icon, Dropdown, Image } from "semantic-ui-react";

const UserPanel = ({ currentUser }) => {
  const handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signed out"));
  };
  const dropdownOptions = [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{currentUser.displayName}</strong>
        </span>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <span>Change Avatar</span>,
    },
    {
      key: "signout",
      text: <span onClick={handleSignout}>Sign Out</span>,
    },
  ];
  const dropdownSelection = () => (
    <Dropdown
      trigger={
        <span>
          <Image src={currentUser.photoURL} spaced="right" avatar />
          {currentUser.displayName}
        </span>
      }
      options={dropdownOptions}
    />
  );
  return (
    <Grid style={{ background: "4c34c" }}>
      <Grid.Column>
        <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
          <Header inverted floated="left" as="h2">
            <Icon name="code" />
            <Header.Content>ChatRage</Header.Content>
          </Header>
          <Header style={{ padding: "0.25em" }} as="h4" inverted>
            {dropdownSelection()}
          </Header>
        </Grid.Row>
      </Grid.Column>
    </Grid>
  );
};

export default UserPanel;
