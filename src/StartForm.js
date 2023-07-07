import {useEffect, useState} from "react";

let inputWidth, inputHeight

export default function StartForm(p) {

    const [saves, setSaves] = useState([])

    useEffect(() => {
        if (p.show !== "none") {
            inputWidth = document.getElementById("inputWidth")
            inputHeight = document.getElementById("inputHeight")
        }

        let saveString = localStorage.getItem("save")

        if (saveString !== null) {
            setSaves(JSON.parse(saveString).arr)
        }
    }, [])

    useEffect(() => {
        let body = document.querySelector("body")
        body.style.background = "white"
    })

    return (
        <div style={{
            display: p.show,
            width: "100vw",
            height: "100vh",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <div style={{
                padding: 30,
                borderRadius: 15,
                boxShadow: "0 0 5px gray",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                alignItems: "center",
                gap: 20
            }}>
                <h2 style={{userSelect: "none"}}>Welcome To ReDraw</h2>

                <h3 style={{userSelect: "none"}}>Specify your drawing canvas width and height</h3>

                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 20
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 20
                    }}>
                        <input id={"inputWidth"} name={"dim"} type={"number"} placeholder={"Width"}
                               style={{boxShadow: "0 0 5px gray", borderWidth: 0, borderRadius: 15, padding: 10}}
                               required={true}></input>
                        <input id={"inputHeight"} name={"dim"} type={"number"} placeholder={"Height"}
                               style={{boxShadow: "0 0 5px gray", borderWidth: 0, borderRadius: 15, padding: 10}}
                               required={true}></input>
                    </div>
                    <button onClick={() => {
                        if (inputWidth.value !== "" && inputHeight.value !== "") {
                            p.onCreateCanvas(inputWidth, inputHeight)
                        }
                    }}
                            style={{
                                boxShadow: "0 0 5px gray",
                                borderWidth: 0,
                                borderRadius: 15,
                                padding: 10,
                                background: "rgba(0, 0, 0, 0)"
                            }}>Create
                    </button>
                </div>

                <h3 style={{userSelect: "none"}}>Recent:</h3>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    alignContent: "center",
                    justifyItems: "center",
                    gap: 5
                }}>
                    {saves.map(e => (
                        <div style={{
                            padding: 10,
                            borderRadius: 15,
                            boxShadow: "0 0 5px gray",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center"
                        }} onClick={() => {
                            p.onLoadIn(e.content, e.id)
                        }}><p style={{userSelect: "none", pointerEvents: "none"}}>{e.name}</p></div>
                    ))}
                </div>
            </div>
        </div>
    );
}