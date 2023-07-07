import Drawing from "./Drawing";
import {useState} from "react";
import StartForm from "./StartForm";

export default function App() {

    const [showForm, setShowForm] = useState("flex")
    const [showDrawing, setShowDrawing] = useState("none")

    const [widthDrawing, setWidthDrawing] = useState(0)
    const [heightDrawing, setHeightDrawing] = useState(0)

    const [loadIn, setLoadIn] = useState(null)
    const [loadInId, setLoadInId] = useState(-1)
    const [shouldUpdate, setShouldUpdate] = useState(false)

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

   return (
       <div>
            <StartForm onLoadIn={onLoadIn} show={showForm} onCreateCanvas={onCreateCanvas}/>
            <Drawing shouldUpdate={shouldUpdate} loadInId={loadInId} loadIn={loadIn} show={showDrawing} width={widthDrawing} height={heightDrawing}/>
       </div>
    );
}
