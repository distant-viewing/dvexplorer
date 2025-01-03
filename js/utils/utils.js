const setClass = function (elem, className, addFlag = true) {
  if (addFlag) {
    elem.classList.add(className);
  } else {
    elem.classList.remove(className);
  }
};

const getData = async function (path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
};

const getSearchParam = function (name, def = '') {
  const url = new URL(window.location.href);
  let np = url.searchParams.get(name);
  if (np == null) {
    np = def;
  }
  return np;
};

const setSearchParam = function (nvpair) {
  const url = new URL(window.location.href);

  for (const [key, value] of Object.entries(nvpair)) {
    url.searchParams.set(key, value);
  }

  history.pushState(null, '', url);
};

const readJsonAsync = function (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);

    reader.readAsText(file);
  });
};

const formatTime = function (seconds) {
  // Extract hours, minutes, seconds, and milliseconds
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  // Format each component to ensure 2 digits for HH, MM, SS, and 3 digits for milliseconds
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(sec).padStart(2, '0');
  const formattedMilliseconds = String(milliseconds).padStart(3, '0');

  // Combine and return the formatted time
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
};

export {
  setClass,
  getSearchParam,
  getData,
  setSearchParam,
  formatTime,
  readJsonAsync,
};
