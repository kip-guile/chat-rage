import React, { useState, useEffect } from "react";
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";
import firebase from "../../firebase";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { connect } from "react-redux";

const Channels = ({ currentUser, setCurrentChannel, setPrivateChannel }) => {
  const [chatChannels, setChatChannels] = useState([]);
  const [activeChannel, setactiveChannel] = useState("");
  const [channelsRef] = useState(firebase.database().ref("channels"));
  const [modal, setModal] = useState(false);
  const [formState, setFormState] = useState({
    channelName: "",
    channelDetails: "",
  });
  const channelArrayLength = chatChannels.length;
  useEffect(() => {
    let loadedChannels = [];
    channelsRef.on("child_added", (snap) => {
      loadedChannels.push(snap.val());
      setChatChannels(loadedChannels);
      setCurrentChannel(loadedChannels[0]);
      setactiveChannel(loadedChannels[0].id);
    });
  }, [channelsRef, channelArrayLength, setCurrentChannel]);
  const changeChannel = (channel) => {
    setactiveChannel(channel.id);
    setCurrentChannel(channel);
    setPrivateChannel(false);
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

const mapStateToProps = () => ({});

export default connect(mapStateToProps, {
  setCurrentChannel,
  setPrivateChannel,
})(Channels);
