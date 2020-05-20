import React, { useState, useRef } from "react";
import { uuid } from "uuidv4";
import { Segment, Button, Input } from "semantic-ui-react";
import firebase from "../../firebase";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

const MessagesForm = ({
  messagesRef,
  channel,
  currentUser,
  isPrivateChannel,
  getMessagesRef,
}) => {
  const messageInputRef = useRef(null);
  const [messageObj, setMessage] = useState({ message: "" });
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [modal, setModal] = useState(false);
  const [uploadState, setUploadState] = useState("");
  const [storageRef] = useState(firebase.storage().ref());
  const [typingRef] = useState(firebase.database().ref("typing"));
  const [percentUploaded, setPercentUploaded] = useState(0);
  const handleChange = (e) => {
    setMessage({ [e.target.name]: e.target.value });
  };
  const createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: currentUser.uid,
        name: currentUser.displayName,
        avatar: currentUser.photoURL,
      },
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = messageObj.message;
    }
    return message;
  };
  const openModal = () => {
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
  };
  const sendMessage = () => {
    if (messageObj.message) {
      setLoading(true);
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(createMessage())
        .then(() => {
          setLoading(false);
          setMessage({ message: "" });
          setErrors([]);
          typingRef.child(channel.id).child(currentUser.uid).remove();
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
          setErrors(errors.concat(err));
        });
    } else {
      setErrors(errors.concat({ message: "Add a message" }));
    }
  };
  const sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(createMessage(fileUrl))
      .then(() => {
        setUploadState("done");
      })
      .catch((err) => {
        console.error(err);
        setErrors(errors.concat(err));
      });
  };

  const getPath = () => {
    if (isPrivateChannel) {
      return `chat/private/${channel.id}`;
    } else {
      return `chat/public`;
    }
  };

  const uploadFile = (file, metadata) => {
    const pathToUpload = channel.id;
    const ref = getMessagesRef();
    const filePath = `${getPath()}/${uuid()}.jpg`;
    setUploadState("uploading");
    let uploadTask = storageRef.child(filePath).put(file, metadata);
    const run = () => {
      uploadTask.on(
        "state_changed",
        (snap) => {
          const percentUploaded = Math.round(
            (snap.bytesTransferred / snap.totalBytes) * 100
          );
          setPercentUploaded(percentUploaded);
        },
        (err) => {
          console.error(err);
          setErrors(errors.concat(err));
          setUploadState("error");
          uploadTask = null;
        },
        () => {
          uploadTask.snapshot.ref
            .getDownloadURL()
            .then((downloadUrl) => {
              sendFileMessage(downloadUrl, ref, pathToUpload);
            })
            .catch((err) => {
              console.error(err);
              setErrors(errors.concat(err));
              setUploadState("error");
              uploadTask = null;
            });
        }
      );
    };
    run();
  };
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.keyCode === 13) {
      sendMessage();
    }
    const { message } = messageObj;
    if (message) {
      typingRef
        .child(channel.id)
        .child(currentUser.uid)
        .set(currentUser.displayName);
    } else {
      typingRef.child(channel.id).child(currentUser.uid).remove();
    }
  };
  const handleTogglePicker = () => {
    setEmojiPicker(!emojiPicker);
  };
  const handleAddEmoji = (emoji) => {
    const oldMessage = messageObj.message;
    const newMessage = colonToUniCode(` ${oldMessage} ${emoji.colons} `);
    setMessage({ message: newMessage });
    setEmojiPicker(false);
    setTimeout(() => messageInputRef.current.focus(), 0);
  };
  const colonToUniCode = (message) => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, (x) => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };
  return (
    <Segment className="message__form">
      {emojiPicker && (
        <Picker
          set="apple"
          onSelect={handleAddEmoji}
          className="emojipicker"
          title="Pick your emoji"
          emoji="point_up"
        />
      )}
      <Input
        fluid
        onChange={handleChange}
        ref={messageInputRef}
        onKeyDown={handleKeyDown}
        value={messageObj.message}
        name="message"
        style={{ marginBottom: "0.7em" }}
        label={
          <Button
            content={emojiPicker ? "Close" : null}
            icon={emojiPicker ? "close" : "add"}
            onClick={handleTogglePicker}
          />
        }
        labelPosition="left"
        className={
          errors && errors.some((error) => error.message.includes("message"))
            ? "error"
            : ""
        }
        placeholder="Write your message"
      />
      <Button.Group icon widths="2">
        <Button
          onClick={sendMessage}
          color="orange"
          content="Add Reply"
          labelPosition="left"
          icon="edit"
          disabled={loading}
        />
        <Button
          color="teal"
          onClick={openModal}
          disabled={uploadState === "uploading"}
          content="Upload Media"
          labelPosition="right"
          icon="cloud upload"
        />
      </Button.Group>
      <FileModal
        uploadFile={uploadFile}
        modal={modal}
        closeModal={closeModal}
      />
      <ProgressBar
        uploadState={uploadState}
        percentUploaded={percentUploaded}
      />
    </Segment>
  );
};

export default MessagesForm;
