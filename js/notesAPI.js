export default class NotesAPI {

    static getAllNotes() { // Retrieves all existing notes

        // Retrieve all notes associated with key in local storage or create it if it doesn't exist
        // const notes = JSON.parse(localStorage.getItem("notesapp-notes") || "[]")

        // Get all notes in Notes collection in MongoDB here and store them in notes variable
        $.ajax({
            url: "/get_notes",
            type: "GET",
            success: async function (result) {

                // Check the contents of result. Make sure it's an array of note objects or json data
                console.log(result)

                const notes = JSON.parse(result)
                return await notes.sort((a, b) => { // Return list sorted by updated date
                    return new Date(a.updated) > new Date(b.updated) ? -1 : 1
                })
            },
            error: (error) => {
                console.log("Error in getAllNotes: \n" + error)
            }
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

        // Save updated notes list to local storage
        // localStorage.setItem("notesapp-notes", JSON.stringify(notes))

        // Save new notes list to Notes collection in MongoDB here
        // Make POST request to server
        $.ajax({
            url: "/save_notes",
            type: "POST",
            data: JSON.stringify(notes),
            success: (result) => {
                console.log(result, "Post Request sent")
            },
            error: (error) => {
                console.error(error);
            }
        })
    }

    static async deleteNote(id) { // Deletes note with the specified ID
        const notes = await NotesAPI.getAllNotes()
        const newNotes = notes.filter(note => note.id != id) // List of all notes EXCEPT the note to be deleted

        // localStorage.setItem("notesapp-notes", JSON.stringify(newNotes))

        // Save new notes list to Notes collection in MongoDB here
        // Make POST request to server
        await $.ajax({
            url: "server.js/save",
            type: "POST",
            data: JSON.stringify(notes),
            success: (result) => {
                console.log("Post Request sent")
            },
            error: (error) => {
                console.error(error);
            }
        })
    }
}