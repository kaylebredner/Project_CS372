import NotesView from "./notesView.js"

export default class NotesApp {

    constructor(root) {
        this.notes = []
        this.activeNote = null
        this.view = new NotesView(root, this._handlers())

        this._refreshNotes()
    }

    // Saves updated note + inserts new note
    _saveNote(savedNote) {
        const notes = this.notes
        // Check if the note-to-save already exists in the database?
        const exists = notes.find(note => note.id == savedNote.id)

        if (exists) { // Update existing note

            exists.title = savedNote.title
            exists.body = savedNote.body
            exists.updated = new Date().toJSON()

            const xhttp = new XMLHttpRequest()
            xhttp.open("POST", "http://localhost:8080/save_note", true)
            xhttp.send(JSON.stringify(exists))

        } else { // Create new note

            savedNote.username = sessionStorage.getItem('planner-username')
            savedNote.id = Math.floor(Math.random() * 1000000)
            savedNote.updated = new Date().toJSON()

            const xhttp = new XMLHttpRequest()
            xhttp.open("POST", "http://localhost:8080/save_note", true)
            xhttp.send(JSON.stringify(savedNote))
        }
        // Refresh page
        this._refreshNotes() 
    }

    // Deletes note with the specified ID
    _deleteNote(id) {
        const notes = this.notes
        // Get the note-to-delete
        const deleteNote = notes.find(note => note.id == id)
        
        // Send updated list to server via POST request
        const xhttp = new XMLHttpRequest()
        xhttp.open("POST", "http://localhost:8080/delete_note", true)
        xhttp.send(JSON.stringify(deleteNote))
    }

    // Called whenever a note is added, edited, or deleted, and updates the view
    _refreshNotes() {
        // Get full list of notes
        const ob = this
        const xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                const notes = JSON.parse(xhttp.response)

                const sortedNotes = notes.sort(function (a, b) {
                    return new Date(a.updated) > new Date(b.updated) ? -1 : 1
                })

                // Send list of notes to view
                ob._setNotes(sortedNotes)

                // Set the first note as active note
                if (sortedNotes.length > 0) ob._setActiveNote(sortedNotes[0])
            }
        }
        // Request the server for list of notes
        xhttp.open("GET", "http://localhost:8080/get_notes", true)
        xhttp.send()
    }

    // Calls the function to set the note passed in as the active note
    _setActiveNote(note) {
        this.activeNote = note // Sets the selected note as the active note to be used later
        this.view.updateActiveNote(note)
    }

    // Update view on the list of notes
    _setNotes(notes) {
        this.notes = notes
        this.view.updateNoteList(notes)
        this.view.updateNotePreviewVisibility(notes.length > 0)
    }

    // Returns an object containing the handlers for the various user actions
    _handlers() {
        return {
            onNoteSelect: noteId => {
                const selectedNote = this.notes.find(note => note.id == noteId)
                this._setActiveNote(selectedNote)
            },
            onNoteAdd: () => {
                const newNote = {
                    title: "New Note...",
                    body: "This is an empty note..."
                }

                this._saveNote(newNote)
                this._refreshNotes()
            },
            onNoteEdit: (title, body) => {
                this._saveNote({
                    id: this.activeNote.id,
                    title: title,
                    body: body
                })

                this._refreshNotes()
            },
            onNoteDelete: noteId => {
                this._deleteNote(noteId)
                this._refreshNotes()
            }
        }
    }
}