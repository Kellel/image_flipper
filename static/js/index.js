const form = document.querySelector('form')
form.addEventListener('submit', event => {
  // submit event detected
  event.preventDefault();
  console.log("SUBMIT");
  let data = new FormData(form);

  let requested_url = data.get("image");
  console.log(requested_url);

  let flipper_base_url = new URL("https://flipper.unixinator.com/flip/");
  flipper_base_url.pathname = flipper_base_url.pathname + requested_url;
  urlbox = document.getElementById("urlBox")
  urlbox.innerText = flipper_base_url.toString();
  loadCanvas(flipper_base_url);

})

function loadCanvas(dataURL) {
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');

  // load image from data url
  var imageObj = new Image();
  imageObj.onload = function () {
    context.drawImage(this, 0, 0, imageObj.width, imageObj.height, 0, 0, canvas.width, canvas.height);
  };

  imageObj.src = dataURL;
}


