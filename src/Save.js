export class Save {
    constructor(content) {
        let localID = localStorage.getItem("id")
        this.id = 0
        let now = new Date()
        this.name = now.getFullYear() + "." + (now.getMonth() + 1)+ "." + now.getDate() + "-" + now.getHours() + "h" + now.getMinutes() + "-" + now.getSeconds() + "s"
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