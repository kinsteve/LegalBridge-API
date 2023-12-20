import nodemailer from 'nodemailer';


const sendEmail = async (email, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            // host: 'sandbox.smtp.mailtrap.io',
            service: 'gmail',
            // port: 2525,
            // secure: true,
            auth: {
                // user: 'adf2c78d349723',
                // pass: '603627a6865b71',
                user: process.env.GMAIL,
                pass: process.env.MAIL_PASS,
                
            },
        });

        await transporter.sendMail({
            from: 'support@legalBridge.com',
            to: email,
            subject: subject,
            html: html,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log("email not sent",error.message);
    }
};

export default sendEmail;
// import nodemailer from 'nodemailer';


// const sendEmail = async (email, subject, text) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             host: 'sandbox.smtp.mailtrap.io',
//             // service: 'gmail',
//             port: 2525,
//             // secure: true,
//             auth: {
//                 user: 'adf2c78d349723',
//                 pass: '603627a6865b71',
                
//             },
//         });

//         await transporter.sendMail({
//             from: 'support@legalBridge.com',
//             to: email,
//             subject: subject,
//             text: text,
//         });

//         console.log("email sent sucessfully");
//     } catch (error) {
//         console.log("email not sent",error.message);
//     }
// };

// export default sendEmail;