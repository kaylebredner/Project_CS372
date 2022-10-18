function addNotebook() {
    var noteDiv = document.getElementById("nav_notebooks");
    noteDiv.append(createNewNotebook());
    return false;
}

function createNewNotebook() {
    // Create the structure of the Notebook, which is just an <a>
    var a = document.createElement("a");

    // Set up the new <a> classes then add the text
    a.className = "list-group-item list-group-item-action";
    a.id = "notebook";
    // a.onclick = "showNotebook()"; -> Displays notebook contents in right-side display
    a.append(document.createTextNode("New Notebook"));

    // Return the <a>
    return a;
}