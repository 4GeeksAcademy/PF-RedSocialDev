import React, { useState } from "react"
import isotipo from "../assets/img/isotipo.png";
export const Contact = () => {
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        subject: "",
        message: "",
    })

    const handleSubmit = (e) => {
        e.preventDefault(); //para que no haga refresh cada vez que hundimos send

        fetch("http://localhost:3001/api/contact", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json()
            })
            .then(data => {
                alert("Thank you for your message! It was sent successfully and we'll reply as soon as possible:)");

                setFormData({ //para que se vuelva a poner igual
                    fullname: "",
                    email: "",
                    subject: "",
                    message: "",
                })
            })
            .catch(error => {
                console.error("Something went wrong. Could not send message:", error)
                alert("Oh no! We couldn't send your message, please try again.")
            })
        // console.log("Message would have been submitted if we had the email connected:", formData)

        // alert("Thank you for your message!")

    }
    return (
        <>
            <div className="d-flex align-items-center justify-content-center vh-100"
                style={{ backgroundColor: "#464469" }}>

                <form className="px-5 py-5 mx-0" style={{ backgroundColor: "#0d0d0d", color: "#7975B1" }} onSubmit={handleSubmit}>
                    <div className="text-center">
                        <img src={isotipo} alt="GitWise logo" width="70" />
                        <h4 className="mt-3">Contact Us</h4>
                    </div>

                    <div className="form-group fs-4">
                        <label for="exampleFormControlInput1">Full name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.fullname}
                            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="form-group fs-4">
                        <label for="exampleFormControlInput1">Your email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <div className="form-group fs-4">
                        <label for="exampleFormControlInput1">Subject</label>
                        <input
                            type="Subject"
                            className="form-control"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Questions about Premium / Technical issue / Constructive feedback"
                            required
                        />
                    </div>
                    <div className="form-group fs-4">
                        <label for="exampleFormControlTextarea1">Your message:</label>
                        <textarea
                            className="form-control"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows="6"
                            required
                        ></textarea>
                    </div>
                    <br />
                    <button type="submit" className="btn btn-gitwise submit">
                        Send
                    </button>
                </form>
            </div >
        </>
    )
}