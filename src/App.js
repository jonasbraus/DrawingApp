import Drawing from "./Drawing";
import {useEffect, useState} from "react";
import StartForm from "./StartForm";

let fileInput

export default function App() {

    const [showForm, setShowForm] = useState("flex")
    const [showDrawing, setShowDrawing] = useState("none")

    const [widthDrawing, setWidthDrawing] = useState(0)
    const [heightDrawing, setHeightDrawing] = useState(0)

    const [loadIn, setLoadIn] = useState(null)
    const [loadInId, setLoadInId] = useState(-1)
    const [shouldUpdate, setShouldUpdate] = useState(false)

    useEffect(() => {

        fileInput = document.getElementById("fileInput")
    }, [])

    function onCreateCanvas(inputWidth, inputHeight) {
        setWidthDrawing(parseInt(inputWidth.value))
        setHeightDrawing(parseInt(inputHeight.value))
        setShowForm("none")
        setShowDrawing("block")
    }

    function onLoadIn(save, id) {
        let image = new Image()
        image.onload = () => {
            setWidthDrawing(image.width)
            setHeightDrawing(image.height)
            setLoadIn(save)
            setShowForm("none")
            setShowDrawing("block")
            setLoadInId(id)
            setShouldUpdate(!shouldUpdate)
        }
        image.src = save
    }

    function onOpenButtonClick () {
        fileInput.click()
    }

    return (
        <div>
            <StartForm onOpenButtonClick={onOpenButtonClick} onLoadIn={onLoadIn} show={showForm} onCreateCanvas={onCreateCanvas}/>
            <Drawing shouldUpdate={shouldUpdate} loadInId={loadInId} loadIn={loadIn} show={showDrawing}
                     width={widthDrawing} height={heightDrawing}/>
            <input onChange={() => {
                let file = fileInput.files[0]

                let reader = new FileReader()
                reader.onload = e => {
                    let image = new Image()
                    image.onload = () => {
                        setWidthDrawing(image.width)
                        setHeightDrawing(image.height)
                        setLoadIn(e.target.result)
                        setLoadInId(-1)
                        setShowForm("none")
                        setShowDrawing("block")
                        setShouldUpdate(!shouldUpdate)
                    }
                    image.src = e.target.result
                }
                reader.readAsText(file)

            }} id={"fileInput"} type={"file"} accept={".redraw"}
                   style={{pointerEvents: "auto", display: "none"}}/>
        </div>
    );
}
