import './App.css';
import {useLayoutEffect, useState} from "react";

let mouseDownMenuBar = false
let mouseDownCanvas = false
let mouseMenuBarOffsetX, mouseMenuBarOffsetY = 0
let context
let canvas
let downLink
let lastPositions = []
let strokeWidth = 5
let lastMouse = 0
let eraserColor = "rgb(255, 255, 255)"
let lastStrokeWidthPencil = 5, lastStrokeWidthEraser = 5

export default function App() {

    useLayoutEffect(() => {
        canvas = document.getElementById("canvas")
        context = canvas.getContext("2d")
        clearScreen("rgb(255, 255, 255)")
        downLink = document.createElement("a")
        downLink.className = "no-display"

        setInterval(() => {
            if (lastPositions.length >= 2) {
                let point1 = lastPositions.shift()
                let point2 = lastPositions[lastPositions.length - 1]

                let connection = new Position(point1.x - point2.x, point1.y - point2.y)

                for (let i = 0; i < 1; i += 0.001) {
                    context.beginPath()
                    context.arc(point1.x - (connection.x * i), point1.y - (connection.y * i), strokeWidth, 0, 2 * Math.PI, false)
                    context.fill()
                }
            } else if (Date.now() - lastMouse > 100 && lastPositions.length >= 1) {
                let point = lastPositions.shift()

                context.beginPath()
                context.arc(point.x, point.y, strokeWidth, 0, 2 * Math.PI, false)
                context.fill()
            }
        }, 1)

    }, [])

    const [menuBarLeft, setMenuBarLeft] = useState(50)
    const [menuBarTop, setMenuBarTop] = useState(50)
    const [strokeWidthSliderValue, setStrokeWidthSliderValue] = useState(strokeWidth)
    const [colorValue, setColorValue] = useState("#000000")
    const [menuBarShown, setMenuBarShown] = useState(true)
    const [selectedTool, setSelectedTool] = useState("pencil")

    class Position {
        constructor(x, y) {
            this.x = x
            this.y = y
        }
    }

    function clearScreen(color) {
        context.fillStyle = color
        context.fillRect(0, 0, window.innerWidth, window.innerHeight)
        eraserColor = color
    }

    function handleMouseDownCanvas(e)
    {
        mouseDownCanvas = true
        context.fillStyle = selectedTool === "pencil" ? colorValue : eraserColor
        context.beginPath()
        context.arc(e.pageX, e.pageY, strokeWidthSliderValue, 0, 2 * Math.PI, false)
        context.fill()

        lastMouse = Date.now()
        lastPositions.push(new Position(e.pageX, e.pageY))
    }

    function handleMouseMove(event) {
        let mouseX = event.pageX
        let mouseY = event.pageY

        if (mouseDownMenuBar) {

            setMenuBarLeft(mouseX - mouseMenuBarOffsetX)
            setMenuBarTop(mouseY - mouseMenuBarOffsetY)
        } else if (mouseDownCanvas) {
            context.fillStyle = selectedTool === "pencil" ? colorValue : eraserColor

            lastPositions.push(new Position(mouseX, mouseY))

            lastMouse = Date.now()
        }
    }

    function onExportButtonClick(e) {
        let img = canvas.toDataURL("image/png")
        let image = new Image()
        image.src = "data:image/png;base64," + img
        downLink.href = img
        downLink.download = "export.png"
        downLink.click()
    }

    function handleToolChange(e)
    {
        setSelectedTool(e.target.value)
        if(e.target.value === "pencil") {
            setStrokeWidthSliderValue(lastStrokeWidthPencil)
            strokeWidth = lastStrokeWidthPencil
        }
        else if(e.target.value === "eraser") {
            setStrokeWidthSliderValue(lastStrokeWidthEraser)
            strokeWidth = lastStrokeWidthEraser
        }
    }

    return (

        <div onMouseMove={e => handleMouseMove(e)} style={{overflow: "unset"}}>
            <canvas id="canvas" style={{backgroundColor: "rgb(255, 255, 255)"}}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    onMouseDown={e => {
                        handleMouseDownCanvas(e)
                    }}
                    onMouseUp={e => {
                        mouseDownCanvas = false
                    }}
            >
            </canvas>

            <div id="menubar" style={{
                position: "absolute",
                backgroundColor: "white",
                borderRadius: 15,
                boxShadow: "0 0 5px gray",
                padding: 25,
                top: menuBarTop,
                left: menuBarLeft,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
                 onMouseDown={(e) => {
                     if (e.currentTarget === e.target) {
                         mouseDownMenuBar = true
                         mouseMenuBarOffsetX = e.pageX - e.currentTarget.getBoundingClientRect().left
                         mouseMenuBarOffsetY = e.pageY - e.currentTarget.getBoundingClientRect().top
                     }
                 }}
                 onMouseUp={(e) => {
                     mouseDownMenuBar = false
                 }}
                 onDoubleClick={() => {
                     setMenuBarShown(!menuBarShown)
                 }}
            >
                <div style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    flexDirection: "column",
                    pointerEvents: "none"
                }}>
                    <div style={{
                        pointerEvents: "none"
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                             className="bi bi-grip-horizontal" viewBox="0 0 16 16">
                            <path
                                d="M2 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                        </svg>
                    </div>
                    <div style={{
                        display: menuBarShown ? "flex" : "none",
                        justifyContent: "center",
                        alignItems: "center",
                        pointerEvents: "none"
                    }}>
                        {/*stroke width*/}
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            gap: 5,
                            alignItems: "center",
                            pointerEvents: "none"
                        }}>

                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                            }}>

                                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 10}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-pencil-fill" viewBox="0 0 16 16">
                                        <path
                                            d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                                    </svg>
                                    <input type={"radio"} name={"tool"} value={"pencil"} style={{width: 20, height: 20, pointerEvents: "auto"}}
                                    checked={selectedTool === "pencil"} onChange={e => {
                                        handleToolChange(e)
                                    }}/>
                                </div>
                                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 10}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-eraser-fill" viewBox="0 0 16 16">
                                        <path
                                            d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z"/>
                                    </svg>
                                    <input type={"radio"} value={"eraser"} name={"tool"} style={{width: 20, height: 20, pointerEvents: "auto"}}
                                    checked={selectedTool === "eraser"} onChange={e => {
                                        handleToolChange(e)
                                    }}/>
                                </div>
                            </div>

                            <input type={"range"} min={1} max={20} value={strokeWidthSliderValue} onChange={e => {
                                setStrokeWidthSliderValue(e.currentTarget.value)
                                strokeWidth = e.currentTarget.value
                                if(selectedTool === "pencil") {
                                    lastStrokeWidthPencil = strokeWidth
                                }
                                else if(selectedTool === "eraser") {
                                    lastStrokeWidthEraser = strokeWidth;
                                }

                            }} style={{pointerEvents: "auto"}}/>
                            <p style={{userSelect: "none"}}>{strokeWidthSliderValue}</p>
                        </div>

                        {/*Color Selector*/}
                        <input type={"color"}
                               style={{
                                   pointerEvents: "auto",
                                   borderWidth: 0,
                                   borderRadius: 5,
                                   boxShadow: "0 0 5px gray",
                                   marginLeft: 100

                               }} onChange={e => {
                            setColorValue(e.target.value)
                        }} value={colorValue}/>

                        {/*fill bucket*/}
                        <button style={{
                            backgroundColor: "white",
                            borderWidth: 0,
                            boxShadow: "0 0 5px gray",
                            padding: 10,
                            marginLeft: 10,
                            borderRadius: 15,
                            pointerEvents: "auto"
                        }} onClick={() => {
                            clearScreen(colorValue)
                        }}>
                            Clear
                        </button>

                        {/*export button*/}
                        <button style={{
                            padding: 10,
                            backgroundColor: "white",
                            borderRadius: 15,
                            marginLeft: 10,
                            boxShadow: "0 0 5px gray",
                            borderWidth: 0,
                            pointerEvents: "auto"
                        }}
                                onClick={onExportButtonClick}
                        >Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
