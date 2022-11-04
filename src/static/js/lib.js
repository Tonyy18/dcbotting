let bot = null;

const StatementOptions = {
    "equals": function(val1, val2) {
        return val1 == val2
    },
    "doesn not equal": function(val1, val2) {
        return val1 != val2
    },
    "includes": function(val1, val2) {
        return val1.includes(val2)
    },
    "starts with": function(val1, val2) {
        console.log(val1.substring(0, val2.length))
        return val1.substring(0, val2.length) == val2;
    },
    "ends with": function(val1, val2) {
        return val1.substring(val1.length - val2.length, val1.length) == val2;
    },
    "first word equals": function(val1, val2) {
        return val1.split(" ")[0] == val2;
    },
    "exists": function(val1, val2) {
        return typeof val1 != "undefined"
    }
}

// ---------------- PROJECT ----------------

const project = $("#project"); //Component list
project.notice = new Notice("#project-notice");
const projectWrapper = document.getElementById("projectWrapper")
project.addEvent = function(event) {
    const found = project.find(".component[data-name='" + event + "']")
    if(found.length) {
        highlight(found[0]);
        return;
    }
    const dom = buildEventDom(event);
    project.children(".no-components").hide();
    highlightIn(dom, this, 1000)
    dom.addClass("active");
    project.selected = dom;
    unsaved();
    return dom
}


project.addMethod = function(methodName) {
    //Add a method to selected event
    if(project.selected == null) return; //No event selected
    
    const dom = buildMethodDom(methodName);
    //Append method dom to selected event dom
    project.selected.find(".no-components").hide();
    project.selected.find(".component-list").append(dom);

    project.selected.find(".component").removeClass("active");
    dom.addClass("active");
    unsaved();
    return dom
}
project.error = function(target) {

    //Highlights any component with red, including its parent to make a trail to the children component.

    if(typeof target == "string") {
        target = project.find(target);
    }

    if($(target).attr("type") == "file") {
        target = $(target).parents(".component-file");
    }

    $(target).addClass("error").effect("bounce");
    $(target).parents(".component").addClass("error").effect("bounce");
    setTimeout(function() {
        $(target).removeClass("error");
        $(target).parents(".component").removeClass("error");
    }, 10000) //ms

}
function projectToJson() {
    const data = {
        "meta": {
            "version": "1.0.0",
            "created": new Date()
        },
        "data": {

        }
    }
    const events = $("#project > .component");
    if(events.length == 0) {
        return;
    }
    for(let a = 0; a < events.length; a++) {
        const event = events[a];
        const eventName = $(event).attr("data-name");
        data["data"][eventName] = {"expressions":[],"methods": {}};
        const inputRows = $(event).find("> .component-dropdown > .component-statements .input-row");
        for(let b = 0; b < inputRows.length; b++) {
            const inputRow = $(inputRows[b]);
            const value1 = inputRow.find("[name='value1']").val();
            const value2 = inputRow.find("[name='value2']").val();
            const delimeter = inputRow.find("[name='delimeter']").val();
            data["data"][eventName]["expressions"].push({
                "value1": value1,
                "delimeter": delimeter,
                "value2": value2
            })
        }
        const methods = $(event).find(".component-list > .component");
        for(let b = 0; b < methods.length; b++) {
            const method = $(methods[b]);
            const methodName = method.attr("data-name");
            data["data"][eventName]["methods"][methodName] = {"expressions":[], "inputs":{}}
            const inputRows = $(method).find("> .component-dropdown > .component-statements .input-row");
            for(let b = 0; b < inputRows.length; b++) {
                const inputRow = $(inputRows[b]);
                const value1 = inputRow.find("[name='value1']").val();
                const value2 = inputRow.find("[name='value2']").val();
                const delimeter = inputRow.find("[name='delimeter']").val();
                data["data"][eventName]["methods"][methodName]["expressions"].push({
                    "value1": value1,
                    "delimeter": delimeter,
                    "value2": value2
                })
            }

            const inputs = method.find(".component-inputs:not(.component-statements) input, .component-inputs:not(.component-statements) select, .component-inputs:not(.component-statements) textarea");
            for(let c = 0; c < inputs.length; c++) {
                const input = $(inputs[c]);
                let value = input.val()
                if(input.attr("type") == "checkbox") {
                    value = input.is(":checked");
                }
                data["data"][eventName]["methods"][methodName]["inputs"][input.attr("name")] = value;
            }
        }
    }
    return data;
}

project.download = function() {
    const data = projectToJson();
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
    element.setAttribute('download', "bot.dcbotting");

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element)
}

//Display component dropdown
$(document).on("click", ".component-visual", function() {
    const parent = $(this).parent();
    if(parent.children(".component-dropdown").length == 0) return; //No childrens to display

    if($(this).parent().hasClass("active")) {
        parent.removeClass("active");
        if(project.selected != null && parent.attr("data-type") == "event") {
            if(parent.attr("data-name") == project.selected.attr("data-name")) {
                project.selected = null;
            }
        }
        return;
    }
    $(".component").removeClass("active");
    $(this).parents(".component").addClass("active");
})

project.on("click", ".component[data-type='event']", function() {
    project.selected = $(this); //Where to append methods
})

function unsaved() {
    $("#submit").addClass("unsaved")
}

project.on("keydown", "input, textarea", function() {
    unsaved();
})
project.on("change", "select", function() {
    unsaved();
})
project.on("click", ".component .new-statement", function() {
    const parent = $(this).parent().children(".component-statements");
    const inputs = buildStatementInput()
    $(this).before(inputs);
})
project.on("click", ".component .delete-statement", function() {
    $(this).parent().remove();
    unsaved();
})
project.on("click", ".remove-btn", function() {
    const component = $(this).parent().parent(".component")
    if(project.selected != null && (component.attr("id") == project.selected.attr("id"))) {
        project.selected = null; //Active component was deleted
    }
    let parents = component.parents(".component-list");
    if(parents.length) {
        if($(parents[0]).children(".component").length == 1) {
            $(parents[0]).find(".no-components").show()
        }
    }
    component.remove()
    unsaved();
})

project.on("change", "input[type='file']", function(e) {
    const file = e.target.files[0];
    const size = file.size;
    if((size / 1000) > 1000) {
        project.error($(this));
        Logger.error("File size is too big")
        return
    }
    const reader = new FileReader();

    reader.onload = function() {
        const b64 = reader.result;
        $(e.target).attr("data-value", b64);
        $(e.target).parents(".component-file").find("img").attr("src", b64);
    }

    reader.readAsDataURL(file);
})

project.on("click", ".input-row .input .icon", function() {
    if(!$(this).parent().hasClass("active")) {
        $(".component-inputs .input").removeClass("active");
    }
    $(this).parents(".input").toggleClass("active");
}).on("click", ".input-row .input", function() {
    if(!$(this).hasClass("active")) {
        $(".component-inputs .input").removeClass("active");
    }
})

$("#reconnect").on("click", function() {
    /* bot.reconnect(); */
    bot.reconnect();
})
$("#download").on("click", function() {
    project.download();
})
function uploadJson(json) {
    const data = json["data"];
    $("#project").find(".component").remove();
    for(event in data) {
        console.log(event)
        const eventDom = project.addEvent(event);
        eventDom.find(".component-statements .input-row").remove();
        for(let a = 0; a < data[event]["expressions"].length; a++) {
            const statementInput = buildStatementInput(data[event]["expressions"][a]);
            eventDom.find(".component-statements").prepend(statementInput);
        }
        project.selected = $(eventDom);
        for(method in data[event]["methods"]) {
            const methodDom = project.addMethod(method)
            for(let a = 0; a < data[event]["methods"][method]["expressions"].length; a++) {
                const statementInput = buildStatementInput(data[event]["methods"][method]["expressions"][a]);
                methodDom.find(".component-statements").prepend(statementInput);
            }
            const inputs = methodDom.find(".component-inputs:not(.component-statements) input, .component-inputs:not(.component-statements) select, .component-inputs:not(.component-statements) textarea")
            const values = data[event]["methods"][method]["inputs"]
            for(let a = 0; a < inputs.length; a++) {
                const input = $(inputs[a]);
                if(input.attr("type") == "checkbox") {
                    input.prop("checked", values[input.attr("name")])
                    continue
                }
                input.val(values[input.attr("name")])
            }
        }
    }
    window.history.replaceState(null, null, "?token=" + getUrlParam("token"));
    $("#project .active").removeClass("active")
}
$("#upload-selector").on("change", function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        unsaved();
        let data = JSON.parse(event.currentTarget.result);
        if(typeof data == "string") {
            data = JSON.parse(data);
        }
        uploadJson(data);
    });
    reader.readAsText(file, "UTF-8");
})
$("#invite-btn").click(function() {
    if(bot != null && bot.ready) {
        const open = confirm("CAUTION! The following invite is made using administrator permissions, check console for more info")
        if(open) {
            window.open(bot.getInviteLink(), "_blank");
        }
    } else {
        alert("Bot is not online and client id is not yet retrieved");
    }
})

function replaceData(string, data, component=null) {

    let split = string.split("{");
    if(split.length < 2) {
        return string
    }

    split.shift()
    for(let a = 0; a < split.length; a++) {
        if(!(split[a].includes("}"))) continue;
        try {
            const value = split[a].split("}")[0].trim();
            if(value == "") continue;
            
            // value = string between {}
            let results = "null";
            if(value.substring(0, 3) == "bot") {
                const str = value.replace("bot", JSON.stringify(bot.user));
                results = eval("(function() { return " + str + "}())");
            } else if(value[0] != "[") {
                //Doesn't start with an index
                const str = JSON.stringify(data[0]) + "." + value;
                results = eval("(function() { return " + str + "}())");
            } else {
                const str = JSON.stringify(data) + value;
                results = eval("(function() { return " + str + "}())");
            }
            if(typeof results == "undefined") {
                return undefined;
            }
            string = string.replace("{" + value + "}", results);
        } catch(e) {
            Logger.error(e);
            project.error(component);
            return undefined;
        }
    }
    return string;
}

function executejavascriptComponent(component, obj=null) {
    const input = component.find("textarea[name='javascript']")
    const code = input.val()
    try {
        if(obj != null) {
            return eval("(function() { const data=" + JSON.stringify(obj) + "; " + code + " }())");
        } else {
            return eval("(function(){ " + code + " }())");
        }
    } catch(err) {
        Logger.error(err);
        project.error(input);
    }
}

function executeStatements(parent, data) {
    let statements = parent.find(".component-statements");
    if(statements.length) {
        statements = statements[0];
        const statementRows = $(statements).find(".input-row");
        for(let a = 0; a < statementRows.length; a++) {
            const row = statementRows[a];
            const value1 = $(row).find("input[name=value1]").val();
            const val1 = replaceData(value1, data, parent);

            const value2 = $(row).find("input[name=value2]").val();
            const val2 = replaceData(value2, data, parent);

            const delimeter = $(row).find("select[name='delimeter']").val();

            const bool = StatementOptions[delimeter](val1, val2);
            if(bool == false) {
                return false;
            }
        }
    }
    return true;
}

function submit() {
    //Submits the project to bot
    const components = project.find(".component[data-type='event']");

    bot.submitted = {}

    for(let a = 0; a < components.length; a++) {
        const event = $(components[a]);
        const eventId = event.attr("id");
        const eventName = event.attr("data-name")

        if(eventName == "javascript") {
            executejavascriptComponent(event, []);
            continue;
        }

        const childrens = event.find(".component");
        for(let b = 0; b < childrens.length; b++) {
            const method = $(childrens[b])
            const methodName = method.attr("data-name")
            bot.on(eventName, function(data) {

                if(executeStatements(event, data) == false || executeStatements(method, data) == false) {
                    return false;
                }

                if(methodName == "javascript") {
                    return executejavascriptComponent(method, data);
                }

                const toSend = {}

                //Collect method data
                const inputs = method.find(".input-row [name]")
                for(let c = 0; c < inputs.length; c++) {
                    const input = $(inputs[c]);
                    const field = input.attr("name");
                    let value;
                    if(input.attr("type") == "file") {
                        value = $(inputs[c]).attr("data-value");
                    } else if(input.attr("type") == "checkbox") {
                        value = inputs[c].checked;
                    } else {
                        value = input.val().trim();
                        if(value == "") continue;
                        value = replaceData(value, data, input);
                        if(typeof value == "object" && "error" in value) {
                            project.error(input);
                            Logger.error(value["error"])
                            //return value;
                            return false;
                        }
                    }
                    toSend[field] = value;
                }
                const results = bot.exec(toSend, methodName);
                    
                //Handle errors
                if(typeof results == "object" && "error" in results && results["error"] == true){
                    delete results["error"];
                    for(key in results) {
                        Logger.error(key + ": " + results[key]);
                    }
                    let errorInput = method.find(".input-row input[name='" + results[Object.keys(results)[0]] + "']")
                    if(errorInput.length == 0) {
                        errorInput = method;
                    }
                    project.error(errorInput);
                    return false;
                }
                
                return results;

            })

        }
        
    }
    Logger.log("Project submitted to bot")
    project.notice.show("Project submitted to bot");
    $("#submit").removeClass("unsaved");
}
$("#submit").on("click", function() {
    if(!(bot.open)) {
        Logger.error("Project submission failed. Bot is not online");
        return
    }
    submit()
})


// ---------------- PROJECT END ----------------

// ---------------- COMPONENTS ----------------

function highlightIn(dom, target, duration = 2000) {
    dom.hide().addClass("highlighted")
    $(target).append(dom);
    dom.fadeIn();
    setTimeout(function() {
        dom.removeClass("highlighted")
    }, duration)
}

function highlight(dom, duration = 2000) {
    $(dom).addClass("highlighted");
    setTimeout(function() {
        $(dom).removeClass("highlighted");
    }, duration)
}

function getMethods() {
    return $.ajax({
        url: "/api/methods",
        async: false,
    }).responseText
}

function getEvents() {
    return $.ajax({
        url: "/api/events",
        async: false,
    }).responseText
}

const events = JSON.parse(getEvents());
const methods = JSON.parse(getMethods());

function toDisplayName(name) {
    // message_create to Message Create
    let split = name.toLowerCase().split("_");
    let display = "";
    for(let a = 0; a < split.length; a++)  {
        display += split[a].charAt(0).toUpperCase() + split[a].slice(1) + " ";
    }
    return display
}

function loadComponents(_methods = false) {
    //Loads components to each sidebar
    let sidebar = $("#events");
    let obj = events;
    if(_methods == true) {
        sidebar = $("#methods");
        obj = methods;
    }
    for(component in obj) {
        const dom = $("<li class='component' data-name='" +  component + "'></li>")
        const visual = $('<div class="component-visual"><span class="text">' + toDisplayName(component) + '</span></div>')
        if("childrens" in obj[component] && Object.keys(obj[component]["childrens"]).length > 0) {
            visual.append('<span class="icon arrow-down-icon"></span>');
            const dropdown = $("<div class='component-dropdown'></div>");
            const list = $("<ul class='component-list open'></ul>");
            for(child in obj[component]["childrens"]) {
                list.append('<li class="component"><div class="component-visual"><span class="text">' + toDisplayName(child) + '</span><span class="icon plus-icon"></span></div></li>')
            }
            dropdown.append(list);
            dom.append(dropdown);
        } else {
            visual.append('<span class="icon plus-icon"></span>');
        }
        dom.prepend(visual);
        sidebar.append(dom);
    }
    if(_methods == false) loadComponents(true); 
}

loadComponents();

function buildTextInput(value="", placeholder="", name="") {
    //Text input
    return $("<div class='input'><input type='text' name='" + name + "' placeholder='" + placeholder + "' value='" + value + "'></div>")
}

function buildIntegerInput(value, placeholder, name="") {
    //Text input
    return $("<div class='input'><input type='number' name='" + name + "' placeholder='" + placeholder + "' value='" + value + "'></div>")
}

function buildFileInput(value, placeholder, name="") {
    const id = getRandom();
    const label = $("<label class='component-file input'></label>")
    const text = $("<p>" + placeholder +"</p>")
    const file = $("<input type='file' name='" + name + "' id='" + id + "' hidden accept='.jpg, .jpeg, .png' data-value=''>")
    const left = $("<div></div>");

    left.append(text).append("<label for='" + id + "'>Choose a file</label>").append(file);

    label.append(left);

    const right = $("<div></div>")
    right.append("<img>")
    label.append(right);

    return label
}

function buildCheckbox(value, placeholder, name = "") {
    const id = getRandom()
    const dom = $('<label for="' + id + '" class="component-checkbox"></label>');
    let checked = "";
    if(value == true) {
        checked = "checked";
    }
    dom.append($("<span><input type='checkbox' " + checked + " id='" + id + "' name='" + name + "'><span>" + placeholder + "</span></span>"));
    return dom;
}

function buildStatementInput(values = null) {
    const select = $("<select name='delimeter'></select>");
    for(key in StatementOptions) {
        select.append("<option value='" + key + "'>" + key + "</option>");
    }
    const dom = $('<div class="input-row"><div class="input"><input type="text" placeholder="value" name="value1"></div>' + select.prop('outerHTML') + '<div class="input"><input type="text" placeholder="value" name="value2"></div><div class="icon delete-icon delete-statement"></div></div>');
    if(values != null) {
        for(key in values) {
            dom.find("[name='" + key + "']").val(values[key]);
        }
    }
    return dom;
}

function buildStatementDom(inputs = true, count = 1) {
    const select = $("<select name='delimeter'></select>");
    for(key in StatementOptions) {
        select.append("<option value='" + key + "'>" + key + "</option>");
    }

    const statements = $('<div class="component-inputs component-statements"></div>')
    if(inputs) {
        for(let a = 0; a < count; a++) {
            statements.append(buildStatementInput())
        }
    }
    statements.append('<div class="new-statement">Add expression</div>');
    return statements;
}

function buildEventDom(event, statements=true, values=null) {
    
    const id = getRandom()
    let dom = $("<li class='component' id='" + id + "' data-type='event' data-name=" + event + "></li>");

    let docs = "";
    if("docs" in events[event]) {
        docs = '<a target="_blank" href="' + events[event]["docs"] + '" class="visual-btn">docs</a>';
    }
    let visual = $('<div class="component-visual"><span class="text">' + toDisplayName(event) + '</span>' + docs + '<span class="visual-btn remove-btn">remove</span><span class="icon arrow-down-icon"></span></div>')
    dom.append(visual);

    let dropdown = $('<div class="component-dropdown"></div>')
    /* dropdown.append($('<p><a target="__blank" href="/docs/event/' + event + '">Documentation for this event</a></p>')); */
    const desc = $("<p>" + events[event]["desc"] + "</p>")
    dropdown.append(desc);

    if(event == "javascript") {
        dropdown.append("<div class='component-inputs'><textarea name='javascript' placeholder='Your code'></textarea></div>")
    } else if(!("statements" in events[event]) || events[event]["statements"] != false) {
        dropdown.append(buildStatementDom())
    }

    if(event != "javascript") {
        dropdown.append('<h1>Methods to execute:</h1>')
        dropdown.append("<ul class='component-list'><li class='no-components'>No methods added</li></ul>");
    }
    dom.append(dropdown)
    dom.appendMethod = function(dom) {
        
    }
    return dom
}

function propertiesToDom(properties) {
    let inputs = []
    for(index in properties) {
        const property = properties[index];
        const type = property["type"]
        let input = null;
        let value = ""
        let placeholder = "";
        if("default" in property) {
            value = property["default"];
        }
        if("placeholder" in property) {
            placeholder = property["placeholder"];
        }
        if(type == "boolean") {
            input = buildCheckbox(value, placeholder, property["field"])
        } else if(type == "string") {
            input = buildTextInput(value, placeholder, property["field"]);
            if(placeholder.length > 15) {
                input.append("<span class='icon info-icon' title='Show more'></span>");
                input.append("<div class='input-desc'>" + placeholder + "</div>")
            }
        } else if(type == "integer") {
            input = buildIntegerInput(value, placeholder, property["field"]);
            if(placeholder.length > 15) {
                input.append("<span class='icon info-icon' title='Show more'></span>");
                input.append("<div class='input-desc'>" + placeholder + "</div>")
            }
        } else if(type == "file") {
            input = buildFileInput(value, placeholder, property["field"]);
        }
        inputs.push(input)
    }
    const dom = $("<div class='component-inputs'></div>")
    let row = $("<div class='input-row'></div>")
    for(let a = 0; a < inputs.length; a++) {
        var b = a + 1;
        row.append(inputs[a]);
        if(b % 3 == 0) {
            dom.append(row);
            row = $("<div class='input-row'></div>");
        }
    }
    if(b % 3 != 0) {
        dom.append(row);
    }
    return dom;
}

function buildMethodDom(name, values=null) {

    if(!(name in methods)) return;

    const method = methods[name];
    const id = getRandom()
    const dom = $("<li class='component' id='" + id + "' data-type='method' data-name='" + name + "'></li>");
    
    let docs = "";
    if("docs" in methods[name]) {
        docs = '<a target="_blank" href="' + methods[name]["docs"] + '" class="visual-btn">docs</a>';
    }
    const displayName = toDisplayName(name);
    const visual = $('<div class="component-visual"><span class="text">' + displayName + '</span>' + docs + '<span class="visual-btn remove-btn">remove</span><span class="icon arrow-down-icon"></span></div>')
    dom.append(visual);

    const dropdown = $("<div class='component-dropdown'></div>");
    const desc = $("<p>" + method["desc"] + "</p>");
    dropdown.append(desc);

    dropdown.append(buildStatementDom(false))

    if(name == "javascript") {
        dropdown.append("<div class='component-inputs'><textarea name='javascript' placeholder='Your code'></textarea></div>")
    } else if("properties" in method){
        const inputs = propertiesToDom(method["properties"]);
        dropdown.append(inputs);
    }
    dom.append(dropdown);
    return dom;

}

//Add method to selected event
$("#methods .component").on("click", function(e) {

    const methodName = $(this).attr("data-name");
    project.addMethod(methodName);

})

//Add event to project from sidebar
$("#events .component").on("click", function(e) {

    if($(this).children(".component-dropdown").length != 0) return; //Dropdown
    
    //Add event to the project root
    const eventName = $(this).attr("data-name");
    $(".active").removeClass("active");
    project.addEvent(eventName);

})

// ---------------- COMPONENTS END ----------------

// ---------------- DOCUMENT ----------------

$(document).click(function(e) {
    if($(e.target).parents(".component").length == 0) {
        if($(e.target).parents(".sidebar").length == 0)  {
            
            if($(e.target).hasClass("delete-statement")) return;

            $(".active").removeClass("active");
            project.selected = null;
        }
    }
    if($(e.target).parents(".input").length == 0) {
        $(".component-inputs .input").removeClass("active");
    }
})

// ---------------- DOCUMENT END ----------------

// ---------------- SERVERS ----------------

const servers = $("#servers");
servers.add = function(server) {
    const dom = $("<li class='component highlighted' id='" + server.id + "'><div class='component-visual'><span class='text'>" + server.name + "</span><span class='icon arrow-down-icon'></span><span class='ghost'>Updated</span></div></li>");
    
    const dropdown = $("<div class='component-dropdown'></div>")

    dropdown.append("<div class='static-value'><span>ID: </span><span data-value='id'>" + server["id"]+ "</span></div>");
    dropdown.append("<div class='static-value'><span>Channels: </span><span data-value='channels'>" + server["channels"].length + "</span></div>")
    dropdown.append("<div class='static-value'><span>Members: </span><span data-value='members'>" + server["member_count"] + "</span></div>")
    dropdown.append("<div class='static-value'><span>Owner ID: </span><span data-value='owner'>" + server["owner_id"] + "</span></div>")
    dropdown.append("<div class='static-value'><span>Region: </span><span data-value='region'>" + server["region"] + "</span></div>")

    dom.append(dropdown);
    dom.hide();
    servers.prepend(dom);
    dom.fadeIn()
    setTimeout(function() {
        dom.removeClass("highlighted")
    }, 2000)
}
servers.update = function(server, content="Updated") {
    const dom = servers.find("#" + server.id);
    dom.find(".text").html(server.name);
    console.log(server)
    dom.find("[data-value='id']").html(server.id);
    dom.find("[data-value='owner']").html(server.owner_id);
    dom.find("[data-value='region']").html(server.region);

    dom.find(".ghost").text(content).fadeIn().animate({
        "top": "-20px",
        "opacity": "0"
    }, 1500, function() {
        dom.find(".ghost").html("");
        dom.find(".ghost").attr("style", "")
    })
}
servers.remove = function(data) {
    let id = null;
    if(typeof data == "string" || typeof data == "number") {
        id = data;
    }
    if(typeof data == "object") {
        if("id" in data) {
            id = data["id"];
        } else if("guild_id" in data) {
            id = data["guild_id"];
        }
    }

    if(id != null && (typeof id == "string" || typeof id == "number")) {
        servers.find("#" + id).remove();
    }
}

// ---------------- SERVERS END ----------------

const header = document.getElementById("header")

function showModal(id, closable = true) {
    const modal = $("#" + id);
    modal.fadeIn();
    modal.addClass("open");
    if(closable) {
        modal.children(".module-background").on("click", function() {
            closeModal(id);
        })
        modal.find("[data-changeto]").off("click").on("click", function() {
            closeModal(id);
            showModal($(this).attr("data-changeTo"));
        })
    } else {
        modal.children(".module-background").off("click")
    }
}

function closeModal(id) {
    const modal = $("#" + id);
    modal.removeClass("open")
    modal.find(".main-error").empty().hide();
    modal.fadeOut();
}

function tokenModal(close = false) {
    const input = document.getElementById("tokenInput")

    //If token exists in local storate
    const item = localStorage.getItem("token");
    if(item != null && (item && item != "")) {
        input.value = item;
    }

    if(close) {
        closeModal("token-modal")
        return;
    }
    showModal("token-modal", false)
}

function getUrlParam(param) {
	try {
		const url = window.location.href;
		let split = url.split(param + "=");
		return split[1].split("&")[0];
	} catch(err){
		return false;
	}
}

function getBot(callback = null, error = null) {
    const botParam = getUrlParam("bot");
    if(botParam) {
        $.ajax({
            type: "GET",
            url: "/api/bots/" + botParam,
            success: function(result) {
                project.notice.show(result["name"] + " loaded")
                callback(JSON.parse(result["data"]), botParam)
            },
            error: function(result) {
                if(result.status == 404) {
                    project.notice.show("Bot was not found")
                }
                if(error && typeof error == "function") {
                    error(result)
                }
            }
        })
    } else {
        error(null)
    }
}

function getToken(callback = null) {
	const tokenParam = getUrlParam("token");
	const tokenInput = document.getElementById("tokenInput");
	if(tokenParam) {
		tokenInput.value = tokenParam;
        callback(tokenParam)
        return;
	}
    if(!tokenParam) {
        tokenModal()
    }
    const tokenForm = document.getElementById("token-form")
    
    tokenForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const token = tokenInput.value
        if(token) {
            tokenModal(true)
            if(callback) callback(token);
            localStorage.setItem("token", token);
        }
    })  
}

// ---------------- CONSOLE ----------------

const consoleBtn = document.getElementById("console-btn")
const consoleCloseBtn = document.getElementById("close-console")
const _console = document.getElementById("console")
const consoleContent = document.getElementById("console-content")

consoleBtn.addEventListener("click", function(e) {
    if(_console.classList.contains("open")) {
        _console.style.display = "none";
        _console.classList.remove("open")
        projectWrapper.style.height = "calc(100% - " + header.offsetHeight + "px)"; //Remove console height
    } else {
        _console.style.display = "block";
        _console.classList.add("open")
        projectWrapper.style.height = "calc(100% - " + header.offsetHeight + "px - " + _console.offsetHeight + "px)"; //Remove console height
    }
})
consoleCloseBtn.addEventListener("click", function() {
    _console.style.display = "none";
    _console.classList.remove("open")
    projectWrapper.style.height = "calc(100% - " + header.offsetHeight + "px)"; //Remove console height
})

class Logger {
    static log(text) {
        this.display("[server] " + text);
    }
    static raw(text) {
        this.display(text);
    }
    static error(text) {
        this.display("[error] " + text, "#FF5151");
    }
    static display(text, color = false) {
        var date = new Date();
        var hours = date.getHours().toString()
        var minutes = date.getMinutes().toString()
        if(hours.length == 1) hours = "0" + hours;
        if(minutes.length == 1) minutes = "0" + minutes;
        date = hours + ":" + minutes;
        if(color) {
            consoleContent.innerHTML +=  "<span><span class='time'>" + date + "</span><span style='color: " + color + "' class='text'>" + text + "</span></span>";
        } else {
            consoleContent.innerHTML +=  "<span><span class='time'>" + date + "</span><span class='text'>" + text + "</span></span>";
        }
        consoleContent.scrollTop = consoleContent.scrollHeight;
    }
    static empty() {
        consoleContent.innerHTML = "";
    }
}

// ---------------- CONSOLE END ----------------

const statusBall = document.getElementById("status");
const statusText = document.getElementById("status-text");
function status(a) {
    if(a == "online") {
        statusBall.classList.add("online");
        statusText.innerHTML = "Online"
    } else {
        statusBall.classList.remove("online");
        statusText.innerHTML = "Offline"
    }
}

// ---------------- SIDEBAR ----------------

$(".sidebar header").click(function() {
    const attr = $(this).attr("for");
    if(attr) {
        const parent = $(this).parent();
        parent.children("header.selected").removeClass("selected")
        $(this).addClass("selected");
        parent.children(".component-list.open").removeClass("open")
        $(".sidebar #" + attr).addClass("open")
    }
})

// ---------------- SIDEBAR END ----------------

function inviteLink(client) {
    return "https://discord.com/api/oauth2/authorize?client_id=" + client + "&permissions=8&scope=bot";
}

function getRandom() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
$("[data-modal]").click(function() {
    showModal($(this).attr("data-modal"))
})

function getJwt() {
    const jwt = localStorage.getItem("jwt");
    if(jwt != null && (jwt && jwt != "")) {
        return jwt
    }
    return false;
}
function authRequest(url, type, data, callback, error) {
    $.ajax({
        url: url,
        type: type,
        data: data,
        headers: {
            "authorization": "bearer " + getJwt()
        },
        success: function(e) {
            callback(e)
        },
        error: function(e) {
            error(e)
        }
    })
}

class Requests {
    static ping(callback) {
        authRequest("/ping", "post", {}, (res) => {
            callback(true)
        }, (error) => {
            callback(false)
        })
    }
}

$("#save-btn").click(function() {
    const jwt = getJwt();
    if(!jwt) {
        showModal("login-modal");
        return;
    }
})
