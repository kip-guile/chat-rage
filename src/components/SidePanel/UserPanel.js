import React, { useState, useRef, useEffect } from "react";
import AvatarEditor from "react-avatar-editor";
import firebase from "../../firebase";
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  Button,
} from "semantic-ui-react";

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

const UserPanel = ({ currentUser, primaryColor }) => {
  const avatarEditor = useRef(null);
  const [modal, setModal] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [croppedImage, setCroppedImage] = useState("");
  const [blob, setBlob] = useState("");
  const [uploadedCroppedImage, setUploadedCroppedImage] = useState("");
  const [metadata] = useState({
    contentType: "image/jpeg",
  });
  const [storageRef] = useState(firebase.storage().ref());
  const [userRef] = useState(firebase.auth().currentUser);
  const [usersRef] = useState(firebase.database().ref("users"));
  useEffectSkipFirst(() => {
    const changeAvatar = () => {
      userRef
        .updateProfile({
          photoURL: uploadedCroppedImage,
        })
        .then(() => {
          console.log("Photo URL updated");
          closeModal();
        })
        .catch((err) => console.error(err));

      usersRef
        .child(currentUser.uid)
        .update({ avatar: uploadedCroppedImage })
        .then(() => {
          console.log("user avatar updated");
        })
        .catch((err) => console.error(err));
    };
    changeAvatar();
  }, [uploadedCroppedImage]);
  const handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signed out"));
  };
  const openModal = () => setModal(true);
  const closeModal = () => setModal(false);
  const dropdownOptions = [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{currentUser.displayName}</strong>
        </span>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <span onClick={openModal}>Change Avatar</span>,
    },
    {
      key: "signout",
      text: <span onClick={handleSignout}>Sign Out</span>,
    },
  ];
  const dropdownSelection = () => (
    <Dropdown
      trigger={
        <span>
          <Image src={currentUser.photoURL} spaced="right" avatar />
          {currentUser.displayName}
        </span>
      }
      options={dropdownOptions}
    />
  );
  const handleChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        setPreviewImage(reader.result);
      });
    }
  };
  const handleCropImage = () => {
    if (avatarEditor) {
      avatarEditor.current.getImageScaledToCanvas().toBlob((blob) => {
        let imageUrl = URL.createObjectURL(blob);
        setCroppedImage(imageUrl);
        setBlob(blob);
      });
    }
  };
  const uploadCroppedImage = () => {
    storageRef
      .child(`avatars/user-${userRef.uid}`)
      .put(blob, metadata)
      .then((snap) => {
        snap.ref.getDownloadURL().then((downloadURL) => {
          setUploadedCroppedImage(downloadURL);
        });
      });
  };
  return (
    <Grid style={{ background: primaryColor }}>
      <Grid.Column>
        <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
          <Header inverted floated="left" as="h2">
            <Icon name="code" />
            <Header.Content>ChatRage</Header.Content>
          </Header>
          <Header style={{ padding: "0.25em" }} as="h4" inverted>
            {dropdownSelection()}
          </Header>
        </Grid.Row>
        <Modal basic open={modal} onClose={closeModal}>
          <Modal.Header>Change Avatar</Modal.Header>
          <Modal.Content>
            <Input
              onChange={handleChange}
              fluid
              type="file"
              label="New Avatar"
              name="previewImage"
            />
            <Grid centered stackable columns={2}>
              <Grid.Row centered>
                <Grid.Column className="ui centered aligned grid">
                  {previewImage && (
                    <AvatarEditor
                      ref={avatarEditor}
                      image={previewImage}
                      width={120}
                      height={120}
                      border={50}
                      scale={1.2}
                    />
                  )}
                </Grid.Column>
                <Grid.Column>
                  {croppedImage && (
                    <Image
                      style={{ margin: "3.5em auto" }}
                      width={100}
                      height={100}
                      src={croppedImage}
                    />
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Content>
          <Modal.Actions>
            {croppedImage && (
              <Button color="green" inverted onClick={uploadCroppedImage}>
                <Icon name="save" /> Change Avatar
              </Button>
            )}
            <Button color="green" inverted onClick={handleCropImage}>
              <Icon name="image" /> Preview
            </Button>
            <Button color="red" inverted onClick={closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Grid.Column>
    </Grid>
  );
};

export default UserPanel;
