class EditingModal {
    static parent = $("#editing-modal")
    static imageDom = this.parent.find("#edit-bot-image");
    static nameDom = this.parent.find("#edit-bot-name");
    static privacyDom = this.parent.find("#edit-bot-privacy");

    static updateValues(data) {
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

const botsContent = $("#bots-content");
const loadedBots = {}
function setupLoginUi() {
    setTimeout(function() {
        const data = getJwtPayload();
        Requests.getBotsByUserId(data.id, function(res) {
            const bots = res["message"];
            botsContent.empty();
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
                    "name": name,
                    "picture": picture,
                    "public": public
                }
            }
        })
    },1500);
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

$(document).on("click", ".edit-bot-btn", function() {
    const parent = $(this).closest(".bot-card");
    const botId = parent.attr("data-id");
    EditingModal.updateValues(loadedBots[botId])
})