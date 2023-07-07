export class Save {
    constructor(content, name) {
        let localID = localStorage.getItem("id")
        this.id = 0
        let now = new Date()
        if(name === "") {
            this.name = now.getFullYear() + "." + (now.getMonth() + 1) + "." + now.getDate() + "-" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()
        }
        else {
            this.name = name
        }
        if(localID !== null) {
            this.id = parseInt(localID) + 1
            localStorage.setItem("id", this.id)
        }
        else {
            localStorage.setItem("id", 0)
        }

        this.content = content
    }
}