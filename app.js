const clock = document.querySelector(".clock");

function getTime() {
  const date = new Date();
  const hours = date.getHours();
  const minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
  const seconds = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
  clock.innerHTML = `${hours}:${minutes}:${seconds} ${
    hours < "12" ? "AM" : "PM"
  } `;
}

setInterval(getTime, 1000);
