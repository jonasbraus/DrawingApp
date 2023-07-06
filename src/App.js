import './App.css';
import {useLayoutEffect, useRef, useState} from "react";

let mouseDownMenuBar = false
let mouseDownCanvas = false
let mouseMenuBarOffsetX, mouseMenuBarOffsetY = 0
let context
let hintContext
let canvas
let downLink
let lastPositions = []
let strokeWidth = 2
let lastMouse = 0
let eraserColor = "rgb(255, 255, 255)"
let lastStrokeWidthPencil = 2, lastStrokeWidthEraser = 20, lastStrokeWidthRect = 2, lastStrokeWidthCircle = 2,
    lastStrokeWidthLine = 2

let formAnchor = null;
let textInput

let fileInput

export default function App() {

    useLayoutEffect(() => {

        window.addEventListener("beforeunload", e => {
            e.preventDefault()
            e.returnValue = ""
        })

        canvas = document.getElementById("canvas")
        context = canvas.getContext("2d")

        fileInput = document.getElementById("fileInput")


        clearScreen("rgb(255, 255, 255)")
        downLink = document.createElement("a")
        downLink.className = "no-display"
        textInput = document.getElementById("textInput")

        let hintCanvas = document.getElementById("hintCanvas")
        hintContext = hintCanvas.getContext("2d")

        window.scrollTo((5000 / window.innerWidth) * 500, (3000 / window.innerHeight) * 300)

        setInterval(() => {
            if (selectedTool === "pencil" || selectedTool === "eraser") {
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
            }
        }, 1)

    }, [])

    const [menuBarLeft, setMenuBarLeft] = useState(50)
    const [menuBarTop, setMenuBarTop] = useState(50)
    const [strokeWidthSliderValue, setStrokeWidthSliderValue] = useState(strokeWidth)
    const [colorValue, setColorValue] = useState("#000000")
    const [menuBarShown, setMenuBarShown] = useState(true)
    const [selectedTool, setSelectedTool] = useState("pencil")
    const [textInputX, setTextInputX] = useState(0)
    const [textInputY, setTextInputY] = useState(0)
    const [showTextInput, setShowTextInput] = useState(false)


    class Position {
        constructor(x, y) {
            this.x = x
            this.y = y
        }
    }

    function clearScreen(color) {
        context.fillStyle = color
        context.fillRect(0, 0, 5000, 3000)
        eraserColor = color
    }

    function handleMouseDownCanvas(e) {
        if (e.button === 0) {
            mouseDownCanvas = true
            hintContext.clearRect(0, 0, 5000, 3000)
            setShowTextInput(false)
            context.fillStyle = selectedTool !== "eraser" ? colorValue : eraserColor
            if (selectedTool === "pencil" || selectedTool === "eraser") {
                context.beginPath()
                context.arc(e.pageX, e.pageY, strokeWidthSliderValue, 0, 2 * Math.PI, false)
                context.fill()

                lastMouse = Date.now()
                lastPositions.push(new Position(e.pageX, e.pageY))
            } else {

                formAnchor = new Position(e.pageX, e.pageY)
            }
            if (selectedTool === "text") {
                mouseDownCanvas = false
                setTextInputX(e.pageX + 10)
                setTextInputY(e.pageY + 10)
                setShowTextInput(true)
                hintContext.beginPath()
                hintContext.fillStyle = "black"
                hintContext.arc(e.pageX, e.pageY, 5, 0, 2 * Math.PI, false)
                hintContext.fill()
            }
        }
    }

    function handleMouseUpCanvas(e) {
        if (e.button === 0) {
            mouseDownCanvas = false

            if (selectedTool === "rect") {
                context.strokeStyle = colorValue
                context.beginPath()
                context.rect(formAnchor.x, formAnchor.y, e.pageX - formAnchor.x, e.pageY - formAnchor.y)
                context.lineWidth = strokeWidthSliderValue
                context.stroke()

            } else if (selectedTool === "circle") {
                context.strokeStyle = colorValue
                context.beginPath()
                let radius = (e.pageX - formAnchor.x) / 2
                let yRad = (e.pageY - formAnchor.y) / 2
                context.arc(formAnchor.x + radius, formAnchor.y + yRad, Math.abs(radius), 0, 2 * Math.PI, false)
                context.lineWidth = strokeWidthSliderValue
                context.stroke()
            } else if (selectedTool === "selector") {
                context.fillStyle = eraserColor
                context.fillRect(formAnchor.x, formAnchor.y, e.pageX - formAnchor.x, e.pageY - formAnchor.y)
            } else if (selectedTool === "line") {
                context.strokeStyle = colorValue
                context.beginPath()
                context.lineWidth = strokeWidthSliderValue
                context.moveTo(formAnchor.x, formAnchor.y)
                context.lineTo(e.pageX, e.pageY)
                context.stroke()
                context.moveTo(0, 0)
            }

            if (selectedTool !== "text") {
                hintContext.clearRect(0, 0, 5000, 3000)
            } else {
                textInput.focus()
            }
        }
    }

    function handleMouseMove(e) {
        let mouseX = e.pageX
        let mouseY = e.pageY

        if (selectedTool === "pencil" || selectedTool === "eraser") {
            hintContext.clearRect(0, 0, 5000, 3000)
            hintContext.beginPath()
            hintContext.fillStyle = colorValue
            hintContext.arc(mouseX, mouseY, strokeWidthSliderValue, 0, 2 * Math.PI, false)
            hintContext.fill()
        }

        if (mouseDownMenuBar) {

            setMenuBarLeft(mouseX - mouseMenuBarOffsetX)
            setMenuBarTop(mouseY - mouseMenuBarOffsetY)
        } else if (mouseDownCanvas) {
            hintContext.clearRect(0, 0, 5000, 3000)
            if (selectedTool === "pencil" || selectedTool === "eraser") {
                context.fillStyle = selectedTool !== "eraser" ? colorValue : eraserColor

                lastPositions.push(new Position(mouseX, mouseY))

                lastMouse = Date.now()
            } else if (selectedTool === "rect" || selectedTool === "circle" || selectedTool === "selector" || selectedTool === "line") {
                hintContext.strokeStyle = colorValue
                hintContext.lineWidth = strokeWidthSliderValue

                if (selectedTool === "selector") {
                    hintContext.setLineDash([10, 15])
                    hintContext.lineWidth = 3
                    hintContext.strokeStyle = "rgb(200, 0, 0)"
                } else {
                    hintContext.setLineDash([])
                }

                hintContext.beginPath()

                if (selectedTool === "rect" || selectedTool === "selector") {
                    hintContext.rect(formAnchor.x, formAnchor.y, mouseX - formAnchor.x, mouseY - formAnchor.y)
                    hintContext.stroke()
                }

                if (selectedTool === "circle") {
                    let radius = (mouseX - formAnchor.x) / 2
                    let yRad = (mouseY - formAnchor.y) / 2
                    hintContext.arc(formAnchor.x + radius, formAnchor.y + yRad, Math.abs(radius), 0, 2 * Math.PI, false)
                    hintContext.stroke()
                }

                if (selectedTool === "line") {
                    hintContext.moveTo(formAnchor.x, formAnchor.y)
                    hintContext.lineTo(mouseX, mouseY)
                    hintContext.stroke()
                }
            }
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

    function onSaveButtonClick()
    {
        let img = canvas.toDataURL("image/png")
        let blob = new Blob([img], {type: "text/plain"})
        var url = URL.createObjectURL(blob)
        downLink.href = url
        downLink.download = "save.redraw"
        downLink.click()
    }

    function onOpenButtonClick() {
        fileInput.click()
    }

    function handleToolChange(e) {
        setShowTextInput(false)
        hintContext.clearRect(0, 0, 5000, 3000)
        setSelectedTool(e.target.value)
        if (e.target.value === "pencil") {
            setStrokeWidthSliderValue(lastStrokeWidthPencil)
            strokeWidth = lastStrokeWidthPencil
        } else if (e.target.value === "eraser") {
            setStrokeWidthSliderValue(lastStrokeWidthEraser)
            strokeWidth = lastStrokeWidthEraser
        } else if (e.target.value === "rect") {
            setStrokeWidthSliderValue(lastStrokeWidthRect)
            strokeWidth = lastStrokeWidthRect
        } else if (e.target.value === "circle") {
            setStrokeWidthSliderValue(lastStrokeWidthCircle)
            strokeWidth = lastStrokeWidthCircle
        } else if (e.target.value === "line") {
            setStrokeWidthSliderValue(lastStrokeWidthLine)
            strokeWidth = lastStrokeWidthLine
        }
    }

    return (

        <div onMouseMove={e => handleMouseMove(e)} style={{overflow: "unset"}}>
            <canvas id="canvas" style={{backgroundColor: "rgb(255, 255, 255)", cursor: "crosshair"}}
                    width={5000}
                    height={3000}
                    onMouseDown={e => {
                        handleMouseDownCanvas(e)
                    }}
                    onMouseUp={e => {
                        handleMouseUpCanvas(e)
                    }}
            >
            </canvas>

            <canvas id="hintCanvas" style={{
                backgroundColor: "rgba(255, 255, 255, 0)",
                pointerEvents: "none",
                position: "absolute",
                left: 0,
                top: 0
            }}
                    width={5000}
                    height={3000}
            >
            </canvas>

            <input autoFocus name={"textInput"} id={"textInput"} type={"text"} style={{
                display: (showTextInput ? "block" : "none"),
                position: "absolute",
                top: textInputY,
                left: textInputX,
                fontSize: 25,
                fontFamily: "sans-serif"
            }} onKeyDown={e => {
                if (e.key === "Enter") {
                    mouseDownCanvas = false
                    context.font = "25px sans-serif"
                    context.textAlign = "center"
                    context.fillText(textInput.value, formAnchor.x, formAnchor.y + 10)
                    textInput.value = ""
                    setShowTextInput(false)
                    hintContext.clearRect(0, 0, 5000, 3000)
                }
            }}/>

            <div id="menubar" style={{
                position: "fixed",
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

                     hintContext.clearRect(0, 0, 5000, 3000)
                     setShowTextInput(false)
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

                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 10
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-pencil-fill" viewBox="0 0 16 16">
                                        <path
                                            d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                                    </svg>
                                    <input type={"radio"} name={"tool"} value={"pencil"}
                                           style={{width: 20, height: 20, pointerEvents: "auto"}}
                                           checked={selectedTool === "pencil"} onChange={e => {
                                        handleToolChange(e)
                                    }}/>
                                </div>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 10
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-eraser-fill" viewBox="0 0 16 16">
                                        <path
                                            d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z"/>
                                    </svg>
                                    <input type={"radio"} value={"eraser"} name={"tool"}
                                           style={{width: 20, height: 20, pointerEvents: "auto"}}
                                           checked={selectedTool === "eraser"} onChange={e => {
                                        handleToolChange(e)
                                    }}/>
                                </div>

                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 10
                                }}>

                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-circle" viewBox="0 0 16 16">
                                        <path
                                            d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    </svg>
                                    <input type={"radio"} value={"circle"} name={"tool"}
                                           style={{width: 20, height: 20, pointerEvents: "auto"}}
                                           checked={selectedTool === "circle"} onChange={e => {
                                        handleToolChange(e)
                                    }}/>
                                </div>

                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 10
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-square" viewBox="0 0 16 16">
                                        <path
                                            d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                    </svg>
                                    <input type={"radio"} value={"rect"} name={"tool"}
                                           style={{width: 20, height: 20, pointerEvents: "auto"}}
                                           checked={selectedTool === "rect"} onChange={e => {
                                        handleToolChange(e)
                                    }}/>
                                </div>

                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 10
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-dash" viewBox="0 0 16 16">
                                        <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
                                    </svg>
                                    <input type={"radio"} value={"line"} name={"tool"}
                                           style={{width: 20, height: 20, pointerEvents: "auto"}}
                                           checked={selectedTool === "line"} onChange={e => {
                                        handleToolChange(e)
                                    }}/>
                                </div>

                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 10
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-fonts" viewBox="0 0 16 16">
                                        <path
                                            d="M12.258 3h-8.51l-.083 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.52h4.082v-.52c-1.162-.103-1.306-.26-1.306-.923V3.602l.431.013c1.934.062 2.434.301 2.693 1.846h.479L12.258 3z"/>
                                    </svg>
                                    <input type={"radio"} value={"text"} name={"tool"}
                                           style={{width: 20, height: 20, pointerEvents: "auto"}}
                                           checked={selectedTool === "text"} onChange={e => {
                                        handleToolChange(e)
                                    }}/>
                                </div>

                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 10
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-x-lg" viewBox="0 0 16 16">
                                        <path
                                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                                    </svg>
                                    <input type={"radio"} value={"selector"} name={"tool"}
                                           style={{width: 20, height: 20, pointerEvents: "auto"}}
                                           checked={selectedTool === "selector"} onChange={e => {
                                        handleToolChange(e)
                                    }}/>
                                </div>
                            </div>

                            <input type={"range"} min={1} max={40} value={strokeWidthSliderValue} onChange={e => {
                                setStrokeWidthSliderValue(e.currentTarget.value)
                                strokeWidth = e.currentTarget.value
                                if (selectedTool === "pencil") {
                                    lastStrokeWidthPencil = strokeWidth
                                } else if (selectedTool === "eraser") {
                                    lastStrokeWidthEraser = strokeWidth;
                                } else if (selectedTool === "rect") {
                                    lastStrokeWidthRect = strokeWidth;
                                } else if (selectedTool === "circle") {
                                    lastStrokeWidthCircle = strokeWidth
                                } else if (selectedTool === "line") {
                                    lastStrokeWidthLine = strokeWidth
                                }

                            }} style={{
                                pointerEvents: "auto",
                                display: ((selectedTool === "selector" || selectedTool === "text") ? "none" : "block")
                            }}/>
                            <p style={{
                                userSelect: "none",
                                display: ((selectedTool === "selector" || selectedTool === "text") ? "none" : "block")
                            }}>{strokeWidthSliderValue}</p>
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

                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 5
                        }}>
                            {/*fill bucket*/}
                            <button style={{
                                backgroundColor: "white",
                                borderWidth: 0,
                                boxShadow: "0 0 5px gray",
                                padding: 10,
                                marginLeft: 10,
                                borderRadius: 15,
                                width: 60,
                                pointerEvents: "auto"
                            }} onClick={() => {
                                clearScreen(colorValue)
                            }}>
                                Clear
                            </button>

                            {/*open button*/}
                            <button style={{
                                padding: 10,
                                backgroundColor: "white",
                                borderRadius: 15,
                                marginLeft: 10,
                                boxShadow: "0 0 5px gray",
                                borderWidth: 0,
                                width: 60,
                                pointerEvents: "auto"
                            }}
                                    onClick={onOpenButtonClick}>
                                Open
                            </button>
                            <input onChange={() => {
                                let file = fileInput.files[0]

                                let reader = new FileReader()
                                reader.onload = e => {
                                    let image = new Image()
                                    image.onload = () => {
                                        context.drawImage(image, 0, 0)
                                    }
                                    image.src = e.target.result
                                }
                                reader.readAsText(file)

                            }} id={"fileInput"} type={"file"} accept={".redraw"} style={{pointerEvents: "auto", display: "none"}}/>


                            {/*save button*/}
                            <button style={{
                                padding: 10,
                                backgroundColor: "white",
                                borderRadius: 15,
                                marginLeft: 10,
                                boxShadow: "0 0 5px gray",
                                borderWidth: 0,
                                width: 60,
                                pointerEvents: "auto"
                            }}
                                    onClick={onSaveButtonClick}>
                                Save
                            </button>


                            {/*export button*/}
                            <button style={{
                                padding: 10,
                                backgroundColor: "white",
                                borderRadius: 15,
                                marginLeft: 10,
                                boxShadow: "0 0 5px gray",
                                borderWidth: 0,
                                width: 60,
                                pointerEvents: "auto"
                            }}
                                    onClick={onExportButtonClick}>
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
