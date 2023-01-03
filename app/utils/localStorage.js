const getStorage = (key, parse = true) => {
  return parse ? JSON.parse(localStorage.getItem(key)) : localStorage.getItem(key)
}

const setStorage = (key, value, stringify = true) => {
  localStorage.setItem(key, stringify ? JSON.stringify(value) : value)
}

const removeStorage = (key) => {
  localStorage.removeItem(key)
}

export { getStorage, setStorage, removeStorage }