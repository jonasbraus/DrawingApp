import Drawing from "./Drawing";
import {useState} from "react";
import StartForm from "./StartForm";

export default function App() {

    const [showForm, setShowForm] = useState("flex")
    const [showDrawing, setShowDrawing] = useState("none")

    const [widthDrawing, setWidthDrawing] = useState(0)
    const [heightDrawing, setHeightDrawing] = useState(0)

    function onCreateCanvas(inputWidth, inputHeight) {
        setWidthDrawing(parseInt(inputWidth.value))
        setHeightDrawing(parseInt(inputHeight.value))
        setShowForm("none")
        setShowDrawing("block")
    }

   return (
       <div>
            <StartForm show={showForm} onCreateCanvas={onCreateCanvas}/>
            <Drawing show={showDrawing} width={widthDrawing} height={heightDrawing}/>
       </div>
    );
}
