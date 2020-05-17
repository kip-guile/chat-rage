import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessagesForm from "./MessagesForm";
import MessageComponent from "./Message";
import firebase from "../../firebase";
import { addMessage } from "../../actions";

const Messages = ({
  channel,
  currentUser,
  messagesRedux,
  addMessage,
  isPrivateChannel,
}) => {
  const [messages, setMessages] = useState([]);
  const [privateMessagesRef] = useState(
    firebase.database().ref("privateMessages")
  );
  const [searchResults, setSearchResults] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [uniqueUsers, setNumUniqueUsers] = useState("");
  const [messagesRef] = useState(firebase.database().ref("messages"));
  useEffect(() => {
    const addListeners = (channelId) => {
      addMessageListener(channelId);
    };
    const getMessagesRef = () => {
      return isPrivateChannel ? privateMessagesRef : messagesRef;
    };
    const ref = getMessagesRef();
    const countUniqueUsers = (messages) => {
      const uniqueUsers = messages.reduce((acc, message) => {
        if (!acc.includes(message.user.name)) {
          acc.push(message.user.name);
        }
        return acc;
      }, []);
      const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
      const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
      setNumUniqueUsers(numUniqueUsers);
    };
    const addMessageListener = (channelId) => {
      let loadedMessages = [];
      ref.child(channelId).on("value", (snap) => {
        const object = snap.val();
        for (const property in object) {
          loadedMessages.push(object[property]);
        }
        setMessages(loadedMessages);
        addMessage(loadedMessages);
        setMessagesLoading(false);
        countUniqueUsers(loadedMessages);
      });
    };
    if (channel && currentUser) {
      addListeners(channel.id);
    }
  }, [messages.length, messagesRedux.length]);

  const displayMessages = (messagesarr) =>
    messagesarr.length > 0 &&
    messagesarr.map((message) => (
      <MessageComponent
        key={message.timestamp}
        message={message}
        user={currentUser}
      />
    ));
  const displayChannelName = (channel) => {
    return channel ? `${isPrivateChannel ? "@" : "#"}${channel.name}` : "";
  };
  const handleSearchMessages = () => {
    const channelMessages = [...messagesRedux];
    const regex = new RegExp(searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    setSearchResults(searchResults);
    setTimeout(() => setSearchLoading(false), 1000);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSearchLoading(true);
    handleSearchMessages();
  };
  const getMessagesRef = () => {
    return isPrivateChannel ? privateMessagesRef : messagesRef;
  };

  return (
    <React.Fragment>
      <MessagesHeader
        channelName={displayChannelName(channel)}
        uniqueUsers={uniqueUsers}
        handleSearchChange={handleSearchChange}
        searchLoading={searchLoading}
        isPrivateChannel={isPrivateChannel}
      />
      <Segment>
        <Comment.Group className="messages">
          {searchTerm
            ? displayMessages(searchResults)
            : displayMessages(messagesRedux)}
        </Comment.Group>
      </Segment>
      <MessagesForm
        currentUser={currentUser}
        channel={channel}
        messagesRef={messagesRef}
        isPrivateChannel={isPrivateChannel}
        getMessagesRef={getMessagesRef}
      />
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  messagesRedux: state.messages,
});

export default connect(mapStateToProps, { addMessage })(Messages);
