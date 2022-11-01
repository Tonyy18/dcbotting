class Notice {
    constructor(dom) {
        this.dom = $(dom);
    }
    show(text) {
        this.dom.children("p").html(text)
        this.dom.fadeIn();
        setTimeout(() => {
            this.hide();
        }, 4000)
    }
    hide() {
        this.dom.fadeOut();
    }
}