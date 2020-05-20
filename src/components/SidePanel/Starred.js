import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon } from "semantic-ui-react";

const Starred = ({ setCurrentChannel, setPrivateChannel, currentUser }) => {
  const [starredChannels, setStarredChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState("");
  const [usersRef] = useState(firebase.database().ref("users"));
  useEffect(() => {
    const addListeners = (userId) => {
      usersRef
        .child(userId)
        .child("starred")
        .on("value", (snap) => {
          let starred = [];
          const object = snap.val();
          for (const property in object) {
            starred.push(object[property]);
          }
          //   const starredChannel = { id: snap.key, ...snap.val() };
          //   setStarredChannels([...starredChannels, starredChannel]);
          setStarredChannels(starred);
        });
      usersRef
        .child(userId)
        .child("starred")
        .on("child_removed", (snap) => {
          const channelToRemove = { id: snap.key, ...snap.val() };
          const filteredChannels = starredChannels.filter((channel) => {
            return channel.id !== channelToRemove.id;
          });
          setStarredChannels(filteredChannels);
        });
    };
    if (currentUser) {
      addListeners(currentUser.uid);
    }
  }, [starredChannels.length]);
  const changeChannel = (channel) => {
    setActiveChannel(channel.id);
    setCurrentChannel(channel);
    setPrivateChannel(false);
  };
  const displayChannels = () => {
    return (
      starredChannels.length > 0 &&
      starredChannels.map((channel) => (
        <Menu.Item
          key={channel.id}
          onClick={() => changeChannel(channel)}
          name={channel.name}
          style={{ opacity: 0.7 }}
          active={channel.id === activeChannel}
        >
          # {channel.name}
        </Menu.Item>
      ))
    );
  };
  return (
    <Menu.Menu className="menu">
      <Menu.Item>
        <span>
          <Icon name="star" /> STARRED
        </span>{" "}
        ({starredChannels.length})
      </Menu.Item>
      {displayChannels(starredChannels)}
    </Menu.Menu>
  );
};

export default connect(null, { setPrivateChannel, setCurrentChannel })(Starred);
