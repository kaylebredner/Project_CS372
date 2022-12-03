let Calendar
let Draggable = FullCalendar.Draggable
let elementClicked

//init functions
function init() {
    //The calendar menu was not functioning properly with onClick so this is being used to get the cursor x and y
    document.addEventListener('mousemove', e => {
        elementClicked = e
    })

    //Populate the drop down menu with notes and events from database
    //fillNoteList()
    fillEventList()

    //Initialize drag and drop (from FullCalendar)
    document.addEventListener('DOMContentLoaded',
        function () {
            var containerEl = document.getElementById('external-events')
            var calendarEl = document.getElementById('calendar')

            // initialize the external events

            new Draggable(containerEl, {
                itemSelector: '.fc-event',
                eventData: function (eventEl) {
                    return {
                        title: eventEl.innerText,
                        editable: true,
                        extendedProps: {
                            completed: false,
                            id: null
                        },
                        classNames: ["calendarevent"]
                    }
                }
            })

            //initialize calendar (from FullCalendar)
            Calendar = new FullCalendar.Calendar(calendarEl, {
                headerToolbar: {
                    left: 'prev next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                editable: true,
                droppable: true,
                timeZone: 'none',
                //This detects when the user moves/extends an event in one of the view and updates it in the database
                eventChange: function (info) {
                    createNewEvent(info.event._def.title, info.event._instance.range.start, info.event._instance.range.end)
                },
                //This detects when the user drops an event on to the calendar and makes a new entry into the database if it doesn't exist already
                eventReceive: function (info) {
                    createNewEvent(info.event._def.title, info.event._instance.range.start, info.event._instance.range.end)
                },
                //This is to open the menu to delete/complete tasks
                eventClick: function (info) {
                    info.jsEvent.preventDefault()
                    openContextMenu(info, "calendar")
                }
            })

            Calendar.render()
        })
}

//Interactations with left event menu
function toggleCheckBox() {
    let selector = document.getElementById("add-event-menu")
    if (selector[selector.selectedIndex].value != -1) {
        document.getElementById("save-note-box").disabled = true
        document.getElementById("save-note-box").checked = false
    } else {
        document.getElementById("save-note-box").disabled = false
    }
}

function appendEvent() {
    let eventDiv = document.getElementById("external-events")
    let selector = document.getElementById("add-event-menu")
    let notename = selector[selector.selectedIndex].text
    let itemExists = false;

    if (selector[selector.selectedIndex].value === "-2" || selector[selector.selectedIndex].value === "-3" || selector[selector.selectedIndex].value === "-4") return "";
    if (selector[selector.selectedIndex].value === "-1") {
        notename = prompt("Please enter a name for your new event.")
        for(let j = 0; j < selector.length; j++) {if(selector[j] === notename) itemExists = true}
        if(!itemExists) addMenuItem(selector, notename)
    }

    elements = document.getElementsByClassName('event-element')
    for(let i = 0; i < elements.length; i++){
        if(elements[i].innerText === notename) return
    }
    eventDiv.append(createNewEventDiv(notename))
}

function createNewEventDiv(name) {
    let outerDiv = document.createElement('div')
    let innerDiv = document.createElement('div')
    let image = document.createElement('img')
    let noteName = name

    image.id = "option-img"
    image.alt = "remove event button"
    image.src = "../images/trashcan.png"
    image.addEventListener('click', function () {
        removeContextMenu(image.parentElement)
    })

    innerDiv.className = "fc-event-main event-element"
    innerDiv.innerText = noteName

    outerDiv.className = "fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event"

    outerDiv.append(innerDiv)
    outerDiv.append(image)
    return outerDiv
}

function addMenuItem(option, noteName){
    let newopt = document.createElement('option')

    newopt.value = noteName
    newopt.append(document.createTextNode(noteName))

    if (document.getElementById("save-note-box").checked) {
        createNewNote(noteName)
        option.append(newopt)
        alert("A blank note has been created for you!")
    } else {
        let child = option.firstChild
        while (child.value != -2) {
            child = child.nextSibling
        }

        option.insertBefore(newopt, child)
    }
} 

//On Calendar interactions
function removeContextMenu(element) {
    let child = element.lastElementChild
    while (child) {
        element.removeChild(child)
        child = element.lastElementChild
    }

    element.parentElement.classList.remove("menuEnabled")
    element.remove()
}

function completeEvent(info) {
    if (!info.event.classNames.includes("completed")) {
        info.event.setProp("classNames", info.event.classNames.concat(['completed']))
    }
    return false
}

function deleteEvent(info) {
    info.event.remove()
    return false
}

function openContextMenu(info, menuName) {
    let element = document.elementFromPoint(elementClicked.clientX, elementClicked.clientY)

    element = element.parentElement

    if (!element.classList.contains("menuEnabled") && !element.classList.contains("menuItem")) {

        element.classList.add("menuEnabled")

        //create container div for the menu
        let main = document.createElement('div')
        main.classList.add("contextMenu")
        element.append(main)

        //create the close option for every context menu
        let canc = document.createElement('div')
        canc.classList.add("menuItem")
        canc.classList.add("menuItem-close")
        canc.innerText = "Close"
        canc.addEventListener('click', function () {
            removeContextMenu(main)
        })

        //build context menu
        let menuItems = getMenuInfo(menuName, info)
        for (let i = 0; i < menuItems.numItems; i++) {
            let item = document.createElement('div')

            if (menuItems.useParent(item)) {
                item = item.parentElement
            }

            for (let j = 0; j < menuItems.numClassNames; j++) {
                item.classList.add(menuItems.className[j])
            }

            item.classList.add("menuItem")
            item.innerText = menuItems.itemNames[i]
            item.addEventListener('click', function () {
                menuItems.functionNames[i](info)
                removeContextMenu(main)
            })

            main.append(item)
        }

        main.append(canc)
    }
}

function getMenuInfo(menuName, info) {
    const menu = {
        numItems: 0,
        numClassNames: 0,
        itemNames: [],
        className: [],
        functionNames: [],
        useParent: function (elem) { return false }
    }

    switch (menuName) {
        case "calendar":
            menu.numItems = 2
            menu.numClassNames = 0
            menu.itemNames = ["Complete", "Delete"]
            menu.functionNames = [function () { completeEvent(info) }, function () { deleteEvent(info) }]
            menu.useParent = function (elem) {
                if (elem.classList.contains("fc-event-title")) {
                    return true
                }

                return false
            }
            break;
    }

    return menu
}

//Interact with database
function createNewEvent(atitle, astart, aend) {
    const event = {
        username: sessionStorage.getItem("planner-username"),
        title: atitle,
        start: astart,
        end: aend
    }

    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:8080/createvent", true)
    xhttp.send(JSON.stringify(event))
}

function createNewNote() {
    const xhttp = new XMLHttpRequest();
    const selector = document.getElementById("add-event-menu")

    let payload = {
        username: sessionStorage.getItem("planner-username"),
        noteName: selector[selector.selectedIndex.value]
    }

    xhttp.open("POST", "http://localhost:8080/createnote", true)
    xhttp.send(payload)
}

//Pulls all of the users notes from the DB and puts them in th drop down list if they want to put them on the calendar
function fillNoteList() {
    let allNotes = null//fetch list of notes
    let selector = document.getElementById("add-event-menu")

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            allNotes = xhttps.response
        }
    }

    xhttp.open("POST", "http://localhost:8080/fillnotes", true)
    xhttp.send(sessionStorage.getItem("planner-username"))

    for (let i = 0; i < allNotes; i++) {
        let option = document.createElement("option")
        option.value = null//grab note ID from DB
        option.text = null//grab note name from DB
        selector.append(option)
    }
}

function fillEventList() {
    let allEvents;//fetch list of notes
    let selector;

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            allEvents = JSON.parse(xhttp.response)
            selector = document.getElementById("add-event-menu")
            
            for (let i = 0; i < allEvents.length; i++) {
                let option = document.createElement("option")
                option.value = allEvents[i].title
                option.text = allEvents[i].title

                document.getElementById("external-events").append(createNewEventDiv(allEvents[i].title))
                addMenuItem(selector, allEvents[i].title)

                Calendar.addEvent({
                    title: allEvents[i].title,
                    start: new Date(allEvents[i].start),
                    end: new Date(allEvents[i].end),
                    allDay: (new Date(allEvents[i].start).toTimeString() === new Date(allEvents[i].end).toTimeString())
                })
            }
        }
    }

    xhttp.open("POST", "http://localhost:8080/fillevents", true)
    xhttp.send(sessionStorage.getItem("planner-username"))
}