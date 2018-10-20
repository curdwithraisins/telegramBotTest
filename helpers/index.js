const isHi = (text) => {
    return text.indexOf('hi') !== -1;
}

const isCheck = (text) => {
    return text.indexOf('check') !== -1;
}

const getCity = (text) => {
    return text.split('/')[1];
}

module.exports = {
    isHi,
    isCheck,
    getCity
};