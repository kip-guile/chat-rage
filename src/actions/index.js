import * as actionTypes from "./types";

export const setUser = (user) => {
  return {
    type: actionTypes.SET_USER,
    payload: { currentUser: user },
  };
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER,
  };
};

// CHANNEL ACTIONS
export const setCurrentChannel = (channel) => {
  return {
    type: actionTypes.SET_CURRENT_CHANNEL,
    payload: { currentChannel: channel },
  };
};

export const setPrivateChannel = (isPrivateChannel) => {
  return {
    type: actionTypes.SET_PRIVATE_CHANNEL,
    payload: {
      isPrivateChannel,
    },
  };
};

// MESSAGE ACTIONS
export const addMessage = (messages) => {
  return {
    type: actionTypes.ADD_MESSAGES,
    payload: messages,
  };
};

// USER ACTIONS
export const addUsers = (users) => {
  return {
    type: actionTypes.ADD_USERS,
    payload: users,
  };
};

export const setUserPosts = (userPosts) => {
  return {
    type: actionTypes.SET_USER_POSTS,
    payload: {
      userPosts,
    },
  };
};

// color actions
export const setColors = (primaryColor, secondaryColor) => {
  return {
    type: actionTypes.SET_COLORS,
    payload: {
      primaryColor,
      secondaryColor,
    },
  };
};
