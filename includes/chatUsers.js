const users = [];

function addChatUser(id, username, room) {
  const user = { id, username, room };
  users.push(user);
  return user;
}

function getChatUser(id) {
  return users.find(user => user.id === id);
}

function removeChatUser(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getRoomId(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  addChatUser,
  getChatUser,
  removeChatUser,
  getRoomId
};