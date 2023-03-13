const nodemailer = require("nodemailer");

const sendEmail = async option => {
    //1.) Create a transporter
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "641fed81f79735",
          pass: "c81007aadc7aa3"
        }
    });

     //2)) Define the email option
     const mailOption = {
        from : "Domner Team <support@domner.com>",
        to: option.email,
        subject: option.subject,
        text: option.message,
        // html:
    }

    //3)) Actually send the email 
    await transporter.sendMail(mailOption);
}

module.exports  = sendEmail;