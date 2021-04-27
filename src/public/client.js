//const { update } = require("immutable")

let store = Immutable.fromJS({
  apod: "",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
  activeRover: {
    name: "Curiosity",
    photos: [],
    manifest: {},
  },
});

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (state, newState) => {
  const bothApiCallsFetched = state =>
    state.activeRover.photos.length !== 0 &&
    Object.keys(state.activeRover.manifest).length !== 0;

  store = state.mergeDeep(newState);
  if (bothApiCallsFetched(store.toJS())) render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = state => {
  const {
    activeRover: { name, photos, manifest },
    rovers,
  } = state.toJS();

  return `
  <header></header>
  <main>
    ${ActiveRover(name)}
    ${RoverSelector(rovers)}
    <section>
      <p>${RoverManifest(manifest)}</p>
      <p>${RoverPhotos(photos)}</p>
    </section>
  </main>
  <footer></footer>
  `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

const RoverSelector = rovers => {
  return `
  <select>
    ${rovers.map(rover => `<option>${rover}</option>`)}
  </select>
  `;
};

// Pure function that renders conditional information
const ActiveRover = name => {
  return name ? `<h1>${name}</h1>` : null;
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

  if (photos.length === 0) getRoverPhotosOfTheDay();

  return `
    <ul>
        ${photos.map(photo => PhotoElement(photo))}
    </ul>
    `;
};

const RoverManifest = manifest => {
  const ManifestElement = value => {
    return `
        <li>
        <span>${value}</span>
    </li>`;
  };

  if (Object.keys(manifest).length === 0) getRoverManifest();

  return `
    <ul>
        ${Object.values(manifest).map(value => ManifestElement(value))}
    </ul>
    `;
};

// ------------------------------------------------------  API CALLS

const getRoverPhotosOfTheDay = async () => {
  try {
    const name = store.getIn(["activeRover", "name"]);
    const response = await fetch(`http://localhost:3000/photos/${name}`);
    const roverPhotos = await response.json();

    const photos = roverPhotos.photos.latest_photos;
    updateStore(store, { activeRover: { photos } });
  } catch (error) {
    console.log(error);
  }
};

const getRoverManifest = async () => {
  try {
    const name = store.getIn(["activeRover", "name"]);
    const response = await fetch(`http://localhost:3000/manifest/${name}`);
    const roverManifest = await response.json();

    const manifest = roverManifest.manifest.photo_manifest;
    delete manifest.photos;
    updateStore(store, { activeRover: { manifest } });
  } catch (error) {
    console.log(error);
  }
};
