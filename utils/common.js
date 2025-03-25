function convertObjectToEnum(obj) {
    const enumArr = [];
    Object.values(obj).map((val) => enumArr.push(val));
    return enumArr;
  }

  function getDifferenceOfTwoDatesInTime(currentDate, toDate) {
    let hours = toDate.diff(currentDate, 'hour');
    currentDate = currentDate.add(hours, 'hour');
    let minutes = toDate.diff(currentDate, 'minute');
    currentDate = currentDate.add(minutes, 'minute');
    let seconds = toDate.diff(currentDate, 'second');
    currentDate = currentDate.add(seconds, 'second');
    if (hours) {
      return `${hours} hour, ${minutes} minute and ${seconds} second`;
    }
    return `${minutes} minute and ${seconds} second`;
  }

module.exports = {
    convertObjectToEnum,
    getDifferenceOfTwoDatesInTime
}