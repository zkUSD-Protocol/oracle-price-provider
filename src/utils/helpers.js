const { MULTIPLICATION_FACTOR } = require("../constants/others");

function getMAD(array) {
  const median = getMedian(array);
  return getMedian(array.map((value) => Math.abs(value - median)));
}
function getMedian(array) {
  const sorted = array.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function getTimestamp(data) {
  const date = new Date(data);
  return Math.floor(date.getTime() / 1000);
}

function processFloatString(input) {
  const floatValue = parseFloat(input);
  if (isNaN(floatValue)) return "Invalid input";
  const multipliedValue = floatValue * Math.pow(10, MULTIPLICATION_FACTOR);
  const integerValue = Math.floor(multipliedValue);
  return integerValue.toString();
}

module.exports = {
  getMAD,
  getMedian,
  getTimestamp,
  processFloatString,
};
