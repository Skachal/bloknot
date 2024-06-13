const inputElement = document.getElementById('title');
const createBtn = document.getElementById('create');
const listElement = document.getElementById('list');

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

const decodedToken = jwt_decode(token);

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function getNoteTemplate(note) {
  return `
    <li class="list-group-item d-flex justify-content-between align-items-center" id="note-${note._id}" data-note-id="${note._id}">
        <span>${note.title} (by ${note.userName}, ID: ${note.userId}) - ${formatDate(note.createdAt)}</span>
        <span>
            <button class="btn btn-small btn-danger" ${note.userId !== decodedToken.userId ? 'disabled' : ''}>&times;</button>
        </span>
    </li>
  `;
}

function renderNotes(notes) {
  listElement.innerHTML = '';
  notes.forEach(note => {
    listElement.insertAdjacentHTML('beforeend', getNoteTemplate(note));
  });
}

async function fetchNotes() {
  try {
    const response = await fetch('https://my-bloknot-app.herokuapp.com/api/notes', {
      headers: { 'Authorization': token }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    const notes = await response.json();
    renderNotes(notes);
  } catch (error) {
    console.error('Error fetching notes:', error.message);
  }
}

async function createNote() {
  const title = inputElement.value.trim();
  if (title.length === 0) return;

  try {
    const response = await fetch('https://my-bloknot-app.herokuapp.com/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ title })
    });

    if (!response.ok) {
      throw new Error('Error creating note');
    }

    const newNote = await response.json();
    listElement.insertAdjacentHTML('beforeend', getNoteTemplate(newNote));
    inputElement.value = '';
  } catch (error) {
    console.error('Error creating note:', error.message);
  }
}

async function deleteNote(id) {
  try {
    await fetch(`https://my-bloknot-app.herokuapp.com/api/notes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });

    document.getElementById(`note-${id}`).remove();
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

createBtn.addEventListener('click', createNote);
listElement.addEventListener('click', event => {
  if (event.target.classList.contains('btn-danger')) {
    const listItem = event.target.closest('li');
    const noteId = listItem.dataset.noteId;
    deleteNote(noteId);
  }
});

fetchNotes();
