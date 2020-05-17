import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import firebase from "../../firebase";
import { Menu, Icon } from "semantic-ui-react";
import { addUsers, setCurrentChannel, setPrivateChannel } from "../../actions";

const DirectMessages = ({
  currentUser,
  usersRedux,
  addUsers,
  setCurrentChannel,
  setPrivateChannel,
}) => {
  const [users, setUsers] = useState([]);
  const [activeChannel, setActiveChannel] = useState("");
  const [usersRef] = useState(firebase.database().ref("users"));
  const [connectedRef] = useState(firebase.database().ref(".info/connected"));
  const [presenceRef] = useState(firebase.database().ref("presence"));
  useEffect(() => {
    if (currentUser) {
      let loadedUsers = [];
      usersRef.on("child_added", (snap) => {
        if (currentUser.uid !== snap.key) {
          let user = snap.val();
          user["uid"] = snap.key;
          user["status"] = "offline";
          loadedUsers.push(user);
          setUsers(loadedUsers);
          addUsers(loadedUsers);
        }
      });
      connectedRef.on("value", (snap) => {
        if (snap.val() === true) {
          const ref = presenceRef.child(currentUser.uid);
          ref.set(true);
          ref.onDisconnect().remove((err) => {
            if (err !== null) {
              console.error(err);
            }
          });
        }
      });
    }
    const addStatusToUser = (userId, connected = true) => {
      const updatedUsers = usersRedux.reduce((acc, user) => {
        if (user.uid === userId) {
          user["status"] = `${connected ? "online" : "offline"}`;
        }
        return acc.concat(user);
      }, []);
      setUsers(updatedUsers);
    };
    presenceRef.on("child_added", (snap) => {
      if (currentUser.uid !== snap.key) {
        addStatusToUser(snap.key);
      }
    });
    presenceRef.on("child_removed", (snap) => {
      if (currentUser.uid !== snap.key) {
        addStatusToUser(snap.key, false);
      }
    });
  }, [users.length, usersRedux.length]);
  const isUserOnline = (user) => user.status === "online";
  const getChannelId = (userId) => {
    const currentUserId = currentUser.uid;
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };
  const setActiveChannelFxn = (userId) => {
    setActiveChannel(userId);
  };
  const changeChannel = (user) => {
    const channelId = getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name,
    };
    setCurrentChannel(channelData);
    setPrivateChannel(true);
    setActiveChannelFxn(user.uid);
  };

  return (
    <Menu.Menu className="menu">
      <Menu.Item>
        <span>
          <Icon name="mail" /> DIRECT MESSAGES
        </span>{" "}
        ({usersRedux.length})
      </Menu.Item>
      {usersRedux.map((user) => (
        <Menu.Item
          key={user.uid}
          active={user.uid === activeChannel}
          onClick={() => changeChannel(user)}
          style={{ opacity: 0.7, fonStyle: "italic" }}
        >
          <Icon name="circle" color={isUserOnline(user) ? "green" : "red"} />@{" "}
          {user.name}
        </Menu.Item>
      ))}
    </Menu.Menu>
  );
};

const mapStateToProps = (state) => ({
  usersRedux: state.users,
});

export default connect(mapStateToProps, {
  addUsers,
  setCurrentChannel,
  setPrivateChannel,
})(DirectMessages);
