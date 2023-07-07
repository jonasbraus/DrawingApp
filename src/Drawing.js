import './App.css';
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {Save} from "./Save";
import {Action} from "./Action";
import {ActionType} from "./ActionType";

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
let lastStrokeWidthPencil = 2, lastStrokeWidthEraser = 20, lastStrokeWidthRect = 2, lastStrokeWidthCircle = 2, lastStrokeWidthText = 16, lastStrokeWidthLine = 2

let hintCanvas

let formAnchor = null;
let textInput

let fileInput

let moverActive = false

let moverWidth = 0, moverHeight = 0

let lastActions = []


export default function Drawing(p) {

    useEffect(() => {
        if (p.show !== "none") {
            let body = document.querySelector("body")
            body.style.background = "rgb(200, 200, 200)"
        }
    })


    useEffect(() => {

        canvas = document.getElementById("canvas")
        context = canvas.getContext("2d")

        fileInput = document.getElementById("fileInput")

        downLink = document.createElement("a")
        downLink.className = "no-display"
        textInput = document.getElementById("textInput")

        hintCanvas = document.getElementById("hintCanvas")
        hintContext = hintCanvas.getContext("2d")

        if(p.name !== "") {
            setNameInput(p.name)
        }

        if (p.loadIn !== null) {

            let image = new Image()
            image.onload = () => {

                context.clearRect(0, 0, p.width, p.height)
                context.drawImage(image, 0, 0)
            }
            image.src = p.loadIn
        }


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

    }, [p.shouldUpdate])

    const [menuBarLeft, setMenuBarLeft] = useState(50)
    const [menuBarTop, setMenuBarTop] = useState(50)
    const [strokeWidthSliderValue, setStrokeWidthSliderValue] = useState(strokeWidth)
    const [colorValue, setColorValue] = useState("#000000")
    const [menuBarShown, setMenuBarShown] = useState(true)
    const [selectedTool, setSelectedTool] = useState("pencil")
    const [textInputX, setTextInputX] = useState(0)
    const [textInputY, setTextInputY] = useState(0)
    const [showTextInput, setShowTextInput] = useState(false)
    const [nameInput, setNameInput] = useState("")


    class Position {
        constructor(x, y) {
            this.x = x
            this.y = y
        }
    }

    function handleMouseDownCanvas(e) {
        if (e.button === 0) {
            if (!moverActive) {
                mouseDownCanvas = true
                hintContext.clearRect(0, 0, p.width, p.height)
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
            } else {
                context.clearRect(formAnchor.x, formAnchor.y, moverWidth, moverHeight)
                context.drawImage(hintCanvas, e.pageX - moverWidth + 3, e.pageY - moverHeight + 3, moverWidth - 6, moverHeight - 6, e.pageX - moverWidth + 3, e.pageY - moverHeight + 3, moverWidth - 6, moverHeight - 6)
                hintContext.clearRect(0, 0, p.width, p.height)
                moverActive = false
                mouseDownCanvas = false
                canvas.style.cursor = "crosshair"
            }
        }
    }

    function handleMouseUpCanvas(e) {
        if (e.button === 0 && mouseDownCanvas) {
            mouseDownCanvas = false

            if (selectedTool === "rect") {
                context.strokeStyle = colorValue
                context.beginPath()
                context.rect(formAnchor.x, formAnchor.y, e.pageX - formAnchor.x, e.pageY - formAnchor.y)
                context.lineWidth = strokeWidthSliderValue
                context.stroke()
                lastActions.push(new Action(ActionType.drawRect, new Position(formAnchor.x, formAnchor.y), new Position(e.pageX - formAnchor.x, e.pageY - formAnchor.y), strokeWidthSliderValue))

            } else if (selectedTool === "circle") {
                context.strokeStyle = colorValue
                context.beginPath()
                let radius = (e.pageX - formAnchor.x) / 2
                let yRad = (e.pageY - formAnchor.y) / 2
                context.arc(formAnchor.x + radius, formAnchor.y + yRad, Math.abs(radius), 0, 2 * Math.PI, false)
                context.lineWidth = strokeWidthSliderValue
                context.stroke()
                lastActions.push(new Action(ActionType.drawCircle, new Position(formAnchor.x + radius, formAnchor.y + yRad), new Position(radius, yRad), strokeWidthSliderValue))

            } else if (selectedTool === "selector") {
                context.clearRect(formAnchor.x, formAnchor.y, e.pageX - formAnchor.x, e.pageY - formAnchor.y)
            } else if (selectedTool === "line") {
                context.strokeStyle = colorValue
                context.beginPath()
                context.lineWidth = strokeWidthSliderValue
                context.moveTo(formAnchor.x, formAnchor.y)
                context.lineTo(e.pageX, e.pageY)
                context.stroke()
                context.moveTo(0, 0)
                lastActions.push(new Action(ActionType.drawLine, new Position(formAnchor.x, formAnchor.y), new Position(e.pageX, e.pageY), strokeWidthSliderValue))

            } else if (selectedTool === "mover") {
                canvas.style.cursor = "move"
                moverActive = true
                moverWidth = e.pageX - formAnchor.x
                moverHeight = e.pageY - formAnchor.y
            }
        }

        if (selectedTool !== "text") {
            hintContext.clearRect(0, 0, p.width, p.height)
        } else {
            textInput.focus()
        }
    }

    function handleMouseMove(e) {
        let mouseX = e.pageX
        let mouseY = e.pageY

        if (selectedTool === "pencil" || selectedTool === "eraser") {
            hintContext.clearRect(0, 0, p.width, p.height)
            hintContext.beginPath()
            hintContext.fillStyle = colorValue
            hintContext.arc(mouseX, mouseY, strokeWidthSliderValue, 0, 2 * Math.PI, false)
            hintContext.fill()
        }

        if (mouseDownMenuBar) {

            setMenuBarLeft(mouseX - mouseMenuBarOffsetX)
            setMenuBarTop(mouseY - mouseMenuBarOffsetY)
        } else if (mouseDownCanvas) {
            hintContext.clearRect(0, 0, p.width, p.height)
            if (selectedTool === "pencil" || selectedTool === "eraser") {
                context.fillStyle = selectedTool !== "eraser" ? colorValue : eraserColor

                lastPositions.push(new Position(mouseX, mouseY))

                lastMouse = Date.now()
            } else if (selectedTool === "rect" || selectedTool === "circle" || selectedTool === "selector" || selectedTool === "line" || selectedTool === "mover") {
                hintContext.strokeStyle = colorValue
                hintContext.lineWidth = strokeWidthSliderValue

                if (selectedTool === "selector") {
                    hintContext.setLineDash([10, 15])
                    hintContext.lineWidth = 3
                    hintContext.strokeStyle = "rgb(200, 0, 0)"
                } else if (selectedTool === "mover") {
                    hintContext.setLineDash([10, 15])
                    hintContext.lineWidth = 3
                    hintContext.strokeStyle = "rgb(0, 0, 0)"
                } else {
                    hintContext.setLineDash([])
                }

                hintContext.beginPath()

                if (selectedTool === "rect" || selectedTool === "selector" || selectedTool === "mover") {
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
        } else if (moverActive) {
            hintContext.clearRect(0, 0, p.width, p.height)

            hintContext.drawImage(canvas, formAnchor.x, formAnchor.y, moverWidth, moverHeight, e.pageX - moverWidth, e.pageY - moverHeight, moverWidth, moverHeight)
        }
    }

    function onExportButtonClick(e) {

        let tempCanvas = document.createElement("canvas")
        tempCanvas.width = p.width
        tempCanvas.height = p.height
        let tempContext = tempCanvas.getContext("2d")
        tempContext.fillStyle = "rgb(255, 255, 255)"
        tempContext.fillRect(0, 0, p.width, p.height)
        tempContext.drawImage(canvas, 0, 0, p.width, p.height, 0, 0, p.width, p.height)

        context.drawImage(tempCanvas, 0, 0, p.width, p.height, 0, 0, p.width, p.height)

        let img = canvas.toDataURL("image/png")
        let image = new Image()
        image.src = "data:image/png;base64," + img
        downLink.href = img
        if(nameInput !== "") {
            downLink.download = nameInput + ".png"
        }
        else {
            downLink.download = "export.png"
        }
        downLink.click()
    }

    function onSaveButtonClick() {
        let img = canvas.toDataURL("image/png")
        let blob = new Blob([img], {type: "text/plain"})
        var url = URL.createObjectURL(blob)
        downLink.href = url
        if(nameInput !== "") {
            downLink.download = nameInput + ".redraw"
        }
        else {
            downLink.download = "save.redraw"
        }
        downLink.click()
    }


    function handleToolChange(e) {
        setShowTextInput(false)
        hintContext.clearRect(0, 0, p.width, p.height)
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
        } else if(e.target.value === "text") {
            setStrokeWidthSliderValue(lastStrokeWidthText)
            strokeWidth = lastStrokeWidthText
        }
    }

    return (

        <div onMouseMove={e => handleMouseMove(e)} style={{overflow: "unset", display: p.show}}>
            <canvas id="canvas" style={{backgroundColor: "rgb(255, 255, 255)", cursor: "crosshair"}}
                    width={p.width}
                    height={p.height}
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
                    width={p.width}
                    height={p.height}
            >
            </canvas>

            <input autoFocus name={"textInput"} id={"textInput"} type={"text"} style={{
                display: (showTextInput ? "block" : "none"),
                position: "absolute",
                top: textInputY,
                left: textInputX,
                fontSize: strokeWidthSliderValue + "px",
                fontFamily: "sans-serif"
            }} onKeyDown={e => {
                if (e.key === "Enter") {
                    mouseDownCanvas = false
                    context.font = strokeWidthSliderValue + "px sans-serif"
                    context.textAlign = "center"
                    context.fillText(textInput.value, formAnchor.x, formAnchor.y + 10)
                    setShowTextInput(false)
                    hintContext.clearRect(0, 0, p.width, p.height)

                    let action = new Action(ActionType.drawText, new Position(formAnchor.x, formAnchor.y + 10), new Position(0, 0), strokeWidthSliderValue)
                    action.text = textInput.value
                    lastActions.push(action)

                    textInput.value = ""
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

                     hintContext.clearRect(0, 0, p.width, p.height)
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
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 20
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 15,
                            boxShadow: "0 0 5px gray",
                            padding: 10,
                            pointerEvents: "auto"
                        }} onClick={() => {
                            if(lastActions.length > 0) {
                                let current = lastActions.pop()
                                console.log(lastActions)
                                context.strokeStyle = eraserColor
                                context.lineWidth = current.strokeWidth + 2
                                if (current.actionType === ActionType.drawLine) {
                                    context.beginPath()
                                    context.moveTo(current.anchor.x, current.anchor.y)
                                    context.lineTo(current.info.x, current.info.y)
                                    context.stroke()
                                    context.moveTo(0, 0)
                                }
                                else if(current.actionType === ActionType.drawRect) {
                                    context.beginPath()
                                    context.rect(current.anchor.x, current.anchor.y, current.info.x, current.info.y)
                                    context.stroke()
                                }
                                else if(current.actionType === ActionType.drawCircle) {
                                    context.beginPath()
                                    context.arc(current.anchor.x, current.anchor.y, Math.abs(current.info.x), 0, 2 * Math.PI, false)
                                    context.stroke()
                                }
                                else if(current.actionType === ActionType.drawText) {
                                    context.fillStyle = eraserColor
                                    context.font = current.strokeWidth + "px sans-serif"
                                    context.textAlign = "center"
                                    context.lineWidth = 2
                                    context.fillText(current.text, current.anchor.x, current.anchor.y)
                                    context.strokeText(current.text, current.anchor.x, current.anchor.y)
                                }
                            }
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                                <path fill-rule="evenodd"
                                      d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                                <path
                                    d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                            </svg>
                        </div>

                        <input type={"text"} placeholder={"Enter Name"} style={{
                            borderWidth: 0,
                            boxShadow: "0 0 5px gray",
                            borderRadius: 15,
                            padding: 10,
                            pointerEvents: "auto"
                        }} value={nameInput} onChange={e => {
                            setNameInput(e.currentTarget.value)
                        }}/>
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
                            alignItems: "flex-start",
                            pointerEvents: "none"
                        }}>

                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center"
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

                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 10
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-arrows-move" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd"
                                              d="M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10zM.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8z"/>
                                    </svg>
                                    <input type={"radio"} value={"mover"} name={"tool"}
                                           style={{width: 20, height: 20, pointerEvents: "auto"}}
                                           checked={selectedTool === "mover"} onChange={e => {
                                        handleToolChange(e)
                                    }}/>
                                </div>

                                {/*Color Selector*/}
                                <input type={"color"}
                                       style={{
                                           pointerEvents: "auto",
                                           borderWidth: 0,
                                           borderRadius: 5,
                                           boxShadow: "0 0 5px gray",
                                           marginLeft: 20,
                                           marginRight: 40

                                       }} onChange={e => {
                                    setColorValue(e.target.value)
                                }} value={colorValue}/>
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
                                else if(selectedTool === "text") {
                                    lastStrokeWidthText = strokeWidth
                                }

                            }} style={{
                                pointerEvents: "auto",
                                display: ((selectedTool === "selector" || selectedTool === "mover") ? "none" : "block")
                            }}/>
                            <p style={{
                                userSelect: "none",
                                marginLeft: 60,
                                display: ((selectedTool === "selector" || selectedTool === "mover") ? "none" : "block")
                            }}>{strokeWidthSliderValue}</p>
                        </div>


                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 5
                        }}>

                            {/*save button*/}
                            <button style={{
                                padding: 10,
                                backgroundColor: "white",
                                borderRadius: 15,
                                marginLeft: 10,
                                boxShadow: "0 0 5px gray",
                                borderWidth: 0,
                                width: 100,
                                height: 60,
                                pointerEvents: "auto"
                            }}
                                    onClick={onSaveButtonClick}>
                                Download Save
                            </button>


                            {/*export button*/}
                            <button style={{
                                padding: 10,
                                backgroundColor: "white",
                                borderRadius: 15,
                                marginLeft: 10,
                                boxShadow: "0 0 5px gray",
                                borderWidth: 0,
                                width: 100,
                                height: 60,
                                pointerEvents: "auto"
                            }}
                                    onClick={onExportButtonClick}>
                                Export
                            </button>

                            {/*home button*/}
                            <button style={{
                                padding: 10,
                                backgroundColor: "white",
                                borderRadius: 15,
                                marginLeft: 10,
                                boxShadow: "0 0 5px gray",
                                borderWidth: 0,
                                width: 100,
                                height: 60,
                                pointerEvents: "auto"
                            }}
                                    onClick={() => {
                                        let save = canvas.toDataURL("image/png")
                                        let arrString = localStorage.getItem("save")
                                        if (arrString !== null) {
                                            let json = JSON.parse(arrString)
                                            if (p.loadInId === -1) {
                                                json.arr.push(new Save(save, nameInput))
                                                localStorage.setItem("save", JSON.stringify(json))
                                            } else {

                                                for(let i = 0; i < json.arr.length; i++) {

                                                    if(parseInt(json.arr[i].id) === p.loadInId) {
                                                        json.arr[i] = new Save(save, nameInput)
                                                        localStorage.setItem("save", JSON.stringify(json))
                                                        break
                                                    }
                                                }
                                            }
                                        } else {
                                            let json = {
                                                arr: [new Save(save, nameInput)]
                                            }
                                            localStorage.setItem("save", JSON.stringify(json))
                                        }
                                        window.location.reload()
                                    }}>
                                Save / Home
                            </button>

                            {/*home button*/}
                            <button style={{
                                padding: 10,
                                backgroundColor: "white",
                                borderRadius: 15,
                                marginLeft: 10,
                                boxShadow: "0 0 5px gray",
                                borderWidth: 0,
                                width: 100,
                                height: 60,
                                pointerEvents: "auto"
                            }}
                                    onClick={() => {
                                        window.location.reload()
                                    }}>
                                Discard / Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
