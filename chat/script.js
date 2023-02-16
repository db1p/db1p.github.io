const CLIENT_ID = 'xTAPTSfrPFK7JZVO';

const drone = new ScaleDrone(CLIENT_ID, {
  data: { // Will be sent out as clientData via events
    name: getRandomName(),
    color: getRandomColor(),
  },
});
usernameinthechatvar = getRandomName();
newmessageabouttobesent = ""

let members = [];

drone.on('open', error => {
  if (error) {
    return console.error(error);
  }
  console.log('Successfully connected to Scaledrone');

  const room = drone.subscribe('observable-room', {historyCount: 100});
  room.on('open', error => {
    if (error) {
      return console.error(error);
    }
    console.log('Successfully joined room');
  });
  
  room.on('history_message', ({data}) => {
    console.log(data);
    addMessageToListDOM(data);
  });
  
  room.on('data', data => {
    console.log(data);
    addMessageToListDOM(data);
  });

  room.on('members', m => {
    members = m;
    updateMembersDOM();
  });

  room.on('member_join', member => {
    members.push(member);
    updateMembersDOM();
  });

  room.on('member_leave', ({id}) => {
    const index = members.findIndex(member => member.id === id);
    members.splice(index, 1);
    updateMembersDOM();
  });

});

drone.on('close', event => {
  console.log('Connection was closed', event);
});

drone.on('error', error => {
  console.error(error);
});

function getRandomName() {
  if (document.cookie == "") {
    do {
      var usernameinthechat = prompt("Please enter your username (Choose Wisely. This stays forever)");
    } while (usernameinthechat == "");
    var cookieusername = "name=" + usernameinthechat;
    document.cookie = cookieusername;
  } else { 
    var input = document.cookie.slice(5)
    var cookies = input.split(';');
    usernameinthechat = cookies[0];
  }
  return(usernameinthechat);
}
 

function getRandomColor() {
  return '#' + 0xFFFFFF.toString(16);
}


//------------- DOM STUFF

const DOM = {
  membersCount: document.querySelector('.members-count'),
  membersList: document.querySelector('.members-list'),
  messages: document.querySelector('.messages'),
  input: document.querySelector('.message-form__input'),
  form: document.querySelector('.message-form'),
};

DOM.form.addEventListener('submit', sendMessage);

function sendMessage() {
  const value = DOM.input.value;
  if (value === '') {
    return;
  }
  DOM.input.value = '';
  newmessageabouttobesent = usernameinthechatvar + ":   " + value,
  drone.publish({
    room: 'observable-room',
    message: newmessageabouttobesent
  });
}


function createMemberElement(member) {
  const { name, color } = member.clientData;
  const el = document.createElement('div');
  el.appendChild(document.createTextNode(name));
  el.className = 'member';
  el.style.color = color;
  return el;
}

function updateMembersDOM() {
  DOM.membersCount.innerText = `${members.length} users in room:`;
  DOM.membersList.innerHTML = '';
  members.forEach(member =>
    DOM.membersList.appendChild(createMemberElement(member))
  );
}

function createMessageElement(text) {
  const el = document.createElement('div');
  el.appendChild(document.createTextNode(text));
  el.className = 'message';
  return el;
}

function addMessageToListDOM(text) {
  const el = DOM.messages;
  const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
  el.appendChild(createMessageElement(text));
  if (wasTop) {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }
}
