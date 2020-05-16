import React from "react";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

const MessagesHeader = ({
  channelName,
  uniqueUsers,
  handleSearchChange,
  searchLoading,
}) => {
  return (
    <Segment clearing>
      <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
        <span>
          {channelName}
          <Icon name={"star outline"} color="black" />
        </span>
        <Header.Subheader>{uniqueUsers}</Header.Subheader>
      </Header>
      <Header floated="right">
        <Input
          loading={searchLoading}
          onChange={handleSearchChange}
          size="mini"
          icon="search"
          name="searchTerm"
          placeholder="Search messages"
        />
      </Header>
    </Segment>
  );
};

export default MessagesHeader;
