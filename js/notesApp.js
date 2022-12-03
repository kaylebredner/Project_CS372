import NotesView from "./notesView.js"
import NotesAPI from "./notesAPI.js"

export default class NotesApp {

    constructor(root) {
        this.notes = []
        this.activeNote = null
        this.view = new NotesView(root, this._handlers())

        this._refreshNotes()
    }

    async _refreshNotes() { // Called whenever a note is added, edited, or deleted, and updated the view
        const notes = NotesAPI.getAllNotes() // Returning undefined. Use promise?

        this._setNotes(notes)

        if (notes.length > 0) {
            this._setActiveNote(notes[0])
        }
    }

    _setActiveNote(note) { // Calls the function to set the note passed in as the active note
        this.activeNote = note // Sets the selected note as the active note to be used later
        this.view.updateActiveNote(note)
    }

    _setNotes(notes) { // Update view on the list of notes
        this.notes = notes
        this.view.updateNoteList(notes)
        this.view.updateNotePreviewVisibility(notes.length > 0)
    }

    _handlers() { // Returns an object containing the handlers for the various user actions
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

                NotesAPI.saveNote(newNote)
                this._refreshNotes()
            },
            onNoteEdit: (title, body) => {
                NotesAPI.saveNote({
                    id: this.activeNote.id,
                    title,
                    body
                })

                this._refreshNotes()
            },
            onNoteDelete: noteId => {
                NotesAPI.deleteNote(noteId)
                this._refreshNotes()
            }
        }
    }
}