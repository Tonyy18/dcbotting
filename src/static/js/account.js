const botsContent = $("#bots-content");
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
                const dom = createBotCard(id, name, picture);
                dom.hide();
                botsContent.append(dom);
                dom.fadeIn();
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
    const parent = $('<div class="bot-card"></div>');
    const imgHolder = $('<div class="image-holder"></div>');
    imgHolder.append('<img src="' + picture + '">')
    parent.append(imgHolder);
    parent.append('<a href="/editor?bot=' + id + '" class="name">' + name + '</a>')
    return parent;
}
