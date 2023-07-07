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
                            textAlign: "center",
                            flexDirection: "column"
                        }} onClick={(f) => {
                            if(f.target === f.currentTarget) {
                                p.onLoadIn(e.content, e.id)
                            }
                        }}><p style={{userSelect: "none", pointerEvents: "none"}}>{e.name}</p>
                        <button style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 5,
                            background: "rgba(0, 0, 0, 0)",
                            borderWidth: 0,
                            borderRadius: 5,
                            boxShadow: "0 0 5px gray"
                        }} onClick={() => {
                            let saves = JSON.parse(localStorage.getItem("save"))
                            let arr = saves.arr
                            let newArr = []
                            for(let i = 0; i < arr.length; i++) {
                                if(arr[i].id !== e.id) {
                                    newArr.push(arr[i])
                                }
                                localStorage.setItem("save", JSON.stringify({arr: newArr}))
                                setSaves(newArr)
                            }
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                <path
                                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                            </svg></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}