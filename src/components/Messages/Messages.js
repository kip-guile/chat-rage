import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessagesForm from "./MessagesForm";
import MessageComponent from "./Message";
import firebase from "../../firebase";
import { addMessage } from "../../actions";

const Messages = ({ channel, currentUser, messagesRedux, addMessage }) => {
  const [messages, setMessages] = useState([]);
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
      messagesRef.child(channelId).on("child_added", (snap) => {
        loadedMessages.push(snap.val());
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
  const displayChannelName = (channel) => (channel ? `#${channel.name}` : "");
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

  return (
    <React.Fragment>
      <MessagesHeader
        channelName={displayChannelName(channel)}
        uniqueUsers={uniqueUsers}
        handleSearchChange={handleSearchChange}
        searchLoading={searchLoading}
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
      />
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  messagesRedux: state.messages,
});

export default connect(mapStateToProps, { addMessage })(Messages);
