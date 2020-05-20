import React, { useState, useEffect } from "react";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { connect } from "react-redux";

const Channels = ({
  currentUser,
  setCurrentChannel,
  setPrivateChannel,
  currentChannel,
}) => {
  const [chatChannels, setChatChannels] = useState([]);
  const [channel, setChannel] = useState({});
  const [messagesRef] = useState(firebase.database().ref("messages"));
  const [notifications, setNotifications] = useState([]);
  const [activeChannel, setactiveChannel] = useState("");
  const [typingRef] = useState(firebase.database().ref("typing"));
  const [channelsRef] = useState(firebase.database().ref("channels"));
  const [modal, setModal] = useState(false);
  const [formState, setFormState] = useState({
    channelName: "",
    channelDetails: "",
  });
  const channelArrayLength = chatChannels.length;
  useEffect(() => {
    const handleNotifications = (
      channelId,
      currentChannelId,
      notifications,
      snap
    ) => {
      let lastTotal = 0;
      let index = notifications.findIndex(
        (notification) => notification.id === channelId
      );
      if (index !== -1) {
        if (channelId !== currentChannelId) {
          lastTotal = notifications[index].total;
          if (snap.numChildren() - lastTotal > 0) {
            notifications[index].count = snap.numChildren() - lastTotal;
          }
        }
        notifications[index].lastknownTotal = snap.numChildren();
      } else {
        notifications.push({
          id: channelId,
          total: snap.numChildren(),
          lastknownTotal: snap.numChildren(),
          count: 0,
        });
      }
      setNotifications(notifications);
    };
    const addNotificationListener = (channelId) => {
      messagesRef.child(channelId).on("value", (snap) => {
        if (channel) {
          handleNotifications(channelId, channel.id, notifications, snap);
        }
      });
    };
    let loadedChannels = [];
    channelsRef.on("child_added", (snap) => {
      loadedChannels.push(snap.val());
      setChatChannels(loadedChannels);
      setCurrentChannel(loadedChannels[0]);
      setactiveChannel(loadedChannels[0].id);
      setChannel(loadedChannels[0]);
      addNotificationListener(snap.key);
    });
  }, [
    channelsRef,
    channelArrayLength,
    setCurrentChannel,
    notifications.length,
    Object.keys(channel).length,
  ]);
  const changeChannel = (channel) => {
    setactiveChannel(channel.id);
    typingRef.child(channel.id).child(currentUser.uid).remove();
    clearNotifications();
    setCurrentChannel(channel);
    setPrivateChannel(false);
    setChannel(channel);
  };
  const clearNotifications = () => {
    let index = notifications.findIndex(
      (notification) => notification.id === channel.id
    );
    if (index !== -1) {
      let updatedNotifications = [...notifications];
      updatedNotifications[index].total = notifications[index].lastknownTotal;
      updatedNotifications[index].count = 0;
      setNotifications(updatedNotifications);
    }
  };
  const closeModal = () => {
    setModal(false);
  };
  const openModal = () => {
    setModal(true);
  };
  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };
  const isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails;
  const addChannel = () => {
    const key = channelsRef.push().key;
    const newChannel = {
      id: key,
      name: formState.channelName,
      details: formState.channelDetails,
      createdBy: {
        name: currentUser.displayName,
        avatar: currentUser.photoURL,
      },
    };
    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        setFormState({ channelName: "", channelDetails: "" });
        closeModal();
        console.log("channel added");
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid(formState)) {
      addChannel();
    }
  };
  const getNotificationCount = (channel) => {
    let count = 0;
    notifications.forEach((notification) => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });
    if (count > 0) return count;
  };
  const displayChannels = () => {
    return (
      chatChannels.length > 0 &&
      chatChannels.map((channel) => (
        <Menu.Item
          key={channel.id}
          onClick={() => changeChannel(channel)}
          name={channel.name}
          style={{ opacity: 0.7 }}
          active={channel.id === activeChannel}
        >
          {getNotificationCount(channel) && (
            <Label color="red">{getNotificationCount(channel)}</Label>
          )}
          # {channel.name}
        </Menu.Item>
      ))
    );
  };

  return (
    <React.Fragment>
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="exchange" /> CHANNELS
          </span>{" "}
          ({chatChannels.length}) <Icon name="add" onClick={openModal} />
        </Menu.Item>
        {displayChannels()}
      </Menu.Menu>
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>Add a channel</Modal.Header>
        <Modal.Content>
          <Form onSubmit={handleSubmit}>
            <Form.Field>
              <Input
                fluid
                label="Name of Channel"
                name="channelName"
                onChange={handleChange}
              />
            </Form.Field>
            <Form.Field>
              <Input
                fluid
                label="About the Channel"
                name="channelDetails"
                onChange={handleChange}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={handleSubmit} color="green" inverted>
            <Icon name="checkmark" />
            Add
          </Button>
          <Button color="red" inverted onClick={closeModal}>
            <Icon name="remove" />
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  currentChannel: state.channel.currentChannel,
});

export default connect(mapStateToProps, {
  setCurrentChannel,
  setPrivateChannel,
})(Channels);
