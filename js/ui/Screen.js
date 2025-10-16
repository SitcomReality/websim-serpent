export class Screen {
    constructor(name) {
        this.name = name;
        this.element = document.createElement('div');
        this.element.className = 'screen';
        this.element.id = `screen-${name}`;
    }

    show() {
        this.element.classList.add('active');
        this.onShow();
    }

    hide() {
        this.element.classList.remove('active');
        this.onHide();
    }

    onShow() {}
    onHide() {}

    mount(container) {
        container.appendChild(this.element);
    }
}

