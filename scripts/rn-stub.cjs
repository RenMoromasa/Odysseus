module.exports = {
  Platform: {
    OS: 'web',
    select: (obj) => (obj.web !== undefined ? obj.web : obj.default),
  },
};
