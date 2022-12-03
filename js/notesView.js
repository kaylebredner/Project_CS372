export default class NotesView {

    // onNoteSelect is run whenever user clicks on a note in the sidebar
    // onNoteAdd is run whenever user clicks the add button
    // onNoteEdit is run whenever user clicks out of the note editor
    // onNoteDelete is run whenever user double clicks on a note in the sidebar
    constructor(root, { onNoteSelect, onNoteAdd, onNoteEdit, onNoteDelete } = {}) {

        // Saving the data so they can be called later on
        this.root = root
        this.onNoteSelect = onNoteSelect
        this.onNoteAdd = onNoteAdd
        this.onNoteEdit = onNoteEdit
        this.onNoteDelete = onNoteDelete

        // Render the initial view of the app
        this.root.innerHTML = `
            <div class="col-sm-4 list-group list-group-flush notes-sidebar" id="nav_notebooks">
                <div id="collection" class="list-group-item list-group-item-success">
                    <b>Notes</b>
                    <button class="add-note" type="button">+</button>
                </div>

                <div class="notes-list list-group-item"></div>
            </div>

            <div class="notes-preview col-sm-8">
                <input type="text" class="note-title" placeholder="Title...">
                <textarea class="note-body" placeholder="Note details..."></textarea>
            </div>
        `

        // Get references to Add button and input fields
        const btnAddNote = this.root.querySelector(".add-note")
        const inpTitle = this.root.querySelector(".note-title")
        const inpBody = this.root.querySelector(".note-body")

        // Event handlers for add btn and input change
        btnAddNote.addEventListener("click", () => {
            this.onNoteAdd()
        })

        try { // Causes error if I don't use a try/catch block for some reason
            [inpTitle, inpBody].forEach(inputField => {
                inputField.addEventListener("blur", () => {
                    const updatedTitle = inpTitle.value.trim()
                    const updatedBody = inpBody.value.trim()

                    this.onNoteEdit(updatedTitle, updatedBody)
                })
            })
        } catch (err) {
            console.log("NotesView input change error: \n" + err) // Never gets called
        }

        // Hide the note editor/preview by default
        this.updateNotePreviewVisibility(false)
    }

    _createListItemHTML(id, title, body, updated) { // Creates the HTML element for a new note
        const MAX_BODY_LENGTH = 60

        return `
            <div class="notes-list-item" data-note-id="${id}">
                <div class="note-small-title">${title}</div>
                <div class="note-small-body">
                    ${body.substring(0, MAX_BODY_LENGTH)}
                    ${body.length > MAX_BODY_LENGTH ? "..." : ""}
                </div>
                <div class="note-small-updated">
                    ${updated.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
                </div>
            </div>
        `
    }

    updateNoteList(notes) { // Updates sidebar containing all the notes
        
        // Get div containing all notes
        const notesListContainer = this.root.querySelector(".notes-list")

        // Empty the list
        notesListContainer.innerHTML = ""

        // Debugging
        console.log(notes)

        // Insert HTML for notes
        for (const note of notes) {
            const html = this._createListItemHTML(note.id, note.title, note.body, new Date(note.updated))

            notesListContainer.insertAdjacentHTML("beforeend", html)
        }

        // Add select/delete events for each note
        notesListContainer.querySelectorAll(".notes-list-item").forEach(listItem => {
            try { // Same as above, this needs to be in a try/catch block for some reason
                listItem.addEventListener("click", () => {
                    this.onNoteSelect(listItem.dataset.noteId)
                })

                listItem.addEventListener("dblclick", () => {
                    const deleteConf = confirm("Are you sure you want to delete this note?")

                    if (deleteConf) {
                        this.onNoteDelete(listItem.dataset.noteId)
                    }
                })
            } catch (err) {
                console.log("NotesView updateNoteList Error: " + err) // Never gets called
            }

        })
    }

    updateActiveNote(note) { // Sets the selected note as the active note

        // Update note preview to display contents of the selected note
        this.root.querySelector(".note-title").value = note.title
        this.root.querySelector(".note-body").value = note.body

        // Remove the 'selected item' styling from all notes
        this.root.querySelectorAll(".notes-list-item").forEach(listItem => {
            listItem.classList.remove("notes-list-item-selected")
        })
        
        // Add the 'selected item' styling for the selected note
        this.root.querySelector(`.notes-list-item[data-note-id="${note.id}"]`).classList.add("notes-list-item-selected")
    }

    updateNotePreviewVisibility(visible) { // Sets the visibility of the notes editor/preview
        this.root.querySelector(".notes-preview").style.visibility = visible ? "visible" : "hidden"
    }
}