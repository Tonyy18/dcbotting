
class EditingModal {
    static parent = $("#editing-modal")
    static imageDom = this.parent.find("#edit-bot-image");
    static nameDom = this.parent.find("#edit-bot-name");
    static privacyDom = this.parent.find("#edit-bot-privacy");
    static current = null

    static close() {
        closeModal("editing-modal")
        this.current = null;
        this.parent.find("#bot-image-selector").val(null)
    }

    static updateValues(data) {
        this.current = data
        if("picture" in data) {
            this.imageDom.attr("src", data["picture"]);
        }
        if("name" in data) {
            this.nameDom.val(data["name"]);
        }
        if("public" in data) {
           this.privacyDom.prop("checked", data["public"])
        }
    }
}
const notice = new Notice($("#notice"));
const botsContent = $("#bots-content");
const loadedBots = {}
const botsErrorDom = $("<h2 class='section-message'>You dont own any bots yet</h2>");
function setupLoginUi() {
    const data = getJwtPayload();
    Requests.getBotsByUserId(data.id, function(res) {
        const bots = res["message"];
        botsContent.empty();
        if(bots.length == 0) {
            botsContent.html(botsErrorDom);
        }
        for(let a = 0; a < bots.length; a++) {
            const id = bots[a]["id"];
            const name = bots[a]["name"];
            const picture = bots[a]["picture"];
            const public = bots[a]["public"];
            const dom = createBotCard(id, name, picture);
            dom.hide();
            botsContent.append(dom);
            dom.fadeIn();
            loadedBots[id] = {
                "id": id,
                "name": name,
                "picture": picture,
                "public": public
            }
        }
    })
}
setupLoginForm(function(e) {
    setupLoginUi();
})
isLoggedIn((e) => {
    setupLoginUi();
}, function() {
    //Is not logged in
    showModal("login-modal", false)
})
$("#logout-btn").click(function() {
    logout();
    window.location = "/"
})

function createBotCard(id, name, picture) {
    const parent = $('<div class="bot-card item-with-overlay" data-id="' + id + '"></div>');
    const imgHolder = $('<div class="image-holder"></div>');
    imgHolder.append('<img src="' + picture + '">')
    parent.append(imgHolder);
    parent.append('<p class="name">' + name + '</p>')
    const hover = $("<div class='item-hover-overlay'></div>")
    const editButton = $('<button class="bot-hover-btn edit-bot-btn" data-modal="editing-modal">Edit</button>')
    const openButton = $('<a href="/editor?bot=' + id + '" class="bot-hover-btn open-bot-btn">Open</a>')
    hover.append(editButton).append(openButton)
    parent.append(hover)
    return parent;
}

let editingBot = null;
$(document).on("click", ".edit-bot-btn", function() {
    const parent = $(this).closest(".bot-card");
    const botId = parent.attr("data-id");
    EditingModal.updateValues(loadedBots[botId])
})

$("#bot-image-selector").change(function(e) {
    const file = e.target.files[0]
    if(file) {
        var reader = new FileReader();
        reader.onload = function(){
            $("#edit-bot-image").attr("src", reader.result);
        };
        reader.readAsDataURL(event.target.files[0]);
    }
})

$("#bot-editing-form").on("submit", function(e) {
    e.preventDefault();
    var formData = new FormData(document.getElementById("bot-editing-form"));
    console.log(formData.getAll("delete"))
})
$("#delete-bot").click(function() {
    if(confirm("Are you sure you want to delete bot \"" + EditingModal.current["name"] + "\"")) {
        Requests.deleteBot(EditingModal.current["id"], function() {
            notice.show("Bot deleted successfully");
            $("#bots-content").find(".bot-card[data-id='" + EditingModal.current["id"] + "']").remove();
            delete loadedBots[EditingModal.current["id"]]
            EditingModal.close();
            if(Object.keys(loadedBots).length == 0) {
                botsContent.html(botsErrorDom);
            }
        }, function(result) {
            notice.error(result["message"])
        })
    }
})
$("#save-bot").click(function() {
    //Edit inputs
    const imageInput = $("#bot-image-selector");
    const nameInput = $("#edit-bot-name");
    const name = $.trim(nameInput.val());
    const privacyInput = $("#edit-bot-privacy");
    if(name.length < validations.name[0]) {
        notice.error("Bot name is too short");
        return
    }
    if(name.length > validations.name[1]) {
        notice.error("Bot name is too long");
        return;
    }
    const form = new FormData();
    form.append("name", name);
    if(imageInput[0].files.length > 0) {
        form.append("picture", imageInput[0].files[0])
    }
    form.append("public", privacyInput.is(":checked"))
    Requests.updateBot(EditingModal.current["id"], form, function(res) {
        const botId = EditingModal.current["id"]
        const card = $("#bots-content").find(".bot-card[data-id='" + botId + "']")
        console.log(res["message"]["picture"])
        card.find(".image-holder img").attr("src", res["message"]["picture"] + "?" + (new Date()).getTime());
        card.find("p.name").html(res["message"]["name"])
        loadedBots[botId] = res["message"]
        loadedBots[botId]["id"] = botId;
        EditingModal.close();
        notice.show("Bot updated successfully")
    }, (err) => {
        notice.error(err["message"])
    })
})