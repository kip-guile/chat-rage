import React, { useState } from "react";
import { uuid } from "uuidv4";
import { Segment, Button, Input } from "semantic-ui-react";
import firebase from "../../firebase";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

const MessagesForm = ({ messagesRef, channel, currentUser }) => {
  const [messageObj, setMessage] = useState({ message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [modal, setModal] = useState(false);
  const [uploadState, setUploadState] = useState("");
  const [storageRef] = useState(firebase.storage().ref());
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
      messagesRef
        .child(channel.id)
        .push()
        .set(createMessage())
        .then(() => {
          setLoading(false);
          setMessage({ message: "" });
          setErrors([]);
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

  const uploadFile = (file, metadata) => {
    const pathToUpload = channel.id;
    const ref = messagesRef;
    const filePath = `chat/public/${uuid()}.jpg`;
    console.log(filePath);
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
  return (
    <Segment className="message__form">
      <Input
        fluid
        onChange={handleChange}
        value={messageObj.message}
        name="message"
        style={{ marginBottom: "0.7em" }}
        label={<Button icon="add" />}
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
