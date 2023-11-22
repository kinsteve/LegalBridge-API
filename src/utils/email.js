import nodemailer from 'nodemailer';


const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            // service: 'gmail',
            port: 25,
            // secure: true,
            auth: {
                user: 'adf2c78d349723',
                pass: '603627a6865b71',
                
            },
        });

        await transporter.sendMail({
            from: 'support@legalBridge.com',
            to: email,
            subject: subject,
            text: text,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

export default sendEmail;