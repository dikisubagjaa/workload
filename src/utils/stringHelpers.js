export const convertCamelToSnake = (obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        acc[snakeKey] = obj[key];
        return acc;
    }, {});
};

export const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0][0].toUpperCase(); 
    }
    const first = words[0][0];
    const last = words[words.length - 1][0];
    return (first + last).toUpperCase();
};