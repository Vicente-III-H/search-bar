const body = document.querySelector("body");
const backgrounds = [
    "../images/forest.jpg",
    "../images/fall.jpg",
    "../images/pink.jpg",
    "../images/pink-and-green.jpg",
    "../images/pink-and-blue.jpg",
]

const randomBackground = Math.floor(Math.random() * backgrounds.length);
body.style.backgroundImage = `url(${backgrounds[randomBackground]})`;