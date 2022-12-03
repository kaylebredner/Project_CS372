// Haven't decided what to do with this yet

function addNotebook() {
    const noteDiv = document.getElementById("nav_notebooks");
    noteDiv.append(createNewNotebook());
    return false;
}

function createNewNotebook() {
    // Create the structure of the Notebook, which is an <input>
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("readOnly", "true");

    // Set up the new <input> classes then add the text
    input.className = "list-group-item list-group-item-action";
    input.id = "notebook";
    input.setAttribute("value", "New Notebook");
    input.setAttribute("onclick", "showNotebook()");
    input.setAttribute("ondblclick", "renameNotebook()");

    // Return the <input>
    return input;
}

function renameNotebook() {
    // Toggle editable for element
    return false;
}

function showNotebook() {
    // Change notebook display using notes retrieved from database
    return false;
}