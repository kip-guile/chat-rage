import React from "react";
import { Grid } from "semantic-ui-react";
import { connect } from "react-redux";
import "./App.css";
import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";

function App({
  currentUser,
  channel,
  isPrivateChannel,
  userPosts,
  primaryColor,
  secondaryColor,
}) {
  return (
    <Grid
      columns="equal"
      className="app"
      style={{ background: secondaryColor }}
    >
      <ColorPanel key={channel && channel.id} currentUser={currentUser} />
      <SidePanel
        key={currentUser && currentUser.name}
        currentUser={currentUser}
        primaryColor={primaryColor}
      />
      <Grid.Column style={{ marginLeft: 320 }}>
        <Messages
          key={channel && channel.id}
          channel={channel}
          currentUser={currentUser}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>
      <Grid.Column width={4}>
        <MetaPanel
          key={channel && channel.name}
          channel={channel}
          isPrivateChannel={isPrivateChannel}
          userPosts={userPosts}
        />
      </Grid.Column>
    </Grid>
  );
}

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
  channel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts,
  primaryColor: state.colors.primaryColor,
  secondaryColor: state.colors.secondaryColor,
});

export default connect(mapStateToProps)(App);
