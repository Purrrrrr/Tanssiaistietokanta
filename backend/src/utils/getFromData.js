module.exports = function getFromData(data, mapper) {
  if (Array.isArray(data)) {
    return data.map(mapper);
  }
  return [mapper(data)];
};
