export const createPrivateRoomChat = (idOne, idTwo) => {
  const arrIds = [idOne, idTwo];
  return `chat:${arrIds.sort().join('-')}`;
};
