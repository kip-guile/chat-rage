import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessagesForm from "./MessagesForm";
import MessageComponent from "./Message";
import firebase from "../../firebase";
import { addMessage, setIsChannelStarred, setUserPosts } from "../../actions";
import Typing from "./Typing";

function useEffectSkipFirst(fn, arr) {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    fn();
  }, arr);
}

const Messages = ({
  channel,
  currentUser,
  messagesRedux,
  addMessage,
  isPrivateChannel,
  setUserPosts,
}) => {
  const [messages, setMessages] = useState([]);
  const [privateMessagesRef] = useState(
    firebase.database().ref("privateMessages")
  );
  const [searchResults, setSearchResults] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [usersRef] = useState(firebase.database().ref("users"));
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [isChannelStarred, setIsChannelStarred] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [uniqueUsers, setNumUniqueUsers] = useState("");
  const [messagesRef] = useState(firebase.database().ref("messages"));
  const [typingRef] = useState(firebase.database().ref("typing"));
  const [connectedRef] = useState(firebase.database().ref(".info/connected"));

  useEffectSkipFirst(() => {
    starChannel();
  }, [isChannelStarred]);
  useEffect(() => {
    const addListeners = (channelId) => {
      addMessageListener(channelId);
      addTypingListeners(channelId);
    };
    const addTypingListeners = (channelId) => {
      let typingUsersArr = [];
      typingRef.child(channelId).on("child_added", (snap) => {
        if (snap.key !== currentUser.uid) {
          typingUsersArr = typingUsersArr.concat({
            id: snap.key,
            name: snap.val,
          });
          setTypingUsers(typingUsersArr);
        }
      });
      typingRef.child(channelId).on("child_removed", (snap) => {
        const index = typingUsersArr.findIndex((user) => user.id === snap.key);
        if (index !== -1) {
          typingUsersArr = typingUsersArr.filter(
            (user) => user.id !== snap.key
          );
          setTypingUsers(typingUsersArr);
        }
      });
      connectedRef.on("value", (snap) => {
        if (snap.val() === true) {
          typingRef
            .child(channelId)
            .child(currentUser.uid)
            .onDisconnect()
            .remove((err) => {
              if (err !== null) {
                console.error(err);
              }
            });
        }
      });
    };
    const addUsersStarsListener = (channelId, userId) => {
      usersRef
        .child(userId)
        .child("starred")
        .once("value")
        .then((data) => {
          if (data.val() !== null) {
            const channelIds = Object.keys(data.val());
            const prevStarred = channelIds.includes(channelId);
            setIsChannelStarred(prevStarred);
          }
        });
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
    const countUserPosts = (messages) => {
      let userPosts = messages.reduce((acc, message) => {
        if (message.user.name in acc) {
          acc[message.user.name].count += 1;
        } else {
          acc[message.user.name] = {
            avatar: message.user.avatar,
            count: 1,
          };
        }
        return acc;
      }, {});
      setUserPosts(userPosts);
    };
    const addMessageListener = (channelId) => {
      console.log(channelId);
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
        countUserPosts(loadedMessages);
      });
    };
    if (channel && currentUser) {
      addListeners(channel.id);
      addUsersStarsListener(channel.id, currentUser.uid);
    }
  }, [messages.length, messagesRedux.length, typingUsers.length]);

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
  const starChannel = () => {
    if (isChannelStarred) {
      usersRef.child(`${currentUser.uid}/starred`).update({
        [channel.id]: {
          name: channel.name,
          details: channel.details,
          createdBy: {
            name: channel.createdBy.name,
            avatar: channel.createdBy.avatar,
          },
        },
      });
    } else {
      usersRef
        .child(`${currentUser.uid}/starred`)
        .child(channel.id)
        .remove((err) => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
  };
  const handleStar = () => {
    setIsChannelStarred(!isChannelStarred);
  };
  const displayTypingUsers = (users) =>
    users.length > 0 &&
    users.map((user) => (
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "0.2em" }}
        key={user.id}
      >
        <span className="user__typing">{user.name} is typing</span> <Typing />
      </div>
    ));
  return (
    <React.Fragment>
      <MessagesHeader
        channelName={displayChannelName(channel)}
        uniqueUsers={uniqueUsers}
        handleSearchChange={handleSearchChange}
        searchLoading={searchLoading}
        isPrivateChannel={isPrivateChannel}
        handleStar={handleStar}
        isChannelStarred={isChannelStarred}
      />
      <Segment>
        <Comment.Group className="messages">
          {searchTerm
            ? displayMessages(searchResults)
            : displayMessages(messagesRedux)}
          {displayTypingUsers(typingUsers)}
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
  starred: state.starred,
});

export default connect(mapStateToProps, { addMessage, setUserPosts })(Messages);
