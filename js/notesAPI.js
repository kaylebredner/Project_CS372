export default class NotesAPI {

    static getAllNotes() { // Retrieves all existing notes
        
        // Retrieve all notes associated with key in local storage or create it if it doesn't exist
        const notes = JSON.parse(localStorage.getItem("notesapp-notes") || "[]")

        return notes.sort((a, b) => { // Return list sorted by updated date
            return new Date(a.updated) > new Date(b.updated) ? -1 : 1
        })
    }

    static saveNote(savedNote) { // Saves updated note + inserts new note
        const notes = NotesAPI.getAllNotes()
        const exists = notes.find(note => note.id == savedNote.id) // Does the note-to-save exist?

        if (exists) { // Update existing note

            exists.title = savedNote.title
            exists.body = savedNote.body
            exists.updated = new Date().toISOString()

        } else { // Create new note

            savedNote.id = Math.floor(Math.random() * 1000000) // TODO: Create anon function to check if id already exists in notes
            savedNote.updated = new Date().toISOString()
            notes.push(savedNote)
        }

        localStorage.setItem("notesapp-notes", JSON.stringify(notes)) // Save updated notes list to local storage
    }

    static deleteNote(id) { // Deletes note with the specified ID
        const notes = NotesAPI.getAllNotes()
        const newNotes = notes.filter(note => note.id != id) // List of all notes EXCEPT the note to be deleted

        localStorage.setItem("notesapp-notes", JSON.stringify(newNotes))
    }
}