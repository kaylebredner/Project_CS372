let Calendar
let Draggable = FullCalendar.Draggable
let elementClicked

function init() {
    document.addEventListener('mousemove', e => {
       elementClicked = e
    })

    fillNoteList()

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

            //initialize calendar
            Calendar = new FullCalendar.Calendar(calendarEl, {
                headerToolbar: {
                    left: 'prev next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                editable: true,
                droppable: true,
                timeZone: 'none',
                eventChange: function(info){
                    createNewEvent(info.event._def.title, info.event._instance.range.start, info.event._instance.range.end)
                },
                eventReceive: function (info){
                    createNewEvent(info.event._def.title, info.event._instance.range.start, info.event._instance.range.end)
                },
                eventClick: function (info) {
                    info.jsEvent.preventDefault()
                    openContextMenu(info, "calendar")
                }
            })

            Calendar.render()
        })
}

function appendEvent() {
    var eventDiv = document.getElementById("external-events")
    var selector = document.getElementById("add-event-menu")

    eventDiv.append(createNewEventDiv(selector))
}

function createNewEventDiv(option) {
    let outerDiv = document.createElement('div')
    let innerDiv = document.createElement('div')
    let image = document.createElement('img')
    let noteName = option[option.selectedIndex].text
    let newopt = document.createElement('option')

    if(option[option.selectedIndex].value === "-2" || option[option.selectedIndex].value === "-3" || option[option.selectedIndex].value === "-4") return "";
    if(option[option.selectedIndex].value === "-1"){
        noteName = prompt("Please enter a name for your new event.")
        
        if(document.getElementById("save-note-box").checked){ 
            createNewNote(noteName)
            option.append(newopt)
            alert("A blank note has been created for you!")
        }else{
            let child = option.firstChild
        while(child.value != -2){
            child = child.nextSibling
        }

        option.insertBefore(newopt, child)
        }
    }

    image.id = "option-img"
    image.alt = "remove event button"
    image.src = "../images/trashcan.png"
    image.addEventListener('click', function () {
        removeCalendarNote(image)
    })

    innerDiv.className = "fc-event-main"
    innerDiv.id = "event-element"
    innerDiv.append(document.createTextNode(noteName))
    
    outerDiv.className = "fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event"

    newopt.value = noteName
    newopt.append(document.createTextNode(noteName))

    outerDiv.append(innerDiv)
    outerDiv.append(image)
    return outerDiv
}

function toggleCheckBox(){
    let selector = document.getElementById("add-event-menu")
    if(selector[selector.selectedIndex].value != -1){
        document.getElementById("save-note-box").disabled = true
        document.getElementById("save-note-box").checked = false
    }else{
        document.getElementById("save-note-box").disabled = false
    }
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

function removeEventMenu(element) {
    let child = element.lastElementChild
    while (child) {
        element.removeChild(child)
        child = element.lastElementChild
    }

    element.parentElement.classList.remove("menuEnabled")
    element.remove()
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
            removeEventMenu(main)
        })

        //build context menu
        let menuItems = getMenuInfo(menuName, info)
        for(let i = 0; i < menuItems.numItems; i++){
            let item = document.createElement('div')

            if(menuItems.useParent(item)){
                item = item.parentElement
            }

            for(let j = 0; j < menuItems.numClassNames; j++){
                item.classList.add(menuItems.className[j])
            }

            item.classList.add("menuItem")
            item.innerText = menuItems.itemNames[i]
            item.addEventListener('click', function(){
                menuItems.functionNames[i](info)
                removeEventMenu(main)
            })

            main.append(item)
        }
        
        main.append(canc)
    }
}

function getMenuInfo(menuName, info){
    const menu = {
        numItems: 0,
        numClassNames: 0,
        itemNames: [],
        className: [],
        functionNames: [],
        useParent: function(elem){return false}
    }

    switch(menuName){
        case "calendar":
            menu.numItems = 2
            menu.numClassNames = 0
            menu.itemNames = ["Complete", "Delete"]
            menu.functionNames = [function(){completeEvent(info)}, function(){deleteEvent(info)}]
            menu.useParent = function(elem){
                if (elem.classList.contains("fc-event-title")) {
                    return true
                }

                return false
            }
            break;
    }

    return menu
}

function fillNoteList(){
    let allNotes = null//fetch list of notes
    let selector = document.getElementById("add-event-menu")

    for(let i = 0; i < allNotes; i++){
        let option = document.createElement("option")
        option.value = null//grab note ID from DB
        option.text = null//grab note name from DB
        selector.append(option)
    }
}

function createNewEvent(atitle, astart, aend){
    Calendar.addEvent({
        title: atitle,
        start: astart,
        end: aend
    })
}

function createNewNote(){
    //send request to the server to save the note
}

function removeCalendarNote(elem){
    removeEventMenu(elem.parentElement)
}