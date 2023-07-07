import {useEffect} from "react";

let inputWidth, inputHeight

export default function StartForm(p) {

    useEffect(() => {
        if(p.show !== "none") {
            inputWidth = document.getElementById("inputWidth")
            inputHeight = document.getElementById("inputHeight")
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
            alignItems: "center"
        }}>
            <div style={{
                width: 800,
                height: 600,
                borderRadius: 15,
                boxShadow: "0 0 5px gray",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                alignItems: "center"
            }}>
                <h2>Welcome To ReDraw</h2>

                <h3>Specify your drawing canvas width and height</h3>

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
                           }}>Create</button>
                </div>

                <h4>Please note that ReDraw is still in beta and will not guarantee correctness</h4>
            </div>
        </div>
    );
}