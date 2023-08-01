import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector('form'); //refer to the tag name in the html tag
const chatContainer = document.querySelector('#chat_container'); //from the html too but using the id we gave

let loadInterval;

//to make a loader when the application is searching for answers
function loader(element) {
  element.textContent = '';

  //setInterval accepts another callback function and a number in milliseconds
  loadInterval = setInterval(() => {
    //another function etc
    element.textContent += '.';
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300); //the milliseconds number
};

//to make the each answer come letter by letter
function textTyping(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    
    //if the application is still typing the answers
    if (index < text.length) {
      element.innerHTML += text.charAt(index); //get the character by the index in which the answer is given
      index++;
    }
    //if there's no text left
    else {
      clearInterval(interval);
    }
  }, 20);
};

//to generate a unique id for every single message
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16); //16 characters

  return `id-${timestamp}-${hexadecimalString}`;
};

//to differentiate the user or the bot
//do note that the 'message' div is in a single line 
//or else there will be unwanted spaces
function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}" 
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `
  )
};

const handleSubmit = async (e) => {
  
  //prevent reload of browser
  e.preventDefault();

  const data = new FormData(form); //we initialize 'form' at the start

  //user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  //clear the text input
  form.reset();

  //bot's chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data from server -> bot's response
  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: data.get("prompt")
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = " ";

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

    textTyping(messageDiv, parsedData);
  }
  else {
    const err = await response.text();

    messageDiv.innerHTML = "Sorry, something went wrong."

    alert(err);
  }

};

//add event listener to the function to be invoked
form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})