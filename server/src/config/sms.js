import axios from "axios";

const sendSMS = async ({ phoneNumber, message }) => {
    const response = await axios.post(
        "https://api.brevo.com/v3/transactionalSMS/sms",
        {
            sender: "AgriLink",
            recipient: phoneNumber,
            content: message
        },
        {
            headers: {
                accept: "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            }
        }
    );

    return response.data;
};

export default sendSMS;