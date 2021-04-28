let store = Immutable.fromJS({
  rovers: ["Curiosity", "Opportunity", "Spirit", "Perseverance"],
  activeRover: "",
  roversData: [
    { name: "Curiosity", photos: [], manifest: {} },
    { name: "Opportunity", photos: [], manifest: {} },
    { name: "Spirit", photos: [], manifest: {} },
    { name: "Perseverance", photos: [], manifest: {} },
  ],
});

// updateStore is not a pure function because it changes the global state
const updateStore = newState => {
  store = store.mergeDeep(newState);
};

// add our markup to the page
const root = document.getElementById("root");

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = state => {
  const { activeRover, roversData, rovers } = state.toJS();
  const activeRoverData =
    activeRover && roversData.find(el => el.name === activeRover);

  return `
  <header>Mars Rovers</header>
  <main>
    ${RoverSelector(rovers)}
    <section>
    <p>${activeRoverData && RoverManifest(activeRoverData.manifest)}</p>
    <p>${activeRoverData && RoverPhotos(activeRoverData.photos)}</p>
    </section>
    </main>
    <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
const loadRoversData = async () => {
  const mergeRoverData = (name, data) => {
    const output = data.filter(el => el.name === name);
    return Object.assign(output[0], output[1]);
  };

  try {
    const rovers = store.getIn(["rovers"]);
    const getManifestPromises = rovers.map(name => getRoverManifest(name));
    const getPhotosPromises = rovers.map(name => getRoverPhotos(name));
    const results = await Promise.all([
      ...getManifestPromises,
      ...getPhotosPromises,
    ]);

    return rovers.map(name => mergeRoverData(name, results));
  } catch (error) {
    throw error; // re-throw the error unchanged
  }
};

// DOM event listener is not a pure function because it accesses and changes the global store with update and render
window.addEventListener("load", async () => {
  const merged = await loadRoversData();
  updateStore({ roversData: merged });
  render(root, store);
});

// DOM event listener is not a pure function because it accesses and changes the global store with update and render
root.addEventListener("click", async event => {
  const rovers = store.getIn(["rovers"]);
  if (rovers.includes(event.target.innerHTML))
    updateStore({ activeRover: event.target.innerHTML });
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information
const RoverSelector = rovers => {
  return `
  <ul>
    ${rovers.map(rover => `<h3>${rover}</h3>`).join("")}
  </ul>
  `;
};

// Pure function that renders infomation requested from the backend
const RoverPhotos = photos => {
  const PhotoElement = photo => {
    return `
    <li>
        <img src="${photo.img_src}"/>
        <span>${photo.earth_date}</span>
    </li>
    `;
  };

  return `
    <ul>
        ${photos.map(photo => PhotoElement(photo)).join("")}
    </ul>
    `;
};

const RoverManifest = manifest => {
  const ManifestElement = (key, value) => {
    return `
        <li>
        ${key}
        <span>${value}</span>
    </li>`;
  };

  return `
    <ul>
        ${Object.entries(manifest)
          .map(([key, value]) => ManifestElement(key, value))
          .join("")}
    </ul>
    `;
};

// ------------------------------------------------------  API CALLS

const getRoverPhotos = async rover => {
  try {
    const response = await fetch(`http://localhost:3000/photos/${rover}`);
    const roverPhotos = await response.json();

    const photos = roverPhotos.photos.latest_photos;
    return { name: rover, photos };
  } catch (error) {
    throw error; // re-throw the error unchanged
  }
};

const getRoverManifest = async rover => {
  try {
    const response = await fetch(`http://localhost:3000/manifest/${rover}`);
    const roverManifest = await response.json();

    const manifest = roverManifest.manifest.photo_manifest;
    delete manifest.photos;

    return { name: rover, manifest };
  } catch (error) {
    throw error; // re-throw the error unchanged
  }
};
